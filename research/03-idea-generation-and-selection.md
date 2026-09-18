# Original Project Idea Generation — 7 Candidates + Scoring Matrix

Derived from the gap analysis in `02-cross-project-analysis.md`. Each idea targets at least two identified gaps (fresh missions, uncertainty quantification, verifiable agents, longitudinal time axis, open reproducibility, station-verified claims). All ideas deliberately avoid collisions with the 10 benchmark winners (noted per idea).

---

## Idea 1 — TerraPulse: NISAR-powered land-motion early warning ⭐ (recommended)

- **Concept:** A land-deformation early-warning product that turns NASA–ISRO NISAR (launched Jul 30, 2025; provisional L1/L2 data released Jul 20, 2026 — verified) into actionable ground-motion intelligence: subsiding cities, creeping landslides, aquifer depletion, infrastructure strain. Users get an interactive deformation atlas, per-asset motion reports, and anomaly alerts with quantified uncertainty.
- **Problem:** Ground deformation is invisible until it fails: land subsidence damages foundations/roads/pipes, landslide creep precedes catastrophe, groundwater overdraft is silent. Current InSAR tools are expert-only (ISCE/MintPy, GIS desks); city engineers, hazard agencies and insurers lack a decision product.
- **Target users:** (1) city/public-works engineers & GIS leads, (2) geological survey / hazard agencies, (3) water-resource managers, (4) insurers/catastrophe modelers.
- **NASA dataset/API:** NISAR L2 GCOV products (Earthdata, earthaccess), historical baseline from Sentinel-1 (Alaska Satellite Facility) for pre-launch epochs, Landsat for context, SRTM/COP-DEM, TEMPO/POWER not needed here. Optional: ICESat-2 ATL08 for elevation cross-checks.
- **Additional data:** GNSS/GPS station velocities (Nevada Geodetic Lab, UNAVCO/EarthScope) as ground truth; OpenStreetMap for assets; Copernicus DEM; published subsidence studies for validation sites.
- **Core innovation:** First hackathon-grade consumer of NISAR for land motion (verified: zero 2025 winners used NISAR); pairs NISAR's new epoch with a decade of Sentinel-1 so results have history; deformation maps ship with **per-pixel uncertainty and station-validated velocity errors**, not pretty pictures.
- **AI/ML approach:** (a) Time-series displacement decomposition (MintPy-style or custom) for velocity/seasonality; (b) U-Net/SegFormer semantic segmentation classifying deformation signatures (subsidence bowl / landslide creep / structural motion) from interferogram stacks; (c) anomaly detection (gaussian-process residuals) triggering alerts; (d) conformal prediction intervals on station-calibrated velocities.
- **Agentic component:** A provenance-first "analysis agent": given an AOI, it plans the pipeline (search CMR → pick scenes → download → coregister → compute → validate vs GNSS), executes tools, and emits a **verification receipt** (datasets, versions, parameters, residuals, QC flags) embedded in every report. Auditable, not magical.
- **Research contribution:** Station-calibrated error model for NISAR-vs-Sentinel fusion at annual scales; deformation-signature taxonomy with segmentation benchmark on hackathon hardware; open reproducible notebook for one flagship basin.
- **Main features:** Deformation atlas map (velocity layer + epochs); AOI report cards (mm/yr, uncertainty, trend class, confidence); alert list ranked by exposure×motion; GNSS validation panel showing measured vs satellite error; receipt/report PDF export; scenario simulator ("if trend continues 5 years…").
- **Product flow:** Landing → pick/locate AOI (search) → atlas loads precomputed tiles → drill into asset/neighborhood → motion report with uncertainty + validation → export/alert subscribe.
- **Technical architecture:** Precompute-heavy: offline pipeline (earthaccess → ASF, ISCE2/MintPy or lightweight custom coregistration) produces COG tiles + Parquet stats; FastAPI serves them; React/MapLibre atlas; PostGIS for AOIs/assets/alerts; receipt store as JSON-LD.
- **Real-world impact:** Early detection of subsidence/creep = cheaper interventions, safer corridors, evidence for water policy; insurer-grade motion records.
- **Originality vs winners:** Fresh mission (gap #1), uncertainty (gap #2), longitudinal (gap #4), open pipeline (gap #5). No winner did solid-earth anything.
- **Feasibility:** High with discipline: flagship AOIs preprocessed before the event; NISAR GCOV path (no full SLC InSAR needed) + Sentinel-1 historical via ASF On Demand; risk mitigated by fallback sites with published deformation rates.
- **Limitations:** NISAR time series still ~13 months long; atmospheric/phase-delay artifacts in small regions; heavy preprocessing; team must learn NISAR product layout.
- **Demo potential:** Outstanding — animated 12-day deformation epochs over a famous basin (e.g., Mexico City / Central Valley / Houston), "your warehouse moved 4.1 ± 0.6 cm/yr toward the river" report card, live GNSS agreement chart.

## Idea 2 — HarvestProof: county-scale yield nowcasts with honest uncertainty

- **Concept:** Probabilistic crop-yield nowcasting for US counties fusing NASA data, verified against USDA NASS — a "weather-to-market" decision product with calibration guarantees.
- **Problem:** Farmers, co-ops, buyers and insurers plan against yield uncertainty; existing outlooks are point estimates with no reliability guarantees; drought stress signals are scattered across portals.
- **Users:** grain co-ops/buyers, farm advisors, crop insurers, food-security analysts.
- **NASA data:** SMAP soil moisture (L4), GPM precipitation, MODIS/Landsat NDVI/EVI, POWER temperature; GDD accumulations.
- **Additional:** USDA NASS county yields (ground truth!), ERA5, irrigation census.
- **Innovation:** Conformal-calibrated intervals + season-long "track record" panel (did last season's intervals cover truth?) — verification as a product feature; nobody in the 10 shipped calibrated uncertainty.
- **AI/ML:** Temporal transformer/LSTM over county feature sequences; quantile regression + conformal calibration; drought-stress attribution (feature ablation).
- **Agentic:** Weekly autonomous "outlook memo" agent: pulls new data, updates forecasts, diffs vs last week, writes cited memo with receipts.
- **Research:** Calibrated remote-sensing yield nowcasting benchmark; reliability diagrams published.
- **Features/flow:** Map → county → crop → forecast band + drivers → compare vs USDA/trend → memo export.
- **Architecture:** Prefect/Airflow-lite ingestion to Parquet/PostGIS; FastAPI; React map; scrollytelling "how we verify" page.
- **Impact:** Better hedging and food-security signals; honest uncertainty for planning.
- **Originality:** Vs 2025: Henry's was a game, Queñaris was reforestation — an instrument-grade, verified forecasting product is open. Vs research: calibration focus is fresh for hackathons.
- **Feasibility:** Very high (all data public, tabular, fast). **Limitations:** US-centric NASS verification; county model ≠ field advice; less visually "spacey."
- **Demo:** Animated national map sweeping through the season with widening/narrowing bands; reliability diagram live.

## Idea 3 — SmokePath: wildfire smoke exposure nowcast + safe-routing

- **Concept:** Real-time smoke plume mapping + 6–24h exposure forecast + clean-air routing for schools, outdoor workers and events.
- **Problem:** Wildfire smoke is the fastest-growing acute air-quality hazard; advisories are city-wide and lag reality; vulnerable groups need route/time decisions, not warnings.
- **Users:** school districts, event organizers, outdoor-work employers, health departments.
- **NASA data:** FIRMS active fire/hotspots, MODIS/VIIRS AOD, TEMPO aerosol/NO2 columns, GEOS-CF/MERRA-2, Landsat burn scars.
- **Additional:** PurpleAir/AirNow ground PM2.5 (verification), HYSPLIT trajectory service (NOAA), OpenStreetMap routing, census vulnerability.
- **Innovation:** Fuses top-down (TEMPO/AOD) + bottom-up (ground sensors) with bias correction, then *optimizes schedules/routes* under exposure budgets — a decision product, not a warning board; forecast verification panel included.
- **AI/ML:** PM2.5 surface estimation (geostatistical + GBM bias correction), plume-motion nowcast (optical-flow/convLSTM on AOD), exposure-budget route optimizer (constrained shortest path).
- **Agentic:** "Protection agent" monitors schools/events on watchlists, simulates exposure windows, drafts advisory messages with citations for approval.
- **Research:** TEMPO+PurpleAir fusion skill scores; exposure-budget routing formulation.
- **Features/flow:** Live smoke map → pick school/event/route → exposure timeline → "shift practice to 17:40" recommendations → subscribe to alerts.
- **Architecture:** FIRMS/TEMPO ingest cron → PM surface model → tile server; FastAPI; React/MapLibre; Postgres.
- **Impact:** Directly protects kids/lungs; usable by health departments as-is.
- **Originality:** 2025's SkySense did weather planning; smoke is a different, more urgent hazard; no winner touched AQ. **Feasibility:** High; **Limitations:** model resolution vs street canyon reality; TEMPO daylight-only coverage.
- **Demo:** Animated AOD plume sweeping a metro area with school icons turning safe/unsafe hour by hour.

## Idea 4 — EddyWatch: SWOT×PACE ocean-front advisories for fisheries & blue carbon

- **Concept:** Detect submesoscale fronts/eddies from SWOT SSH, cross-reference PACE chlorophyll, and issue "front advisories" (where nutrient-rich convergence zones will be in 24–72h) for fishing fleets and blue-carbon research.
- **Problem:** Fish aggregate near fronts; finding them burns fuel; carbon-export science needs front statistics at the new SWOT scale (Archer et al., Nature 2025 — verified).
- **Users:** fishing cooperatives/fleets, oceanographers, carbon-cycle programs.
- **NASA data:** SWOT L2/L3 SSH, PACE OCI chlorophyll/aerosol, MODIS SST, GPM rain.
- **Additional:** Global Fishing Watch effort (context), Copernicus Marine SST/SSH, drifter buoys.
- **Innovation:** First consumer-grade SWOT front product with short-term advective forecast (geostrophic drift advection of front masks) — "the ocean's weather report."
- **AI/ML:** Front detection (Cayula–Cornillon + CNN on SSH gradients), eddy instance segmentation, drift forecast (optical flow / physics-informed advection), forecast verification vs next-day detections.
- **Agentic:** Fleet-zone agent drafts daily "3 promising zones + reasoning + uncertainty" brief per registered fleet.
- **Research:** SWOT-front persistence statistics; forecast skill scores.
- **Impact:** Fuel savings, bycatch reduction, carbon-export sampling guidance.
- **Originality:** Ocean untouched by winners; SWOT is gap #1. **Feasibility:** Medium — ocean data formats and validation are harder; **Limitations:** weak in-situ truth at hackathon scale; advection simplifications.
- **Demo:** Animated Gulf Stream/California Current front evolution with advisories.

## Idea 5 — BreathHour: TEMPO-verified neighborhood air-quality nowcast + health agent

- **Concept:** Hourly, street-credible air-quality nowcasts for North American metros fusing TEMPO columns with ground monitors; health-timed activity guidance.
- **Problem:** AQI is city-wide and 1×/day; TEMPO's hourly NO2/O3/HCHO (verified operational) is barely productized; asthma/runners/schools need hour-level, neighborhood-level truth.
- **Users:** schools/athletics, asthma patients (via clinics), AQ managers, urban planners.
- **NASA data:** TEMPO L2/L3 NO2/O3/HCHO, GEOS-CF, MERRA-2, MODIS land cover.
- **Additional:** AirNow/OpenAQ/PurpleAir monitors, road networks (traffic proxies), EDGAR/NEI inventories.
- **Innovation:** Station-verified downscaling with published skill (withheld-monitor evaluation), "rush-hour fingerprint" attribution per corridor (extends the verified Yale 2025 TEMPO-traffic study), hour-level activity scheduler.
- **AI/ML:** Spatiotemporal GBM/GNN downscaling column→surface; uncertainty via ensembles; attribution via SHAP.
- **Agentic:** Health agent translates forecasts into individualized guidance with citations; validates its advice against guideline docs (RAG over EPA/WHO PDFs with page-cited answers).
- **Research:** TEMPO downscaling benchmark; corridor-level traffic-NO2 attribution.
- **Impact:** Asthma attacks avoided; equitable hotspot identification.
- **Originality:** Medium-high (AQ apps exist; TEMPO-hourly + verification + health scheduling is new). **Feasibility:** High; **Limitations:** TEMPO cloud gaps; NA-only coverage.
- **Demo:** Day-in-the-life animation: an asthma kid's school day re-planned around verified NO2 dips.

## Idea 6 — CoolBlocks: ECOSTRESS urban heat equity + intervention optimizer

- **Concept:** Block-level overheating risk from ECOSTRESS diurnal thermal data + justice indicators, and an optimizer that ranks shade/cool-roof/tree interventions by lives-cooled-per-dollar.
- **Problem:** Urban heat kills unevenly; cities lack fine-grained diurnal thermal truth and defensible intervention priorities.
- **Users:** city resilience offices, public health, utilities, community groups.
- **NASA data:** ECOSTRESS LSTE (diurnal), Landsat 8/9, SEDAC population, POWER humidity.
- **Additional:** Census/Justice40 indicators, tree canopy (NLCD), FEMA, OpenStreetMap.
- **Innovation:** Diurnal (time-of-day) heat exposure — not just noon snapshots — plus a budget-constrained intervention optimizer with transparent assumptions.
- **AI/ML:** Thermal sharpening (ECOSTRESS 70m → 10m with Sentinel-2 features, SRCNN/GBM), heat-health risk model, knapsack/ILP intervention optimization under budget.
- **Agentic:** Grant-writer agent drafts intervention proposals with cited evidence per neighborhood.
- **Research:** Diurnal exposure equity index; downscaling accuracy report.
- **Impact:** Directs scarce cooling budgets to hottest, most vulnerable blocks.
- **Originality:** Equity+heat combos exist in research, none in the winner pool; solid demo imagery. **Feasibility:** High; **Limitations:** ECOSTRESS orbit gaps; outcomes need long-term validation.
- **Demo:** Sun-cycle slider sweeping a city showing thermal inequity bloom after sunset.

## Idea 7 — GeoAgent: provenance-first research copilot for NASA archives

- **Concept:** An agent that turns a natural-language science question into a verified data pipeline across CMR/DAACs and returns answers + reproducible notebooks + citation receipts.
- **Problem:** NASA data discovery/processing is the field's moat of pain; non-experts bounce off; experts waste hours on plumbing.
- **Users:** researchers, students, journalists, NASA data outreach.
- **NASA data:** All of it via CMR/OSDR/earthaccess (meta-level).
- **Innovation:** "Receipts or it didn't happen" — every claim links to datasets, parameters, code; benchmark of tasks with known answers (e.g., "has Lake Mead's area shrunk since 2015?").
- **AI/ML:** Planning LLM + tool suite (search→subset→compute→plot), verifier models, RAG over docs; eval harness.
- **Risk:** Infrastructure-flavored; needs a vertical demo to feel like impact; LLM reliability engineering is heavy for 48h (mitigated by narrow domain).
- **Verdict:** Excellent as an embedded layer inside Ideas 1–3 rather than a standalone submission.

---

## Scoring matrix (1–5; weighted)

Weights: Novelty vs winners 20% · NASA-data centrality 15% · AI/ML substance 15% · Feasibility in runway 20% · Demo wow 10% · User impact 10% · Verification ability 10%

| Idea | Novelty | NASA centrality | AI/ML | Feasibility | Wow | Impact | Verification | **Weighted** |
|---|---|---|---|---|---|---|---|---|
| 1 TerraPulse (NISAR) | 5 | 5 | 4 | 3.5 | 5 | 4 | 4.5 | **4.50** |
| 2 HarvestProof | 3.5 | 4 | 4.5 | 5 | 3 | 4.5 | 5 | 4.13 |
| 3 SmokePath | 4 | 4.5 | 4 | 4 | 4.5 | 5 | 4.5 | 4.33 |
| 4 EddyWatch (SWOT) | 5 | 5 | 4 | 2.5 | 4.5 | 3.5 | 2.5 | 3.88 |
| 5 BreathHour (TEMPO) | 3.5 | 4.5 | 3.5 | 4.5 | 3.5 | 4.5 | 5 | 4.05 |
| 6 CoolBlocks (ECOSTRESS) | 3.5 | 4 | 3.5 | 4 | 4 | 4.5 | 3.5 | 3.83 |
| 7 GeoAgent standalone | 4.5 | 4 | 4.5 | 2.5 | 3 | 2.5 | 3.5 | 3.63 |

## Selection rationale

- **TerraPulse (Idea 1) selected as primary direction.** It uniquely combines: (a) the largest novelty moat — the only unexploited *brand-new mission* (NISAR provisional data, July 2026 — verified), which also maps to "Best Use of Data" and "Best Use of Science" judging profiles; (b) deep fit with the team's CV + geospatial + pipeline strengths; (c) a station-verifiable uncertainty story (gap #2) — the single biggest differentiator the 2025 pool lacked; (d) an agentic component with a *purpose* (provenance receipts) rather than decoration; (e) spectacular one-screen demo material.
- **SmokePath (Idea 3) is the strongest alternate** if NISAR access/processing proves riskier than expected during the feasibility spike — similar architecture, lower processing risk, equally strong verification (PurpleAir).
- **HarvestProof (Idea 2)** is the highest-feasibility fallback with the best verification story (USDA ground truth) and could be scaled down to a 48h-only build if the team shrinks.
- **GeoAgent is folded into TerraPulse** as the provenance/verification layer (agent plans and receipts every analysis), giving the submission its purposeful agentic AI component.

**Decision:** proceed to full blueprint for **TerraPulse — "Ground truth for a moving planet."**
