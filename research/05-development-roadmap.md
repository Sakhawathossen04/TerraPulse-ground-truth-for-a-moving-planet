# TerraPulse Development Roadmap — Research → Final Submission

**Runway:** Sep 18, 2026 → event **Nov 14–15, 2026** (verified) → submission within 48h after (~Nov 17). ≈ **8 weeks pre-event + event weekend**. The plan below front-loads all research risk into the first 3 weeks; the event weekend is reserved for polish, story, and demo — not for first-time engineering.

**Phase rule:** a phase is not "done" until its validation criteria pass. If Phase 0/1 validation fails, we pivot to the alternate idea (SmokePath) *before* Phase 2 — the pivot cost is deliberately front-loaded.

---

## Phase 0 — Research & Feasibility Spike (Sep 18 – Sep 27)

**What we build/learn**
- NISAR product literacy: download real NISAR L2 GCOV provisional products for 1–2 flagship AOIs via earthaccess/CMR; read product docs; inspect band layout, resolution, coverage, revisit.
- Feasibility spike (time-box: 2 days): compute a first displacement signal for one AOI with a known ground truth (e.g., a documented subsiding basin with GNSS stations): download 2–3 epochs, coregister, difference phase, sanity-check magnitude/direction vs published velocity.
- GNSS ground-truth feasibility: pull station velocities for the AOI (Nevada Geodetic Lab), verify enough stations co-located.
- Confirm the 2026 challenge statements (published ~4 weeks pre-event per 2025 cadence — watch for release; map TerraPulse framing to the best-fit statement).
- Alternate-idea option check (SmokePath quick spike, 0.5 day) only if NISAR shows blockers.

**Dependencies:** Earthdata account (app-verified), machine with disk/RAM for SAR scenes, expert consultation (InSAR-literate advisor or thorough literature replication).
**Expected output:** `docs/feasibility-report.md`: product specs found, sample imagery, first interferogram figure, truth comparison, GO/NO-GO decision, challenge-fit mapping.
**Validation criteria (GO gate):** (1) ≥3 usable NISAR epochs retrieved for AOI; (2) measured motion within ±50% of published/GNSS rate on the sanity site, correct sign; (3) GNSS stations available within 10 km; (4) end-to-end spike < 3 days effort.
**Risks & responses:** product format surprises (→ consult NISAR handbook + Discord/forums; pivot to Sentinel-1-heavy baseline with NISAR hero epoch); phase quality too low (→ choose better AOI from published-InSAR literature list).

## Phase 1 — Data Validation & Flagship AOI Selection (Sep 28 – Oct 6)

**What we build**
- AOI selection matrix: 5 candidate sites scored by (motion magnitude × stakeholder salience × GNSS coverage × NISAR coverage × demo recognizability). Pick 3 flagship + 1 reserve.
- Ground-truth registry: GNSS station metadata + velocities for all flagships (mirrored, checksummed).
- Validation protocol: cross-validation splits, coverage targets, error-model design (conformal calibration set vs test set separated by space).
- Data manifests + checksums for every retrieved product (receipts spec drafted — JSON-LD schema v0).

**Dependencies:** Phase 0 GO.
**Expected output:** `data/registry.yaml` (AOIs, epochs, stations, checksums), `docs/validation-protocol.md`, receipts schema v0 in repo.
**Validation criteria:** each flagship has ≥6 epochs, ≥2 GNSS stations within 10 km, documented expected motion from literature; manifests reproducible (checksums verify).
**Risks:** one flagship under-delivers epochs (→ reserve AOI pre-selected; swaps are cheap pre-pipeline).

## Phase 2 — Pipeline Prototype (Oct 7 – Oct 16)

**What we build**
- Dockerized pipeline v0 for one AOI end-to-end: fetch → coregister → interferogram stack → unwrapped time series (MintPy or simplified custom) → velocity + seasonal decomposition → COG tiles + Parquet stats → receipt emission.
- First uncertainty implementation: pixel-level residual-based errors + GNSS-calibrated conformal intervals.
- Golden test: pinned outputs for flagship #1.

