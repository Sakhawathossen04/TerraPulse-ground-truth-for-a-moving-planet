/* Diagnostic: regenerate mexico-city epochs and check Theil-Sen slope vs truth. */
import { buildAoi, AOI_SPECS } from "../data/registry";
import { theilSen, parseIso, perDayToPerYear } from "../lib/stats";

const spec = AOI_SPECS[0];
const aoi = buildAoi(spec);
console.log("true velocity:", spec.trueVelocityMmYr);
console.log("epochs:");
for (const e of aoi.epochs) console.log(" ", e.date, e.displacementMm.toFixed(2), "±" + e.sigmaMm);
const t = aoi.epochs.map((e) => parseIso(e.date));
const y = aoi.epochs.map((e) => e.displacementMm);
const fit = theilSen(t, y);
console.log("slope mm/yr:", perDayToPerYear(fit.slopePerDay).toFixed(2));
console.log("CI:", perDayToPerYear(fit.lo95PerDay).toFixed(2), perDayToPerYear(fit.hi95PerDay).toFixed(2));

// Expected displacement at last epoch from truth:
const t0 = t[0];
const tLast = t[t.length - 1];
console.log("expected last displacement (truth):", (spec.trueVelocityMmYr * (tLast - t0)) / 365.25);
