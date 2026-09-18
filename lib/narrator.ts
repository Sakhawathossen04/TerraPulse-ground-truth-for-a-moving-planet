/**
 * Constrained report narrator (blueprint §7 guardrail).
 *
 * Hard rule: the narrator may only rephrase numbers that exist in the
 * report JSON. It cannot introduce new figures — tested by
 * tests/narrator.test.ts (numeric fidelity ≥ 99%).
 */

import type { Report } from "./types";

const fmt = (v: number, d = 1) => v.toFixed(d);

function trendPhrase(cls: Report["headline"]["trendClass"], v: number): string {
  switch (cls) {
    case "subsiding":
      return `The ground is subsiding at ${fmt(v)} mm/yr (95% CI as shown).`;
    case "uplifting":
      return `The ground is uplifting at ${fmt(Math.abs(v))} mm/yr (95% CI as shown).`;
    case "creep":
      return `The area shows slow creep of ${fmt(Math.abs(v))} mm/yr (95% CI as shown).`;
    default:
      return `Motion is stable — ${fmt(v)} mm/yr, within measurement noise.`;
  }
}

export function narrate(report: Report): string[] {
  const h = report.headline;
  const v = report.validation;
  const lines: string[] = [];

  lines.push(trendPhrase(h.trendClass, h.medianVelocityMmYr));
  lines.push(
    `Median velocity is ${fmt(h.medianVelocityMmYr, 2)} ± ${fmt((h.hi95 - h.lo95) / 2, 2)} mm/yr (95% CI ${fmt(h.lo95, 2)} to ${fmt(h.hi95, 2)}), computed from ${h.sample}.`
  );
  if (v.nStations > 0) {
    lines.push(
      `GNSS validation: ${v.nStations} stations within the AOI agree with a mean absolute error of ${fmt(v.maeMmYr, 2)} mm/yr (worst ${fmt(v.maxAbsErrMmYr, 2)}).`
    );
    lines.push(
      `Conformal 90% intervals covered ${Math.round(v.conformalCoverage * 100)}% of GNSS check points (target ${Math.round(v.targetCoverage * 100)}%${v.coverageMet ? " — met" : " — not met, flagged"}).`
    );
  } else {
    lines.push("No GNSS stations co-located with this AOI; intervals are model-based only and flagged as unvalidated.");
  }
  lines.push(
    `The classifier labels this signal "${report.classifier.predicted}" with ${Math.round(report.classifier.confidence * 100)}% confidence.`
  );
  lines.push(
    `${Math.round(report.areaStats.affectedFrac * 100)}% of the AOI shows motion beyond the noise floor (p90 ${fmt(report.areaStats.p90, 2)} mm/yr).`
  );
  lines.push(
    `If the trend continues ${report.scenario.years[report.scenario.years.length - 1]} years, projected displacement reaches ${fmt(report.scenario.medianMm[report.scenario.medianMm.length - 1], 1)} mm (95% CI ${fmt(report.scenario.loMm[report.scenario.loMm.length - 1], 1)} to ${fmt(report.scenario.hiMm[report.scenario.hiMm.length - 1], 1)}).`
  );
  lines.push(
    `Last epoch: ${report.staleness.lastEpoch} (${report.staleness.daysSinceLastEpoch} days ago) — ${report.staleness.flag}.`
  );
  return lines;
}
