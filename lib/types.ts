/**
 * TerraPulse core domain types (single source of truth).
 * Receipts, reports and API payloads all validate against these via zod.
 */

import { z } from "zod";

// ---------- Primitives ----------

export const zTrendClass = z.enum([
  "stable",
  "subsiding",
  "uplifting",
  "creep",
]);
export type TrendClass = z.infer<typeof zTrendClass>;

export const zMotionClass = z.enum([
  "subsidence-bowl",
  "landslide-creep",
  "structural-motion",
  "atmospheric-artifact",
]);
export type MotionClass = z.infer<typeof zMotionClass>;

export const zBbox = z.tuple([z.number(), z.number(), z.number(), z.number()]);
export type Bbox = z.infer<typeof zBbox>;

export const zEpoch = z.object({
  date: z.string(),
  displacementMm: z.number(),
  sigmaMm: z.number(),
});
export type Epoch = z.infer<typeof zEpoch>;

export const zClassDist = z.object({
  cls: zMotionClass,
  p: z.number(),
});
export type ClassDist = z.infer<typeof zClassDist>;

// ---------- AOI ----------

export const zAoi = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  story: z.string(),
  flagship: z.boolean(),
  center: z.tuple([z.number(), z.number()]),
  bbox: zBbox,
  /** Literature-calibrated target signal (mm/yr, negative = subsidence). */
  trueVelocityMmYr: z.number(),
  seasonalityAmpMm: z.number(),
  noiseSigmaMm: z.number(),
  exposure: z.object({
    population: z.number(),
    infra: z.number(), // 0..1 infrastructure density index
  }),
  shapeMeters: z.number(),
  epochs: z.array(zEpoch),
  gnss: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      lonLat: z.tuple([z.number(), z.number()]),
      distKm: z.number(),
      velocityMmYr: z.number(),
      sigmaMmYr: z.number(),
    })
  ),
  classifier: z.object({
    predicted: zMotionClass,
    dist: z.array(zClassDist),
    iouHoldout: z.number(),
  }),
});
export type Aoi = z.infer<typeof zAoi>;

// ---------- Receipts (provenance, JSON-LD-ish) ----------

export const zReceipt = z.object({
  "@context": z.literal("https://terrapulse.dev/receipt/v1.jsonld"),
  id: z.string(),
  type: z.literal("TerraPulseAnalysisReceipt"),
  generatedAtUtc: z.string(),
  generator: z.string(),
  aoi: z.string(),
  epochsUsed: z.number(),
  epochRange: z.object({ start: z.string(), end: z.string() }),
  parameters: z.record(z.union([z.string(), z.number(), z.boolean()])),
  inputs: z.array(
    z.object({
      dataset: z.string(),
      product: z.string().optional(),
      provider: z.string(),
      version: z.string(),
      notes: z.string().optional(),
    })
  ),
  software: z.record(z.string()),
  validation: z.object({
    gnssStations: z.number(),
    maeMmYr: z.number(),
    conformalCoverage: z.number(),
    targetCoverage: z.number(),
    coverageMet: z.boolean(),
  }),
  qcFlags: z.array(z.string()),
  disclaimer: z.string(),
  contentHash: z.string(),
});
export type Receipt = z.infer<typeof zReceipt>;

// ---------- Report ----------

export const zValidationStats = z.object({
  nStations: z.number(),
  maeMmYr: z.number(),
  maxAbsErrMmYr: z.number(),
  conformalCoverage: z.number(),
  targetCoverage: z.number(),
  coverageMet: z.boolean(),
});
export type ValidationStats = z.infer<typeof zValidationStats>;

export const zReport = z.object({
  aoiId: z.string(),
  generatedAtUtc: z.string(),
  headline: z.object({
    medianVelocityMmYr: z.number(),
    lo95: z.number(),
    hi95: z.number(),
    trendClass: zTrendClass,
    confidence: z.number(),
    sample: z.string(),
  }),
  decomposition: z.array(
    z.object({ date: z.string(), trendMm: z.number(), seasonalMm: z.number() })
  ),
  areaStats: z.object({
    p10: z.number(),
    p50: z.number(),
    p90: z.number(),
    affectedFrac: z.number(),
  }),
  validation: zValidationStats,
  classifier: z.object({
    predicted: zMotionClass,
    confidence: z.number(),
    dist: z.array(zClassDist),
  }),
  scenario: z.object({
    years: z.array(z.number()),
    medianMm: z.array(z.number()),
    loMm: z.array(z.number()),
    hiMm: z.array(z.number()),
  }),
  receiptId: z.string(),
  narrator: z.array(z.string()),
  staleness: z.object({
    lastEpoch: z.string(),
    daysSinceLastEpoch: z.number(),
    flag: z.string(),
  }),
});
export type Report = z.infer<typeof zReport>;

// ---------- Catalog / watchlist ----------

export const zHeadline = zReport.shape.headline;
export const zExposure = zAoi.shape.exposure;

export const zCatalogEntry = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  story: z.string(),
  flagship: z.boolean(),
  center: z.tuple([z.number(), z.number()]),
  bbox: zBbox,
  epochs: z.number(),
  firstEpoch: z.string(),
  lastEpoch: z.string(),
  headline: zHeadline,
  validation: zValidationStats,
  receiptId: z.string(),
  exposure: zExposure,
  motionScore: z.number(),
  exposureScore: z.number(),
  watchScore: z.number(),
});
export type CatalogEntry = z.infer<typeof zCatalogEntry>;

export const zWatchlistRow = z.object({
  aoiId: z.string(),
  name: z.string(),
  country: z.string(),
  velocityMmYr: z.number(),
  hi95AbsMmYr: z.number(),
  trendClass: zTrendClass,
  affectedFrac: z.number(),
  exposureScore: z.number(),
  watchScore: z.number(),
  receiptId: z.string(),
});
export type WatchlistRow = z.infer<typeof zWatchlistRow>;

// ---------- Agent ----------

export const zPlanStep = z.object({
  tool: z.string(),
  summary: z.string(),
  detail: z.string(),
  params: z.record(z.union([z.string(), z.number(), z.boolean()])),
  ms: z.number(),
});
export type PlanStep = z.infer<typeof zPlanStep>;

export const zAgentPlan = z.object({
  aoiName: z.string(),
  planner: z.string(),
  steps: z.array(zPlanStep),
  totalMs: z.number(),
  receiptRef: z.string().optional(),
  note: z.string().optional(),
});
export type AgentPlan = z.infer<typeof zAgentPlan>;
