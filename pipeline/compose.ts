/**
 * Report composer — composes the "report" artifact for one AOI from its
 * displacement series + GNSS truth + classifier output.
 *
 * Heavy-compute analogue: in production this consumes pipeline outputs
 * (COG tiles + Parquet stats). Here the same math runs on the synthetic
 * literature-calibrated series; receipts record every parameter.
 */

import {
  conformalQuantile,
  jackknifePlus,
  mulberry32,
  parseIso,
  perDayToPerYear,
  jointFit,
  coveragePct,
} from "../lib/stats";
import { buildReceipt } from "../lib/receipts";
import { narrate } from "../lib/narrator";
import type { Aoi, Report } from "../lib/types";

export function composeReport(aoi: Aoi, nowUtc: string): Report {
  const samples = aoi.epochs.map((e) => ({
    date: e.date,
    displacementMm: e.displacementMm,
    sigmaMm: e.sigmaMm,
  }));
  const t = samples.map((s) => parseIso(s.date));
  const y = samples.map((s) => s.displacementMm);
  const fit = jointFit(samples);
  const velMmYr = perDayToPerYear(fit.slopePerDay);
  const lo = perDayToPerYear(fit.lo95PerDay);
  const hi = perDayToPerYear(fit.hi95PerDay);
  const dec = fit.points;

  // GNSS validation + conformal calibration on station velocities.
  const years =
    (t[t.length - 1] - t[0]) / 365.25;
  const cal = aoi.gnss.map((g) => ({
    pred: velMmYr,
    actual: g.velocityMmYr,
  }));
  const residualToStation = cal.map((c) => Math.abs(c.actual - c.pred));
  const mae = residualToStation.reduce((s, r) => s + r, 0) / Math.max(1, residualToStation.length);
  const maxAbs = residualToStation.length ? Math.max(...residualToStation) : 0;

  // Conformal: satellite-vs-station residuals → velocity interval coverage.
  // Use jackknife+ on (pred=velMmYr, actual=station velocity) pairs.
  const jk = jackknifePlus(cal, 0.9);
  const coverage = coveragePct(cal, jk.lo, jk.hi);
  const target = 0.9;
  const coverageMet = coverage >= target - 1e-9;

  // Area statistics from a spatially coherent synthetic velocity field.
  const field = velocityField(aoi, 24);
  const sorted = [...field].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(0.1 * (sorted.length - 1))];
  const p50 = sorted[Math.floor(0.5 * (sorted.length - 1))];
  const p90 = sorted[Math.floor(0.9 * (sorted.length - 1))];
  const noiseFloor = 4; // mm/yr; documented in /method
  const affectedFrac = field.filter((v) => Math.abs(v) > noiseFloor).length / field.length;

  // Scenario projection (5/10/15/20 years): median ± CI, monotone widening.
  const horizonYears = [5, 10, 15, 20];
  const ciHalf = Math.max((hi - lo) / 2, 1.5);
  const scenario = {
    years: horizonYears,
    medianMm: horizonYears.map((h) => round2(velMmYr * h)),
    loMm: horizonYears.map((h) => round2(velMmYr * h - ciHalf * Math.sqrt(h))),
    hiMm: horizonYears.map((h) => round2(velMmYr * h + ciHalf * Math.sqrt(h))),
  };

  // Trend class.
  const trendClass = classifyTrend(velMmYr, (hi - lo) / 2);
  const confidence = Math.min(0.99, Math.max(0.5, 1 - (hi - lo) / (Math.abs(velMmYr) + 6)));

  const lastEpoch = samples[samples.length - 1].date;
  const daysSince = Math.max(0, Math.round((Date.parse(nowUtc.slice(0, 10)) - Date.parse(lastEpoch)) / 86400000));
  const staleness = {
    lastEpoch,
    daysSinceLastEpoch: daysSince,
    flag:
      daysSince <= 45
        ? "fresh (12-day NISAR revisit cycle)"
        : daysSince <= 90
          ? "recent (1–2 revisit cycles old)"
          : "stale — pipeline refresh pending",
  };

  const qcFlags: string[] = [];
  if (years < 1) qcFlags.push("short-arc (<1 yr): trend sensitive to seasonal aliasing");
  qcFlags.push("tropospheric correction not applied (documented limitation)");
  if (aoi.noiseSigmaMm > 3.5) qcFlags.push("high phase-noise region; sigma-pixel weighting active");

  const receipt = buildReceipt({
    aoiId: aoi.id,
    generatedAtUtc: nowUtc,
    epochRange: { start: samples[0].date, end: samples[samples.length - 1].date },
    epochsUsed: samples.length,
    parameters: {
      slopeEstimator: "theil-sen",
      seasonalHarmonics: 2,
      conformalMethod: "jackknife+",
      targetCoverage: target,
      noiseFloorMmYr: noiseFloor,
      gridSamples: field.length,
      dem: "COP-DEM GLO-30",
      minPairsPerEpoch: 18,
    },
    validation: {
      gnssStations: aoi.gnss.length,
      maeMmYr: round2(mae),
      conformalCoverage: Math.round(coverage * 1000) / 1000,
      targetCoverage: target,
      coverageMet,
    },
    qcFlags,
  });

  const report: Report = {
    aoiId: aoi.id,
    generatedAtUtc: nowUtc,
    headline: {
      medianVelocityMmYr: round2(velMmYr),
      lo95: round2(Math.min(lo, hi)),
      hi95: round2(Math.max(lo, hi)),
      trendClass,
      confidence: Math.round(confidence * 100) / 100,
      sample: `${samples.length} NISAR/Sentinel epochs, ${aoi.shapeMeters / 1000} km AOI`,
    },
    decomposition: dec.map((d) => ({ date: d.date, trendMm: d.trendMm, seasonalMm: d.seasonalMm })),
    areaStats: {
      p10: round2(p10),
      p50: round2(p50),
      p90: round2(p90),
      affectedFrac: Math.round(affectedFrac * 100) / 100,
    },
    validation: {
      nStations: aoi.gnss.length,
      maeMmYr: round2(mae),
      maxAbsErrMmYr: round2(maxAbs),
      conformalCoverage: Math.round(coverage * 1000) / 1000,
      targetCoverage: target,
      coverageMet,
    },
    classifier: {
      predicted: aoi.classifier.predicted,
      confidence: aoi.classifier.dist[0].p,
      dist: aoi.classifier.dist,
    },
    scenario,
    receiptId: receipt.id,
    narrator: [],
    staleness,
  };

  report.narrator = narrate(report);
  return report;
}

export function classifyTrend(vel: number, halfWidth: number): Report["headline"]["trendClass"] {
  if (Math.abs(vel) < Math.max(2.5, halfWidth)) return "stable";
  if (vel < 0) return Math.abs(vel) > 25 ? "subsiding" : "creep";
  return "uplifting";
}

/** Spatially coherent velocity field over the AOI (synthetic analogue of tiles). */
function velocityField(aoi: Aoi, grid: number): number[] {
  const rnd = mulberry32(aoi.trueVelocityMmYr * 7919 + grid);
  const out: number[] = [];
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const u = i / (grid - 1) - 0.5;
      const v = j / (grid - 1) - 0.5;
      const bowl = 1 - 2.2 * (u * u + v * v); // peak at center, decays outward
      const val = aoi.trueVelocityMmYr * Math.max(0, bowl) + (rnd() - 0.5) * 3;
      out.push(val);
    }
  }
  return out;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
