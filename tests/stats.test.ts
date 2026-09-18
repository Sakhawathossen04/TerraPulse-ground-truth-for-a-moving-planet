import { describe, expect, it } from "vitest";
import {
  conformalQuantile,
  coveragePct,
  decompose,
  gauss,
  jackknifePlus,
  jointFit,
  mulberry32,
  normInv,
  parseIso,
  perDayToPerYear,
  theilSen,
  type TsSample,
} from "../lib/stats";

describe("theilSen", () => {
  it("recovers an exact linear slope", () => {
    const t = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const y = t.map((x) => 3 + 0.5 * x);
    const fit = theilSen(t, y);
    expect(fit.slopePerDay).toBeCloseTo(0.5, 10);
    expect(fit.intercept).toBeCloseTo(3, 6);
    expect(fit.lo95PerDay).toBeLessThanOrEqual(0.5);
    expect(fit.hi95PerDay).toBeGreaterThanOrEqual(0.5);
  });

  it("is robust to a gross outlier", () => {
    const t = [0, 1, 2, 3, 4, 5, 6, 7];
    const y = t.map((x) => 2 * x);
    y[4] = 500; // corrupted epoch
    const fit = theilSen(t, y);
    expect(Math.abs(fit.slopePerDay - 2)).toBeLessThan(0.5);
  });
});

describe("normInv", () => {
  it("inverts the standard normal CDF", () => {
    expect(normInv(0.975)).toBeCloseTo(1.959964, 3);
    expect(normInv(0.5)).toBeCloseTo(0, 4);
    expect(normInv(0.025)).toBeCloseTo(-1.959964, 3);
  });
});

function synthSeries(vMmYr: number, ampMm: number, sigma: number, seed: number, nDays = 730): TsSample[] {
  const rnd = mulberry32(seed);
  const start = parseIso("2025-08-01");
  const out: TsSample[] = [];
  for (let i = 0; i < 24; i++) {
    const day = start + (i * nDays) / 23;
    const omega = (2 * Math.PI) / 365.25;
    const seasonal = ampMm * Math.sin(omega * day + 0.8);
    out.push({
      date: new Date(day * 86400000).toISOString().slice(0, 10),
      displacementMm: vMmYr * ((day - start) / 365.25) + seasonal + gauss(rnd) * sigma,
      sigmaMm: sigma,
    });
  }
  return out;
}

describe("jointFit", () => {
  it("recovers velocity within CI on a seasonal arc", () => {
    const samples = synthSeries(-20, 10, 2, 42);
    const fit = jointFit(samples);
    const v = perDayToPerYear(fit.slopePerDay);
    expect(v).toBeGreaterThan(-26);
    expect(v).toBeLessThan(-14);
    const lo = perDayToPerYear(fit.lo95PerDay);
    const hi = perDayToPerYear(fit.hi95PerDay);
    expect(lo).toBeLessThanOrEqual(-20);
    expect(hi).toBeGreaterThanOrEqual(-20);
  });

  it("decomposes trend and seasonal cleanly", () => {
    const samples = synthSeries(0, 12, 0.001, 7); // pure seasonal, no noise
    const dec = decompose(samples);
    const amp = Math.max(...dec.map((d) => d.seasonalMm)) - Math.min(...dec.map((d) => d.seasonalMm));
    expect(amp).toBeGreaterThan(20); // ≈ 24 = 2×12
    expect(amp).toBeLessThan(28);
    // Residuals should be ~0 with no noise.
    for (const d of dec) expect(Math.abs(d.residualMm)).toBeLessThan(0.5);
  });
});

describe("conformal calibration", () => {
  it("meets the coverage target on synthetic residuals", () => {
    const rnd = mulberry32(1234);
    const cal = Array.from({ length: 500 }, () => {
      const actual = gauss(rnd) * 10;
      return { pred: actual + gauss(rnd) * 2, actual };
    });
    const q = conformalQuantile(cal, 0.9);
    const lo = (p: number) => p - q;
    const hi = (p: number) => p + q;
    const cov = coveragePct(cal, lo, hi);
    expect(cov).toBeGreaterThanOrEqual(0.85);
    expect(cov).toBeLessThanOrEqual(0.95);
  });

  it("jackknife+ interval widens with small n (finite-sample correction)", () => {
    const small = [
      { pred: 1, actual: 1.5 },
      { pred: 1, actual: 0.4 },
      { pred: 1, actual: 1.1 },
    ];
    const big = Array.from({ length: 200 }, (_, i) => ({ pred: 1, actual: 1 + Math.sin(i) * 0.1 }));
    const qSmall = conformalQuantile(small, 0.9);
    const qBig = conformalQuantile(big, 0.9);
    expect(qSmall).toBeGreaterThan(qBig);
    const jk = jackknifePlus(small, 0.9);
    expect(jk.lo(1)).toBeLessThanOrEqual(0.4);
    expect(jk.hi(1)).toBeGreaterThanOrEqual(1.5);
  });
});

describe("perDayToPerYear", () => {
  it("converts correctly", () => {
    expect(perDayToPerYear(1)).toBeCloseTo(365.25, 3);
  });
});