**Dependencies:** Phase 1 manifests; compute (CPU ok; GPU only if segmentation trains early).
**Expected output:** velocity map + decomposition chart for flagship #1 with uncertainty layer; receipts auto-emitted; notebook reproducing it.
**Validation criteria:** velocity field GNSS MAE within target (e.g., ≤3 mm/yr on flagship #1); interval coverage ≥90% on calibration stations; pipeline re-runs byte-identical stats (idempotency); wall time ≤6h on laptop-class hardware.
**Risks:** InSAR subtleties (unwrapping, atmosphere) eat time (→ simplify: fewer pairs, documented corrections skipped, lean on magnitude-strong sites where signals >> noise; keep expert on call).

## Phase 3 — AI/ML Layer (Oct 12 – Oct 24, overlapping Phase 2)

**What we build**
- Signature classifier (U-Net/SegFormer) on deformation-pattern tiles: hand-label ~300–800 tiles across flagships (subsidence bowl / creep / structural / artifact), train, evaluate IoU + confusion vs GNSS classes.
- Anomaly/acceleration detector on epoch residuals with precision@k on synthetic + any known events.
- Agent v1: planner with tool schema (CMR search → download → process → validate → receipt) + eval harness on 20 canned AOIs (cached execution permitted; correctness and receipt completeness graded).
- Narrator v1: constrained summarizer over report JSON (numbers-only rule enforced by schema); hallucination audit script.

**Dependencies:** Phase 2 outputs for training tiles; labeling sessions (team timeboxed); LLM API keys.
**Expected output:** model cards with eval tables in `/eval`; agent passing ≥80% task success with 100% receipt completeness; narrator audit ≥99% numeric fidelity.
**Validation criteria:** every deployed model has an eval card; classifier IoU ≥0.6 on holdout; agent graceful-degradation path proven (kill the LLM → pipeline still runs manually).
**Risks:** label scarcity (→ class taxonomy kept small, 4 classes; augmentation; report as "experimental" if below bar — honesty beats overclaim); agent overreach (→ receipts + fallback are the safety net).

## Phase 4 — Backend (Oct 20 – Oct 30)

**What we build**
- FastAPI service: AOI/report/timeseries/alerts/receipts/tile endpoints; Pydantic schemas shared with frontend; PostGIS schema + migrations; Redis/Celery for report assembly + agent runs; signed-URL tile proxy; email alert stub (digest, no spam).
- Observability: structured logs, error tracking, health endpoints, status page.

**Dependencies:** Phase 2 artifacts in object storage; receipts schema frozen v1.
**Expected output:** API deployed to staging; Postman/OpenAPI docs; load smoke.
**Validation criteria:** report composition <3s (p95) from precomputed artifacts; receipts endpoint returns complete lineage for every report; API contract tests green; uptime 99%+ over a week on staging.
**Risks:** scope creep on alerts/auth (→ alerts = simple digest email; auth only for subscriptions).

## Phase 5 — Frontend (Oct 27 – Nov 6)

**What we build**
- Next.js + MapLibre + PMTiles: Atlas (velocity + confidence + epoch playback), Report view (headline stat, decomposition chart, GNSS panel, receipt drawer, exports), Watchlist, Stories (scrollytelling ×1 minimum), Method page, About/AI-disclosure.
- Persona entry points; empty/error/stale states designed; Spanish i18n scaffold if time.

**Dependencies:** Phase 4 API contract; final colorbars/design system tokens.
**Expected output:** deployed preview (Vercel) with golden-path instrumented; 60-second GIF for README.
**Validation criteria:** LCP <2.5s on atlas; Playwright happy-path green (land→search→report→validation→export→receipt); keyboard-navigable map; all numbers on screen traceable to report JSON (spot-audit).
**Risks:** map perf with confidence layers (→ vector tiles/paint properties tuned; PMTiles range caching).

## Phase 6 — Integration (Nov 7 – Nov 9)

**What we build**
- Wire end-to-end: frontend ↔ API ↔ receipts ↔ agent; fresh-AOI agent demo mode (time-boxed execution + cached fallback); alert digest cron; status page live.
- Full rehearsal environment identical to production; demo script assets loaded.

**Dependencies:** Phases 2–5 exit.
**Expected output:** one system, one URL; demo script v2 tested 3×; fallback bundle (static reports + video) generated automatically.
**Validation criteria:** end-to-end golden path from clean browser profile on hotel-wifi-grade connection; agent demo completes or degrades gracefully within 90s; fallback bundle verified by a teammate who didn't build it.
**Risks:** integration surprises late (→ integration freeze Nov 9; only bugfixes after).

## Phase 7 — Testing & Hardening (Nov 9 – Nov 11)

**What we run**
- Full test suite: unit + golden + Playwright + agent evals + k6 load on report endpoints; chaos drill (kill API mid-demo → recovery ≤60s); accessibility pass (axe); receipt audit on 10 random reports.
- Security pass: secrets scan, dependency audit, rate limits, CORS.

**Expected output:** test report + fixes; freeze of `release/v1.0-spaceapps` branch.
**Validation criteria:** zero critical/high issues open; p95 report latency <3s under 50 concurrent; a11y AA on golden path.
**Risks:** late-breaking pipeline bug (→ last-good-epoch fallback + staleness flags; never ship unvalidated numbers).

## Phase 8 — Deployment (Nov 11 – Nov 12)

**What we ship**
- Production deploy (Vercel + Fly/Render + R2/S3 + Cloudflare), second-region warm standby, DNS/CDN tuned, status page public, Zenodo DOI + `v1.0-spaceapps` tag, README judge pack finalized.

**Validation criteria:** uptime 24h clean before event; demo machine + backup machine + phone hotspot tested against production.
**Risks:** infra account/limits issues (→ deploy 48h early exactly for this).

## Phase 9 — Demo & Event Execution (Nov 14–15)

**What we do**
- Hackathon weekend: polish story layer, record final video (script from blueprint §26), local-event presentation, judge Q&A, capture user feedback as submission evidence.
- Pre-scheduled social/storytelling assets (atlas GIFs) for the People's-Choice-style visibility if offered locally.

**Validation criteria:** live demo executed ≥3× (judges/visitors) without recovery; video published; feedback quotes collected (2–3 persona validations — the benchmark's biggest missing feature, cheap for us to add).
**Risks:** venue wifi (→ offline-capable demo machine + fallback video; hotspot).

## Phase 10 — Final Submission (by ~Nov 17, target Nov 16)

**What we ship**
- Submission form completed (every field, challenge-fit statement mapped to 2026 statement), links: live app, 3-min video, public repo, method page, accuracy one-pager, receipts explainer, AI-disclosure, team.
- Submitted ≥48h before deadline; confirmation archived.

**Validation criteria:** submission receipt; three external reviewers (non-team) each complete the golden path unaided and find the receipts/uncertainty panel within 2 minutes.
**Risks:** form/link rot after submission (→ link-checker on all submitted URLs + frozen release tag).

---

## Week-by-week calendar (Sep 18 → Nov 17)

| Week | Dates (2026) | Focus | Exit gate |
|---|---|---|---|
| 1 | Sep 18–27 | Phase 0 spike + NISAR literacy | GO/NO-GO |
| 2 | Sep 28–Oct 6 | Flagships + truth registry + protocol | Registry verified |
| 3 | Oct 7–13 | Pipeline v0 flagship #1 | Golden test green |
| 4 | Oct 14–20 | Pipeline remaining AOIs + uncertainty + labeling | Validation targets met |
| 5 | Oct 21–27 | Models + agent evals + backend build starts | Eval cards published |
| 6 | Oct 28–Nov 3 | Backend complete + frontend build | Staging live |
| 7 | Nov 4–10 | Frontend complete + integration + testing | Freeze Nov 9–10 |
| 8 | Nov 11–13 | Deploy + rehearsals + video draft | Production verified |
| Event | Nov 14–15 | Demo, feedback, video final | Demo executed |
| Submit | Nov 16–17 | Submission + audits | Receipt archived |

**Capacity assumptions:** 4–6 builders (pipeline ×2, web ×1–2, backend/agent ×1, ML ×1, design/story ×0.5). Slack: 20% unallocated in weeks 3–7.

## Post-submission follow-through (optional, high-leverage)

- Publish the calibration tech note (arXiv/EarthArXiv) within 4–6 weeks.
- One real pilot user (city GIS desk / water agency) interviewed with the product — evidence for Global Connection/Local Impact narratives in future rounds.
- Open-source announcement (HN/r/geospatial/NASA Earthdata community) — Gaia+LEO showed openness compounds.
