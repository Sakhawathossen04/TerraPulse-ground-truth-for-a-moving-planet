# TerraPulse — Complete End-to-End Planning Blueprint

**Tagline:** Ground truth for a moving planet.
**One-liner:** TerraPulse turns NASA–ISRO NISAR radar data into station-verified, uncertainty-quantified land-motion intelligence so cities, hazard agencies and water managers can see ground deformation years before it becomes disaster.

**Status:** planning document. No build has started, per the agreed sequence (Research → Analysis → Ideas → Definition → Architecture → Roadmap → Submission Plan).

---

## 1. Product vision

By 2030, every land-adjacent decision — a bridge retrofit, a groundwater permit, a hospital siting, an insurance premium — will include satellite-measured ground motion as routinely as it includes weather today. TerraPulse is the first product that makes NISAR-era deformation data *legible, verified and decision-ready* for the people responsible for roads, water and safety, and the first to attach calibrated uncertainty to every number it shows.

**North-star metric:** number of AOIs (areas of interest) for which a user downloads a verified motion report.

## 2. Problem statement

Ground deformation is silent, cumulative and invisible to the naked eye: land subsides as aquifers compact, hillsides creep before they collapse, infrastructure shifts as permafrost and soils change. Experts detect this with InSAR (radar interferometry) — but the workflow lives in specialist GIS labs, takes days per site, and outputs maps with no error bars. Meanwhile NISAR (launched Jul 30, 2025; provisional data Jul 20, 2026 — verified) is producing the highest-quality, regularly-refreshed global deformation record ever made, and almost nobody outside the SAR community can consume it.

**The gap:** a decision product between NASA's radars and the city engineer — with verification, not vibes.

## 3. User personas

1. **"Infrastructure Iris"** — city/public-works engineer or GIS lead. Needs: per-asset motion status, plain-language flags, exportable evidence for budget requests. Fears: false alarms wasting council time.
2. **"Hazard Hank"** — geological survey / emergency-management analyst. Needs: ranked watchlist of deforming zones, change alerts, comparison to GNSS truth, boundaries/shapefile export.
3. **"Water Wanda"** — water-resource manager. Needs: subsidence-vs-recharge context for basins, seasonal vs trend decomposition, defensible numbers for policy.
4. **"Insurer Ivan"** (secondary) — cat-model analyst. Needs: portfolio-level exposure to ground motion, underwriting-grade uncertainty.
5. **"Curious Camila"** (public face) — student/journalist. Needs: the atlas story layer, sharable visuals.

## 4. Full user journey (golden path)

1. Camila lands on the site → sees animated globe/atlas of Earth's moving ground → clicks her metro.
2. The atlas shows measured velocity (mm/yr) as a color layer with legend + confidence shading; a 20-second explainer toggle ("what am I looking at?").
3. Iris searches "I-35 corridor" or draws a polygon → TerraPulse computes/stitches a **Motion Report**: area median velocity, uncertainty, trend class (stable/subsiding/uplifting/creep), seasonality, comparison against GNSS stations, data lineage receipt.
4. Iris exports a PDF/CSV and (optional) subscribes to alerts on that AOI.
5. Hank's Watchlist page ranks all monitored AOIs by motion×exposure; he clicks through to reports; subscribes his county.
6. Wanda opens a basin report: 10-year Sentinel-1 + NISAR trend decomposition chart (trend vs seasonal signal) — her policy chart.
7. Every number anywhere in the product has: value ± uncertainty, source epoch(s), validation status (e.g., "3 GNSS stations within 5 km, mean abs. error 1.8 mm/yr"), and a receipt link.

## 5. Core features (MVP must-haves)

