import { describe, expect, it } from "vitest";
import { classify } from "../lib/classifier";
import type { Epoch } from "../lib/types";
import { mulberry32, gauss } from "../lib/stats";

function makeEpochs(vMmYr: number, ampMm: number, sigma: number, seed: number): Epoch[] {
  const rnd = mulberry32(seed);
  const start = Date.parse("2025-08-01");
  const out: Epoch[] = [];
  for (let i = 0; i < 14; i++) {
    const day = start + i * 28 * 86400000;
    const tDays = day / 86400000;
    const omega = (2 * Math.PI) / 365.25;
    out.push({
      date: new Date(day).toISOString().slice(0, 10),
      displacementMm: vMmYr * (i * 28 / 365.25) + ampMm * Math.sin(omega * tDays) + gauss(rnd) * sigma,
      sigmaMm: sigma,
    });
  }
  return out;
}

describe("classifier", () => {
  it("labels a strong subsidence bowl correctly", () => {
    const result = classify(makeEpochs(-28, 9, 3, 11));
    expect(result.predicted).toBe("subsidence-bowl");
  });

  it("produces a valid probability distribution", () => {
    const result = classify(makeEpochs(-12, 11, 3.5, 12));
    const sum = result.dist.reduce((s, d) => s + d.p, 0);
    expect(sum).toBeCloseTo(1, 1);
    expect(result.dist[0].p).toBeGreaterThanOrEqual(result.dist[result.dist.length - 1].p);
    expect(result.dist).toHaveLength(4);
  });

  it("assigns low scores to atmospheric artifacts for a clean signal", () => {
    const result = classify(makeEpochs(-28, 9, 3, 13));
    const artifact = result.dist.find((d) => d.cls === "atmospheric-artifact")!;
    expect(artifact.p).toBeLessThan(0.2);
  });
});
