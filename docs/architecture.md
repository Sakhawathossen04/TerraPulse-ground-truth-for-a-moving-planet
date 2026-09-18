# TerraPulse — Architecture

## Dataflow

```
registry (AOI specs + truth) 
   → pipeline (deterministic, seeded)
      → artifacts: reports/*.json, receipts/*.json, catalog.json, watchlist.json, tiles/*.json
         → data layer (zod-validated)
            → API routes (dynamic)
               → frontend (atlas / report / watchlist / stories / receipts / method)
```

## Design decisions

### D1. Artifacts-first, not database-first
The heavy "SAR processing" analogue runs offline and writes **versioned JSON artifacts** (the COG/PMTiles +
Parquet pattern of the full design). The API composes them — it never computes science on the request path.
This matches the winning benchmark pattern (heavy compute offline, light compute live) and makes the demo
path nearly unkillable: no DB, no queue, no cold-start solvers.

### D2. Determinism as a feature
Same registry → byte-identical artifacts (`mulberry32` seeded PRNG; pinned generation timestamp). This gives:
reproducible receipts, meaningful golden tests, and an auditable pipeline. The pipeline is the unit of scale —
new AOIs are registry rows, not code.

### D3. Uncertainty as a first-class citizen
Every velocity ships with a 95% CI (Theil–Sen + Sen 1968/Kendall variance) and a **conformal coverage
statement** calibrated on GNSS. Coverage that misses target is flagged in UI, not hidden — honesty is a
design constraint, not a disclaimer.

### D4. Receipts are load-bearing
Receipts are not documentation; they are **verified artifacts**: SHA-256 content hash over the canonical
(sorted-key) JSON body. The receipt page, the API, and `/api/health` all re-verify. Tampering with any field
breaks the hash — demonstrated by test.

### D5. The agent plans, the pipeline disposes
The agent's tool schema ends at the same functions the offline pipeline runs. It cannot invent numbers; its
value is planning + provenance narration. The LLM annotation path is opt-in and removable (graceful
degradation by design).

### D6. Persona-shaped surface
Report page serves Iris (exports, plain-language flags), Watchlist serves Hank (ranked exposure), basin framing
and stories serve Wanda and Camila. Same verified numbers, four altitudes.

## Degradation paths

| Failure | Behavior |
|---|---|
| Artifact missing for AOI | report 404 + catalog hides entry; UI empty states designed |
| Receipt hash mismatch | receipt page shows ✗ badge; `/api/health` reports degraded |
| Stale epochs | staleness flag rendered on report ("fresh / recent / stale — refresh pending") |
| Agent LLM unavailable | deterministic plan returned with a note; zero functional loss |

## Scaling path (post-hackathon)

- Tiles: JSON velocity grids → PMTiles/COG on object storage + CDN range requests.
- Reports: per-AOI+epoch cache (Redis) in front of the composer.
- Ingest: real NISAR/Sentinel epochs via earthaccess; queue-driven (Celery) batch with idempotent stages.
- Coverage: pipeline scheduled per AOI; alert digests from watch-score deltas.