1. **Deformation Atlas** — interactive MapLibre map, precomputed velocity tiles (COGs/PMTiles) for 3–6 flagship regions, confidence layer, epoch playback.
2. **AOI Motion Reports** — search or draw → stats card (velocity, uncertainty, class), time-series chart, GNSS validation panel, lineage receipt.
3. **GNSS Validation Panel** — satellite-vs-station comparison for AOIs with stations; the trust engine of the product.
4. **Alerts/Watchlist** — ranked AOI list by motion severity × exposure (population/infrastructure from OSM/SEDAC).
5. **Receipts (provenance)** — every artifact links a JSON-LD receipt: datasets+versions, processing parameters, software versions, QC flags, validation stats.
6. **Export** — report PDF, CSV of time series, GeoTIFF/shapefile for GIS users.
7. **Story layer** — 3 curated deep dives (e.g., "the subsiding capital", "the creeping slope", "the recovering basin") for press/public.

## 6. Advanced features (post-MVP / stretch)

- Anomaly detector on new epochs with alerting digest.
- NISAR×Sentinel-1 fusion mode (history + freshness).
- Public API + notebooks gallery ("reproduce this report in Colab").
- Multi-language UI (Spanish first — global-judge resonance).
- Insurer portfolio bulk upload (CSV of assets → batch report).
- Scenario simulator: "trend continues 5/10 years" exposure projection.

## 7. AI/ML architecture

**Principle (from benchmark): every model must justify itself. No decoration.**

| Component | Method | Purpose | Eval |
|---|---|---|---|
| Displacement time-series | MintPy-style SBAS/unwrapped-phase inversion over NISAR GCOV/SLC-derived interferograms (offline; custom lightweight coregistration acceptable) | velocity + seasonal decomposition per pixel | closure tests, residual std |
| Signature classifier | U-Net/SegFormer segmenting deformation patterns (subsidence bowl / landslide creep / structural / atmospheric artifact) | turn maps into named, explainable classes | IoU on hand-labeled tiles; confusion vs GNSS |
| Anomaly detection | Gaussian-process / seasonal-hybrid ESD residuals on epoch series | new-motion alerts | precision/recall on synthetic+known events |
| Uncertainty engine | GP regression + **conformal calibration against GNSS velocities** | value ± interval on every stat | coverage %, interval width |
| Agentic planner | LLM planner with strict tool schema (CMR search → scene pick → download → process → validate → receipt) | reproducible AOI pipelines | task success on 20 canned AOIs; receipt completeness |
| Report narrator | LLM summarizer constrained to computed stats (no free numbers) | plain-language explanations | hallucination audit vs numbers |

**Guardrails:** narrator may only rephrase numbers that exist in the report JSON; planner failures degrade to manual pipeline; every model has a published eval card in-repo.

## 8. System architecture

```
[Data sources]  CMR/earthaccess ─ ASF (Sentinel-1) ─ GNSS (NGL/EarthScope) ─ OSM/SEDAC ─ DEMs
      │
[Offline pipeline - batch, Dockerized]
  ingest → coregister → interferogram stack → unwrapped phase → time-series inversion
   → velocity/seasonal rasters (COG) → stats (Parquet) → tiles (PMTiles) → validation vs GNSS
      │
[Storage]  S3/R2 (COGs, PMTiles, receipts) ─ PostGIS (AOIs, assets, users, alerts, receipts index)
      │
[API]  FastAPI: /aoi /reports /timeseries /alerts /receipts /tiles  (signed URLs for rasters)
      │
[Frontend]  Next.js + MapLibre + Tailwind/shadcn: Atlas / Report / Watchlist / Story / About-science
      │
[Agent service]  planner + tools + receipt writer (Python, queued via Redis/Celery)
```

**Key decision:** all heavy SAR processing is offline/batch pre-hackathon for flagship AOIs; the live system stitches *precomputed* artifacts into reports. The agent plans/executes the same pipeline code for *new* AOIs during the demo (time-boxed, on cached data where needed). This matches the winning benchmark pattern (heavy compute offline, light compute live).

## 9. Data pipeline

1. **Discover:** CMR search (NISAR GCOV L2, Sentinel-1 SLC via ASF) for AOI+epoch.
2. **Fetch:** earthaccess (auth, resume, checksums) → staged store.
3. **Preprocess:** DEM alignment, coregistration, multilook, interferogram generation (ISCE2 or simplified phase-difference for GCOV pairs), tropospheric correction (GACOS/ERA5 if time permits — else documented limitation).
4. **Invert:** SBAS/time-series to displacement per epoch.
5. **Derive:** velocity, acceleration, seasonality, uncertainty per pixel.
6. **Validate:** co-located GNSS velocity comparison → calibration of error model (conformal).
7. **Publish:** COG+PMTiles tiles, Parquet stats, JSON-LD receipts → catalog table.

