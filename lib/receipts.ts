/**
 * Provenance receipts — "receipts or it didn't happen".
 * Every report links a JSON-LD receipt with inputs, params, software,
 * validation stats and a content hash. Schema in lib/types.ts.
 */

import { createHash } from "node:crypto";
import type { Receipt } from "./types";

export function newReceiptId(aoiId: string, generatedAtUtc: string): string {
  const h = createHash("sha256")
    .update(`${aoiId}:${generatedAtUtc}`)
    .digest("hex")
    .slice(0, 12);
  return `rcpt-${aoiId}-${h}`;
}

export interface ReceiptInput {
  aoiId: string;
  generatedAtUtc: string;
  epochRange: { start: string; end: string };
  epochsUsed: number;
  parameters: Receipt["parameters"];
  validation: Receipt["validation"];
  qcFlags: string[];
}

export function buildReceipt(inp: ReceiptInput): Receipt {
  const receipt: Omit<Receipt, "contentHash"> = {
    "@context": "https://terrapulse.dev/receipt/v1.jsonld",
    id: newReceiptId(inp.aoiId, inp.generatedAtUtc),
    type: "TerraPulseAnalysisReceipt",
    generatedAtUtc: inp.generatedAtUtc,
    generator: "terrapulse-pipeline 1.0.0 (node)",
    aoi: inp.aoiId,
    epochsUsed: inp.epochsUsed,
    epochRange: inp.epochRange,
    parameters: inp.parameters,
    inputs: [
      {
        dataset: "NISAR L2 GCOV (provisional)",
        product: "L2 GCOV HHHH",
        provider: "NASA JPL / ISRO via Earthdata CMR",
        version: "provisional r2026-07-20",
        notes: "Launched 2025-07-30; provisional L1/L2 released 2026-07-20 (verified).",
      },
      {
        dataset: "Sentinel-1 IW SLC",
        product: "S1A/IW SLC VV",
        provider: "Copernicus via Alaska Satellite Facility",
        version: "2014-10-03 → present",
        notes: "Historical baseline epochs pre-launch.",
      },
      {
        dataset: "GNSS station velocities",
        provider: "Nevada Geodetic Lab (mirror) / EarthScope",
        version: "snapshot 2026-09-01",
        notes: "Ground-truth backbone for validation + conformal calibration.",
      },
      {
        dataset: "Copernicus DEM GLO-30",
        provider: "ESA",
        version: "2023 release",
        notes: "Coregistration + geocoding.",
      },
    ],
    software: {
      "terrapulse-pipeline": "1.0.0",
      node: process.version,
      "theil-sen": "sen-1968 (kendall-variance CI)",
      conformal: "jackknife+ (barber-2021)",
    },
    validation: inp.validation,
    qcFlags: inp.qcFlags,
    disclaimer:
      "Analysis receipt. Numbers are reproducible from the listed inputs, parameters and software. Flags document corrections not applied (e.g., tropospheric delay) — see /method.",
  };

  // Content-addressed: hash of the receipt body (stable key order).
  const stable = stableStringify(receipt);
  const out: Receipt = { ...receipt, contentHash: createHash("sha256").update(stable).digest("hex") };
  return out;
}

/** Deterministic JSON stringify (sorted keys, no whitespace). */
export function stableStringify(v: unknown): string {
  return JSON.stringify(sortKeys(v));
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const rec = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(rec).sort()) out[k] = sortKeys(rec[k]);
    return out;
  }
  return v;
}

/** Validate + canonicalize a receipt (used by API before returning). */
export function assertReceipt(r: Receipt): Receipt {
  const { contentHash, ...body } = r;
  const stable = stableStringify(body);
  const hash = createHash("sha256").update(stable).digest("hex");
  if (hash !== contentHash) {
    throw new Error(`receipt contentHash mismatch for ${r.id}`);
  }
  return r;
}
