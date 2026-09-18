# TerraPulse Receipts Spec — v1

*"Receipts or it didn't happen."*

A receipt is a machine-verifiable provenance record attached to every analysis artifact. It answers one
question: **can I reproduce this number, and can I tell if someone changed it?**

## Schema (JSON-LD)

```jsonc
{
  "@context": "https://terrapulse.dev/receipt/v1.jsonld",
  "id": "rcpt-mexico-city-9f2c1a04b7de",          // rcpt-{aoi}-{sha256(aoi:ts)[0..12]}
  "type": "TerraPulseAnalysisReceipt",
  "generatedAtUtc": "2026-09-18T12:00:00.000Z",     // pinned for reproducible builds
  "generator": "terrapulse-pipeline 1.0.0 (node)",
  "aoi": "mexico-city",
  "epochsUsed": 14,
  "epochRange": { "start": "2025-08-01", "end": "2026-07-31" },
  "parameters": {                                   // every knob that affects output
    "slopeEstimator": "theil-sen",
    "seasonalHarmonics": 2,
    "conformalMethod": "jackknife+",
    "targetCoverage": 0.9,
    "noiseFloorMmYr": 4,
    "dem": "COP-DEM GLO-30"
  },
  "inputs": [                                       // datasets + versions + providers
    { "dataset": "NISAR L2 GCOV (provisional)", "provider": "NASA JPL / ISRO via Earthdata CMR", "version": "provisional r2026-07-20" },
    { "dataset": "Sentinel-1 IW SLC", "provider": "Copernicus via Alaska Satellite Facility" },
    { "dataset": "GNSS station velocities", "provider": "Nevada Geodetic Lab (mirror) / EarthScope" },
    { "dataset": "Copernicus DEM GLO-30", "provider": "ESA" }
  ],
  "software": { "terrapulse-pipeline": "1.0.0", "node": "v24.8.0" },
  "validation": {                                   // the trust block
    "gnssStations": 3,
    "maeMmYr": 3.78,
    "conformalCoverage": 1,
    "targetCoverage": 0.9,
    "coverageMet": true
  },
  "qcFlags": [ "tropospheric correction not applied (documented limitation)" ],
  "disclaimer": "Analysis receipt. Numbers are reproducible from the listed inputs, parameters and software.",
  "contentHash": "sha256-hex-of-canonical-body"     // see below
}
```

## Hash protocol

1. Remove `contentHash` from the receipt body.
2. Canonicalize: sort all object keys recursively, no whitespace (`stableStringify`).
3. `contentHash = sha256(canonical)` (hex).

## Verification

- **Receipt page** (`/receipts/[id]`) recomputes the hash server-side and shows ✓/✗.
- **API** (`/api/receipts/[id]`) returns `{ verified, receipt }`.
- **Health** (`/api/health`) verifies every catalog receipt; returns `ok` only if all pass.
- **Tests** mutate a field and assert the mismatch throws.

## Rules

- Receipts are **immutable once published** (content-addressed filenames).
- Every number shown in the UI must be traceable to a receipt or to report JSON derived from one.
- QC flags document what was *not* corrected — silence about limitations is a bug, not a feature.
