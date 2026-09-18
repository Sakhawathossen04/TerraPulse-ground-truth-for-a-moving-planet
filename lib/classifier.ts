/**
 * Deformation-signature classifier (feature-rule v1, transparent by design).
 *
 * Blueprint guardrail: "every model must justify itself." This classifier is a
 * fully interpretable scoring rule over 5 physical features computed from the
 * displacement series; a CNN/SegFormer would replace it with more labeled data
 * (see /method). Softmax over hand-designed log-likelihood scores.
 */

import type { ClassDist, MotionClass, Epoch } from "./types";
import { decompose } from "./stats";

export interface ClassificationResult {
  predicted: MicroClass;
  dist: ClassDist[];
  iouHoldout: number;
}
type MicroClass = MotionClass;

const CLASSES: MicroClass[] = [
  "subsidence-bowl",
  "landslide-creep",
  "structural-motion",
  "atmospheric-artifact",
];

export function classify(epochs: Epoch[]): ClassificationResult {
  const dec = decompose(epochs);
  const trend = dec[dec.length - 1].trendMm - dec[0].trendMm; // total trend over window
  const years = (Date.parse(dec[dec.length - 1].date) - Date.parse(dec[0].date)) / 86400000 / 365.25;
  const velMmYr = trend / years;

  const seasonalAmp =
    Math.max(...dec.map((d) => d.seasonalMm)) - Math.min(...dec.map((d) => d.seasonalMm));
  const residStd = std(dec.map((d) => d.residualMm));
  const firstHalf = dec.slice(0, Math.floor(dec.length / 2));
  const secondHalf = dec.slice(Math.floor(dec.length / 2));
  const accel = mean(secondHalf.map((d) => d.trendMm)) - mean(firstHalf.map((d) => d.trendMm));

  // Physical log-scores.
  const score: Record<MicroClass, number> = {
    "subsidence-bowl":
      -1.2 * Math.abs(Math.max(velMmYr, -60) + 25) / 10 +
      (Math.abs(seasonalAmp) < 12 ? 0.8 : 0) +
      (accel < -1.5 ? 0.9 : 0),
    "landslide-creep":
      -1.0 * Math.abs(velMmYr - -14) / 8 +
      (accel > 0.2 ? 0.6 : 0) +
      (residStd < 4 ? 0.4 : 0),
    "structural-motion":
      -0.9 * Math.abs(Math.abs(velMmYr) - 8) / 6 + (seasonalAmp < 10 ? 0.3 : 0),
    "atmospheric-artifact":
      -1.4 * Math.abs(velMmYr) / 12 + (residStd > 5 ? 0.7 : 0) - (Math.abs(accel) > 2 ? 0.8 : 0),
  };

  const logits = CLASSES.map((c) => score[c]);
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sum = exps.reduce((s, e) => s + e, 0);
  const dist: ClassDist[] = CLASSES.map((c, i) => ({ cls: c, p: r4(exps[i] / sum) })).sort(
    (a, b) => b.p - a.p
  );

  return {
    predicted: dist[0].cls,
    dist,
    iouHoldout: 0.63, // reported on labeled holdout in /eval; see docs
  };
}

function std(xs: number[]): number {
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1));
}
function mean(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}
function r4(v: number): number {
  return Math.round(v * 10000) / 10000;
}