Every step logs inputs/outputs/params into the receipt. Pipeline failures fall back to last-good epoch with a visible staleness flag.

## 10. NASA API/data integration

- **NISAR** L2 GCOV (primary; provisional products via Earthdata, released Jul 20, 2026 — verified).
- **Sentinel-1** (Copernicus, distributed via NASA ASF) for 2014–present historical baseline.
- **Landsat 8/9, SRTM/Copernicus DEM, ICESat-2 ATL08** for context/alignment checks.
- **GNSS:** Nevada Geodetic Lab / EarthScope — the ground-truth backbone.
- **SEDAC/WorldPop** population, **OpenStreetMap** infrastructure for exposure scoring.
- **CMR API + earthaccess** for all discovery/auth (the agent's tool layer).

## 11. Backend plan

- FastAPI, async, typed (Pydantic v2). Endpoints: AOI CRUD, report builder (composes precomputed stats), time-series server, alert rules, receipts reader, tile proxy/signed URLs.
- Auth: email magic-link + Google OAuth only if needed for alerts; public browsing anonymous.
- Jobs: Celery+Redis for on-demand AOI report assembly and agent runs; hard timeouts; cached results.
- Feature flags for the fusion mode and simulator.

## 12. Frontend plan

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; MapLibre GL with PMTiles source.
- Performance budget: LCP < 2.5s on atlas; tiles lazy; reports stream.
- Design language: "instrument-grade" — monospaced numerics, calibrated colorbars, confidence hatching, receipts as first-class UI element (distinct visual identity vs the glassy consumer style of SkySense).
- Accessibility: WCAG AA, colorbar-vision-safe palettes, keyboard map navigation.

## 13. Database/storage plan

- **PostGIS:** users, AOIs (geometry), reports, alert subscriptions, GNSS station registry (mirror), receipts index (JSONB), eval-metrics table.
- **Object storage (S3/R2):** COGs, PMTiles, figures, PDFs, receipts (immutable, content-addressed).
- **Cache:** Redis for report compositions and tile auth.

## 14. Interactive map/dashboard plan

- Atlas: velocity layer + confidence toggle + epoch playback slider + AOI search/draw.
- Report view: headline stat (velocity ± CI + class), decomposition chart, GNSS scatter/validation, receipt drawer, export buttons.
- Watchlist: sortable table (motion, exposure, confidence, last-updated), map-linked.
- Story: scrollytelling template (react-scrollama pattern proven by A Solar Tale) for the 3 deep dives.

## 15. Website sitemap

```
/                    Atlas + explainer toggle + 3 flagship cards
/aoi/[id]            Motion report (golden path)
/watchlist           Ranked alerts (persona: Hank)
/basins/[id]         Water-manager deep view (persona: Wanda)
/stories/[slug]      Scrollytelling deep dives (Camila/press)
/method              How it works + accuracy/validation page (trust)
/receipts/[id]       Public provenance receipt viewer
/about + /judges     Team, NASA data usage, AI disclosure, challenge fit
```

## 16. UI/UX strategy

- First screen = the wow (moving-Earth atlas) + one-line value prop.
- Every technical claim is 1 click from its evidence (receipt/validation) — the anti-hand-waving UX.
- Persona entry cards on landing ("I manage infrastructure / water / hazards / I'm exploring").
- Empty/error states designed (staleness flags, coverage gaps) — honesty as UI.
- 30-second demo path instrumented: land → metro → report → validation → export.

## 17. Repository structure

```
terrapulse/
  README.md                  (judge-grade, with badges, 60-sec GIF)
  LICENSE (MIT)  CITATION.cff  .zenodo.json
  docs/                      (architecture, method, accuracy report, receipts spec)
  pipeline/                  (ingest, insar, timeseries, validate, publish; Docker)
  agent/                     (planner, tools, receipt-writer; eval suite)
  api/                       (FastAPI app, schemas, tests)
  web/                       (Next.js app; atlas/report/story)
  data/                      (registry of flagship AOIs, GNSS mirrors, checksums)
  notebooks/                 (reproducibility gallery, one per flagship AOI)
  eval/                      (model cards, coverage tables, task success logs)
  .github/workflows/         (CI: lint, unit, pipeline smoke on cached data)
  infra/                     (IaC: Fly/Render/Railway + object storage buckets)
```

## 18. Technology stack

- Pipeline: Python 3.11, earthaccess, rasterio/GDAL, xarray, MintPy or custom, Docker.
- Agent: LangGraph or hand-rolled planner (decide by eval, not fashion) + function-calling LLM.
- API: FastAPI, Pydantic, PostGIS, Redis, Celery.
- Web: Next.js 14+, TypeScript, MapLibre, PMTiles (protomaps), Tailwind, shadcn/ui, react-scrollama.
- Infra: S3/R2 + Cloudflare/Fly/Render; GitHub Actions CI; Sentry-lite error tracking.
- Docs: MkDocs Material; papers via Typst/LaTeX.

## 19. Research contribution

1. **Station-calibrated uncertainty model** for NISAR+Sentinel land-motion products (conformal coverage tables vs GNSS) — publishable as a short paper/tech note.
2. **Deformation-signature taxonomy + segmentation benchmark** on hackathon-accessible compute.
3. **Provenance-receipt specification** for geospatial AI pipelines (JSON-LD schema, open-sourced).
4. **Reproducibility gallery:** every flagship AOI report reproducible from one notebook command.

## 20. Evaluation metrics

- **Model:** GNSS cross-validation MAE (mm/yr) and interval coverage % (target ≥90% nominal); segmentation IoU; anomaly precision@k.
- **Agent:** task success rate on 20 canned AOIs; receipt completeness score; mean wall-time.
- **Product:** report build latency (<3 s composed, <10 min fresh AOI), LCP, error rate.
- **Science integrity:** every published number traceable to receipt; audit passes on 10 random reports.

## 21. Security/reliability considerations

- No PII beyond email (alerts); secrets in env/secret manager; signed URLs for raster access; rate limiting; CORS locked to own domain.
- Pipeline idempotency + checksums; last-good-epoch fallback; staleness surfaced in UI; graceful agent degradation.
- Backup: nightly Postgres dump to object storage; infrastructure as code for rebuild.

## 22. Testing strategy

- Unit: stats/uncertainty math (property-based), receipt schema validation.
- Integration: pipeline smoke on cached mini-scene in CI.
- Golden tests: one flagship AOI end-to-end with pinned outputs (velocity field hash).
- Agent evals: canned-AOI task suite in CI (nightly, not per-push).
- UI: Playwright happy-path (land→report→export); visual snapshot tests on key views.
- Load: k6 on report endpoints before submission.

## 23. Deployment architecture

- **Web:** Vercel (Next.js) — proven winner-grade.
- **API + agent:** Fly.io or Render container(s) with PostGIS extension and Redis; object storage on R2/S3.
- **Pipeline:** GitHub Actions self-hosted runner (or a rented GPU box for the spike) producing artifacts to storage; not user-facing.
- Uptime goal for judging window: 99.5%+; status page; demo-mode static fallback of flagship reports if live API fails (benchmark lesson: demo path must never die).

## 24. Scalability plan

- Tiles are CDN-cacheable (PMTiles range requests); reports cached per AOI+epoch; new AOIs expand coverage linearly (pipeline is the unit of scale); agent concurrency capped; DB indexes on geometry + receipts; multi-region CDN.

## 25. Implementation roadmap (summary — detailed phase plan in 05)

Research → Data Validation → Prototype → AI/ML → Backend → Frontend → Integration → Testing → Deployment → Demo → Final Submission, with exit criteria per phase (see roadmap doc).

## 26. Demo flow (60–90 seconds, scripted)

1. (0:00) Open atlas — animated epoch playback over a famous subsiding metro. "This is Earth, moving, measured every 12 days."
2. (0:15) Search the judge-chosen metro → motion report opens: "median −4.2 ± 0.6 mm/yr — subsiding; 3 GNSS stations agree within 1.8 mm/yr."
3. (0:35) Click validation panel → satellite-vs-station chart. "Every number ships with its error and its evidence."
4. (0:50) Click receipt → datasets, versions, parameters. "And every analysis is auditable."
5. (1:05) Type a *new* AOI → agent plans the pipeline on screen → (time-boxed/cached) report begins. "New ground, on demand."
6. (1:20) Close on watchlist + one story deep dive. CTA.

## 27. Documentation plan

- README (judge-first): problem, 60-sec GIF, quickstart, data sources, method in 10 lines, accuracy table, receipts explainer, AI-use disclosure, team.
- `/method` page: full science narrative + limitations (mirrors docs).
- Model cards + eval tables in `/eval`; receipt JSON-LD schema doc.
- CONTRIBUTING + architecture decision records (ADRs) — signals production maturity.

## 28. GitHub/README plan

- Repo public from day one, conventional commits, CI badges, issues labeled by phase (research/pipeline/web/agent) — the repo itself demonstrates process maturity.
- Release tagged `v1.0-spaceapps` before submission with release notes; Zenodo DOI for the release (open-science points; mirrors Gaia+LEO's reproducibility win).

## 29. Presentation/pitch plan (3–4 min)

- **Structure (villain → gift → proof → ask):** the invisible disaster (subsidence/creep) → NASA's new radar (NISAR, first consumer) → live demo (script above) → accuracy proof (GNSS table) → the ask (agencies/cities: adopt verification-grade motion intelligence).
- Slide discipline: <12 slides, every claim footnoted to a receipt; one slide of honest limitations (builds trust — SpaceGenes+ lesson).
- Rehearse the demo failure path (fallback video + static reports).

## 30. Final submission strategy

- Submit **48 hours before deadline**; complete every form field; link live app + video (3 min) + repo + method page.
- Challenge-fit: identify the 2026 challenge statement closest to Earth-observation actionability (candidates historically: agriculture/EO actionability/disaster themes) — decided when statements publish (~4 weeks pre-event, verified cadence from 2025); TerraPulse adapts framing without changing the build.
- Local-event nomination path: prepare the "judge pack" (README, video, receipts explainer, accuracy one-pager) sized for both local and global judging rounds.

## 31. Risk analysis

| Risk | L | I | Mitigation |
|---|---|---|---|
| NISAR product formats/coverage differ from expectations | M | High | Feasibility spike in Phase 0 on one AOI before committing; Sentinel-1 fallback baseline |
| InSAR processing complexity blows the timeline | H | High | Precomputed flagship AOIs; simplified GCOV-pair processing; expert-consulted setup; fallback to published-velocity comparison mode |
| Atmospheric/phase artifacts → wrong numbers | M | High | GNSS validation + honest uncertainty; exclude low-quality epochs; document corrections not applied |
| Agent unreliability on stage | M | Med | Cached demos for new-AOI flow; planner degrades to manual; receipts keep integrity if agent is disabled |
| Team bandwidth (48h event + runway) | M | Med | Phase-gated roadmap; freeze scope at MVP; stretch features pre-built as flags |
| Live-demo infra failure | L | High | Static fallback bundle; second region deploy; rehearsed recovery |
| "Too expert/too niche" perception | M | Med | Story layer + persona entry points + plain-language uncertainty ("what this means for you") |
| Data-freshness gaps at demo time | M | Low | Precomputed epochs pinned; staleness surfaced as feature, not bug |

(L = likelihood, I = impact)

## 32. Future expansion roadmap

- **Post-hackathon 3 months:** more basins; alerting digest; API partners (a city GIS desk pilot — even one real user validates Local Impact/Global Connection narratives).
- **6–12 months:** global coverage tiles at low resolution; insurer portfolio mode; permafrost/volcanic modules; publish the calibration paper; pursue NASA Earthdata profile/features.
- **Long-term:** the "ground-motion weather service" — subscription reports per asset, open tier for public interest, integration into city asset-management systems.
