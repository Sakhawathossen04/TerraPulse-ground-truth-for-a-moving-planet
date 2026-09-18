# 10 Winning NASA Space Apps Projects — Deep-Dive Research Dossier

**Scope:** NASA International Space Apps Challenge 2025 Global Winners (announced Dec 18, 2025). 11,511 total submissions in 2025; 10 global awards selected from local-event nominees. All 10 projects studied here are **verified Global Winners** via NASA's official announcement (nasa.gov, Dec 18, 2025) and the Space Apps global winners list (Wikipedia, citing spaceappschallenge.org).

**Research date:** September 18, 2026. Sources: official project pages, live deployments, GitHub repos, NASA announcements, LinkedIn self-reports, Medium write-ups, web search. Each section separates **Verified** (observed in primary/official sources), **Inference** (reasonable technical conclusion, flagged), and **Unknown** (could not be established).

**Event context (verified):** 2026 event is **November 14–15, 2026**; registration opened **August 26, 2026**; challenge statements were published ~4 weeks before the event in 2025 (2025 FAQ cites Oct 28 release); 18 challenges in 2025 across Solar Weather, Meteors, Agriculture, ISS, Exoplanets, Earth observation, and commercialization topics. 2024→2025 shows a trend toward: actionable Earth data, commercialization of LEO, AI-centric challenges, and storytelling.

**Fresh-mission context (verified):**
- **NISAR** (NASA–ISRO dual-band SAR) launched July 30, 2025; **provisional L1/L2 data released July 20, 2026**; ISRO S-band products released July 24, 2026. Public InSAR-grade products are ramping up through 2026 — extremely fresh, barely tapped by hackathon teams.
- **SWOT** is producing new submesoscale ocean science (Archer et al., *Nature* 2025, "Wide-swath satellite altimetry unveils global submesoscale…"), with NASA Earthdata actively publishing SWOT+PACE+NISAR fusion stories (Dec 2025 Gulf Stream frontal eddies).
- **TEMPO** is operational and routinely used by air-quality managers (hourly NO2/O3/formaldehyde over North America; Maryland AQ managers used it in 2025; Yale EFOS used TEMPO NO2 for traffic-pollution studies).

---

## 1. SpaceGenes+ — *Best Use of Science*
**Team:** Saloni T. (solo, Germany) · **Challenge:** "Build a Space Biology Knowledge Engine" · **Country:** Germany
**Sources:** spacegenes-plus.framer.website (live), spacegenes-bj15.bolt.host (live dashboard), data.nasa.gov OSD-288 entry, OSDR study page OSD-288, Medium post by the creator (Dec 26, 2025), NASA winners announcement.

### Verified
- Interactive dashboard for detecting **synergistic gene-expression responses** to combined spaceflight stressors (radiation + microgravity) in NASA GeneLab/OSDR data.
- Uses **one real dataset live: OSD-288** ("Transcriptome analysis of murine spleen in space", submitted 2019, v9 on OSDR) — verified to exist on osdr.nasa.gov. Other case studies on the site are explicitly labeled "conceptual."
- The synergy rule is published on the site: **flag a gene when FC_combined > 1.5 × (FC_radiation + FC_microgravity)** — a fixed fold-change threshold formula, not a statistical model.
- Highlighted genes: TP53, ATM, BRCA1, GADD45A, CDKN1A (p21) — DNA-damage/cancer pathway genes.
- Tech (self-reported, consistent with artifacts): **Framer** marketing site, **Bolt-hosted** interactive dashboard, Python (Pandas/NumPy) preprocessing, CSV/Sheets curation, Figma design. Exportable heatmap PNG. No backend, no database.
- The Medium post confirms it was built **by a solo designer** as an MVP during the hackathon; the framing is "hypothesis-generation tool," not validated science.

### Reasonable inference
- The dashboard is a client-side table/heatmap viewer over a small curated CSV (10–15 genes × 4 conditions); "synergy engine" = the threshold formula run in Python at build time.
- No significance testing (no DESeq2 stats, no p-value/FDR handling surfaced) — the threshold formula substitutes for statistics.
- Judging likely rewarded: scientifically literate framing (additive-vs-synergistic stressor interaction is a real open question in space biology), perfect persona clarity (space biologists, drug developers, mission planners), and honest labeling of conceptual vs. live content.

### Unknown
- Exact gene list provenance (how the 10–15 genes were selected), whether fold-changes came from the OSD-288 processed files directly or were re-derived, and whether any code is public (no GitHub found).

### Strengths
- **One screen, one insight**: a designer's compression of a bioinformatics workflow into a single heatmap + flags.
- Real dataset, transparent method, honest scope statements (rare among hackathon projects).
- Strong narrative bridge to terrestrial cancer biology (dual-use framing).

### Weaknesses
- N=1 dataset; no statistical rigor (threshold instead of interaction-model/FDR); no reproducible code published.
- "Synergy" in expression fold-change is a simplification biologists would challenge (no variance, no significance).
- Zero backend/AI — the least technical of the science winners.

### Missing opportunities
- Multi-study meta-analysis across the 100+ OSDR studies; variance-aware interaction modeling; pathway-level (not gene-level) synergy; agentic literature linkage.

### Why it stood out
- **Clarity beat engineering.** A solo designer identified a real analytic gap (stressor interaction), named it memorably ("synergy"), visualized it in one artifact from real NASA data, and scoped honestly. Best Use of Science rewarded scientific insight + communication, not sophistication.

---

## 2. Resonant Exoplanets (Resonant Worlds Explorer) — *Best Use of Data*
**Team:** Adhvaidh S., Gabriel S., Jack A., Sahil S. (US) · **Challenge:** "A World Away: Hunting for Exoplanets with AI"
**Sources:** resonant-planet.vercel.app (live, deployed on Vercel), hosted research-paper PDF (indexed, dated Oct 5, 2025), YouTube demo, NASA winners announcement, self-reported tech list.

### Verified
- Full-stack exoplanet pipeline: NASA mission data ingestion (Kepler, TESS, JWST/MAST, Hubble), transit detection, ML classification of candidates, atmospheric-chemistry checks, web UI with plots, auto-generated PDF reports.
- **Published a research paper** with the submission ("A Physics-Informed Machine Learning Pipeline for Exoplanet Transit…") — verified the PDF exists on their domain; deployed microservice referenced on Google Cloud Run.
- Self-reported stack (consistent with paper): Python, **FastAPI**, **XGBoost**, **Lightkurve**, **Astroquery**, React/TypeScript, Google Cloud, ReportLab.
- Core claim: **"Modulus"** — an exact-arithmetic solver built by modifying the open-weights Qwen LLM into a "Prime Algebra Transformer" that solves physics/chemistry problems "without numerical error" (chemical equilibrium, reaction timescales, disequilibrium biosignature logic such as O₂+CH₄ coexistence).

### Reasonable inference
- Transit detection follows the standard BLS (Box Least Squares) path via Lightkurve on TESS/Kepler light curves; XGBoost does candidate vetting (period/depth/SNR features) — the standard NASA-exoplanet-hackathon recipe.
- The "biosignature" step is plausibly a rule-based/thermodynamic disequilibrium check (e.g., compute equilibrium mixing ratios, flag coexistences that equilibrium cannot explain), with the LLM-derived solver positioned as the differentiator.
- The exact-arithmetic claim is **extraordinary and not independently verifiable**; most likely a hybrid (symbolic/number-theory routines + transformer components). What judges saw was a *differentiated technical narrative* with a paper behind it — which is what won, regardless of how the solver works internally.

### Unknown
- Model weights, training data, eval numbers for Modulus/PAT; whether chemistry outputs were validated against literature cases; code availability (no public repo found); how much of the pipeline ran live vs. precomputed.

### Strengths
- End-to-end automation of a real scientific workflow (fetch → detect → vet → characterize → report).
- **Research artifact** (paper) + honest AI-disclosure section — top-tier credibility signals.
- Positions AI as *precision infrastructure*, not decoration; attacks the false-positive problem, the field's actual pain point.

### Weaknesses
- Heavy claims with thin public verifiability; exact-math narrative risks scrutiny; UI (from live site) is a functional demo rather than a polished product.
- JWST spectra handling is scientifically hard (transit spectroscopy reduction is a specialist task) — depth of validation unclear.

### Missing opportunities
- Open-source release; benchmark against vetted False-Positive-Probability tools; human-in-the-loop triage UX.

### Why it stood out
- Best Use of Data rewarded **breadth + depth of NASA data usage and the rigor story**: multi-mission ingestion, physics validation layer, and a written paper. It reads like a lab tool, not a toy.

---

## 3. SkySense (Team Twisters) — *Best Use of Technology*
**Team:** Fernando A., Marcelo T., Mariana D., Regina R., Regina F. (Mexico) · **Challenge:** "Will It Rain on My Parade?"
**Sources:** skysense.surf (live), NASA winners announcement (project described as SkySense), LinkedIn self-report (Global Nominee → Global Winner, Monterrey local event), submission-page tech list, demo video (Google Drive).

### Verified
- **Web app for personalized weather-window planning**: user picks activity/place/date; system scores weather risk across rain, wind, temperature, humidity, visibility and recommends safest time windows.
- Live deployment at skysense.surf; React front end; Firebase auth/storage/hosting; Google Calendar integration and Google sign-in; notifications.
- Data: **NASA POWER API** (radiation, temperature, humidity, wind, precipitation), NASA Earthdata/Giovanni/GES DISC cited, **Open-Meteo** for real-time weather, **OpenStreetMap** tiles + Nominatim geocoding, **Gemini API** powering **"TwisterBot"** conversational assistant (alerts, reminders, explanations).
- Honest AI-disclosure: code logic by team; Lovable/Builder.io used to accelerate scaffolding; ChatGPT for icon generation. This disclosure is on the official page.

### Reasonable inference
- The "predictive model" is a rule-based/weighted risk scoring over NASA POWER + Open-Meteo variables (comfort/plan-ability indices), not a trained ML model; Gemini handles natural-language interaction.
- The technical win most likely rests on: multi-API fusion (NASA POWER's unusual historical/climatology angle vs. consumer weather apps), polished glassmorphism UX, calendar/notification integration (product feel), and the assistant.

### Unknown
- Whether any trained model exists; latency/robustness of POWER queries; monetization; code repo.

### Strengths
- **Broadest consumer appeal** of all 10; obvious "why would a normal person use this" story.
- Product-grade integration surface (auth, calendar, notifications, chatbot) — feels like a startup, which matches "Best Use of Technology."
- Multi-source honesty (NASA + Open-Meteo) with NASA POWER as the differentiator.

### Weaknesses
- Thin AI/ML substance beyond the chatbot; risk scores are heuristic; weather accuracy is capped by Open-Meteo (not NASA's model).
- Crowded space: many "weather planner" entries every year; differentiation is execution-level, not conceptual.

### Missing opportunities
- Actual probabilistic forecasting from POWER climatology; uncertainty communication; accessibility/i18n depth (Spanish-first would strengthen the local story).

### Why it stood out
- Executed the "most commercial-feeling product" in the pool: real integrations + conversational layer + clean UX on top of genuine NASA data. Technology award = integration mastery this year.

---

## 4. Astro Sweepers — *Galactic Impact*
**Team:** Harshiv T., Pragathy S., Pratik J., Sherlin D., Yousra H., Zienab E. (Universal Event; 4-country team, Philippines-linked recognition) · **Challenge:** "Commercializing Low Earth Orbit (LEO)"
**Sources:** astro-sweepers.vercel.app (live; lists DAS files, Software Usage Agreement, financial model, executive summary, audit report, business plan PDFs), NASA winners announcement, massive self-documented submission text, LinkedIn verification of founder.

### Verified
- **Orbital-debris compliance & risk platform** that automates NASA's **Debris Assessment Software (DAS)** workflow and generates **ODAR/EOMP**-style reports; computes a proprietary risk index (**ASRI**, built from a **DCRA v3** scoring model: Debris legacy / Compliance / Risk-burden / Sustainability weights 0.45/0.20/0.25/0.10 via sensitivity studies on NASA **SPARK-2022** data).
- Ingests public orbital data: **NASA SPARK-2022**, **Space-Track TLEs/CDMs**, ESA DISCOS; cites NASA Orbital Debris Program Office assets (ORDEM 3.2, LEGEND, DAS, ORSAT, NASA-STD-8719.14).
- Documented worked case study: CZ-2C rocket body, 613×671 km / 98.4°, DCRA ≈ 0.79, DAS lifetime >100 yr, Ec ≈ 3.3e-4; single 22 m/s apogee burn to 550 km perigee → lifetime <25 yr, Ec 4.1e-5, compliance restored; robustness sweeps over area-to-mass, materials, perigee band.
- Long-term population forecasts (2025–2100): with/without-DAS and with-ASRI scenarios (object counts, mean Pc, lifetimes).
- PDF deliverables published on the site (financial model, 5-year plan, "audit report").
- An **exploratory CNN** on a Kaggle debris-imagery dataset for debris/rocket/payload classification — self-reported as *not* integrated into the submission.

### Reasonable inference
- Core engineering = Python orbit math (vis-viva Δv estimates, perigee lowering) + wrappers around DAS runs + template-filling for ODAR/EOMP docs + a scoring/normalization layer + charts. The "ML roadmap" (GNNs, RL sweepers, insurance pricing) is vision, not build.
- The 2-D altitude–inclination density map for risk burden is a kernel-smoothed histogram over the TLE population — standard space-debris situational practice.
- Judging likely rewarded: deep engagement with a real NASA regulatory artifact (DAS/ODAR), quantified before/after impact, and an unusually complete "company-in-a-box" narrative (business + policy + science).

### Unknown
- Whether DAS runs were automated live in the web product or run offline in the backend; verification of the financial "audit" (self-published, not third-party in any verifiable sense); code availability (repo not found publicly); ASRI weight derivation beyond stated sensitivity studies.

### Strengths
- **Deepest NASA-standards engagement** in the pool (DAS, ODAR/EOMP, NASA-STD-8719.14) — judges from NASA would recognize the artifacts instantly.
- Quantified counterfactuals ("22 m/s turns a failure into compliance") — perfect Galactic Impact story.
- Multi-stakeholder product (operators, insurers, regulators) + policy vision (LEO Accords, UNOOSA clearinghouse).

### Weaknesses
- Heavy business-plan inflation relative to hackathon scope (revenue tiers, "audited" statements) — credibility risk if scrutinized.
- Much of the AI story is roadmap; the deployed product is scoring + dashboards + documents.
- DAS dependency: real operators use licensed/paid tooling; the product's automation depth is unverifiable from public materials.

### Missing opportunities
- Open-sourcing the scoring layer; live Space-Track integration demo; validation against known catalog events (real conjunctions); publishing the population model.

### Why it stood out
- It converted a niche, high-stakes NASA workflow (debris compliance) into an auditable decision product with a policy arc. Galactic Impact = the project judges could imagine changing an industry's behavior.

---

## 5. PureFlow — *Best Mission Concept*
**Team:** Esthefany M., João F., Laiza L., Lara D., Pedro H., Thayane D. (Brazil) · **Challenge:** "Your Home in Space: The Habitat Layout Creator"
**Sources:** larasdiniz.github.io/PureFlow-2025 (live app), GitHub repo (verified), YouTube demo, NASA winners announcement.

### Verified
- **Interactive habitat design platform**: 3D placement of modules (crew quarters, life support, labs), real-time derived quantities (mass, power draw, volume) as you design, life-support loop simulation (ECLSS, greenhouse, ISRU effects on consumables), material/shielding selection vs. destination hazards (lunar radiation, Martian dust storms).
- Signature feature: **live coupling to NASA's DONKI space-weather database** — real solar events hit your design in simulation ("Would your habitat survive a solar storm *today*?").
- GitHub repo is real and public (student CS team; README minimal).
- Self-reported tools: 3D web stack, DONKI API, ElevenLabs audio.

### Reasonable inference
- Browser-based Three.js/Babylon scene with a resource-calculation layer (per-module mass/power/volume tables) and a rule-based survival check against DONKI event intensity (SEP/proton flux → shielding attenuation estimates). The "physics engine" is almost certainly lookup tables + algebra, not full physics.
- The DONKI coupling is the judged differentiator: live data + mission-design logic + astronaut-survival framing.

### Unknown
- Accuracy basis of resource coefficients (NASA-STD-3001-style figures?), whether scenario results are validated against any published habitat study, and internal code quality (repo is thin).

### Strengths
- **Gamified expert tool**: converts systems engineering into a playable loop with instant feedback — superb demo mechanics.
- Live NASA data as adversarial pressure (solar storms) — memorable, judge-proof moment.
- Clear challenge fit (it is literally the habitat-layout challenge, executed end-to-end).

### Weaknesses
- Scientific grounding of numbers is opaque; survival outcomes could feel arbitrary.
- Repo/docs thin relative to the product; no research artifact.

### Missing opportunities
- Calibration against published ECLSS benchmarks; multi-mission comparison mode; exportable engineering summary sheets.

### Why it stood out
- Best Mission Concept rewarded the *complete concept*: design → constraints → live-threat validation → survival verdict. It made judges feel the mission, not read about it.

---

## 6. AakashNet (Photonics Odyssey) — *Most Inspirational*
**Team:** Manish D., Deeraj K., Prasanth G., Rajalingam N., Rashi M., Sakthi R. (India) · **Challenge:** "Commercializing Low Earth Orbit (LEO)"
**Sources:** NASA winners announcement (detailed description), Canva pitch deck, Google Drive project folder, submission text.

### Verified
- **Concept-design project** for an Indian LEO satellite-mesh broadband system: Ku/Ka-band phased-array user terminal ("Aakash Jodak", ~1280 elements), laser inter-satellite links, ISRO ISTRAC-connected gateways, indigenous manufacturing (ISRO/HAL/BHEL), terminal BOM capped at ₹23,000, AES-256/WPA3 → PQC roadmap.
- Frontend deliverable: HTML/Tailwind/JS dashboard simulating coverage, beam steering, throughput — **locally hosted, no backend**.
- Hardware/RF work: **MATLAB and OpenEMS** modeling for phased-array performance and link budgeting (self-reported).
- NASA data usage: **NASA Image and Video Library** only — the thinnest NASA-data footprint in the pool.

### Reasonable inference
- Judged on vision + inspiration + socioeconomic framing (700M+ offline Indians, sovereignty, defense, Digital India/Atmanirbhar Bharat), not on software. The RF math (link budgets, beam steering) gave it technical garnish; the story carried it.

### Unknown
- Depth of the MATLAB/OpenEMS artifacts (no public files verified), whether any regulatory/spectrum analysis (ITU/ISRO coordination) was done, and business case details.

### Strengths
- **Emotional scale**: national infrastructure narrative with clear beneficiaries; sovereign-technology framing plays strongly with international judging panels.
- Concrete engineering choices (element counts, bands, BOM cap) make the concept feel executable rather than hand-wavy.

### Weaknesses
- No live system beyond a static-ish dashboard; minimal NASA data; many claims (cost, security roadmap) unverifiable.
- Competing against real constellation economics (Starlink/JioSpaceFiber) without a differentiation analysis of "why this wins commercially."

### Missing opportunities
- Coverage/latency simulation from public TLEs (they had the tools to make an actual orbital mesh sim — that would have been a killer demo); ground-segment cost model; spectrum/coexistence study.

### Why it stood out
- Most Inspirational = story + stakes + identity. It proves that with the right category, a **well-engineered concept paper with a resonant social mission** can win globally even with a light product footprint. (Strategic lesson, not a template for our team.)

---

## 7. A Solar Tale (HerCode Space) — *Best Use of Storytelling*
**Team:** Alice R., Joselyn R., Paula C., Pierina J. (Universal Event; Peru-linked) · **Challenge:** "Stellar Stories: Space Weather Through the Eyes of Earthlings"
**Sources:** a-solar-tale.netlify.app (live), YouTube demo, submission text, NASA winners announcement.

### Verified
- **Scrollytelling children's story**: the Sun narrates five poetic acts spanning mythology → Galileo → modern space weather → a child's curiosity; teaches flares/CMEs/aurora impacts on daily life.
- Stack: React, SCSS, **react-scrollama** (scroll-driven storytelling), mobile-first, Netlify deployment, Google Fonts (Poppins).
- AI disclosure: **Nano Banana** (imagery), Pixaverse (video?), **Narakeet** (voice), Gemini/ChatGPT (writing assistance); all science anchored to NASA/NOAA sources (NASA Solar Storms & Flares pages, NOAA SWPC, NASA "Human Activity Impacted Space Weather").

### Reasonable inference
- Content pipeline: script (Gemini/ChatGPT-assisted, human-curated) → AI illustrations → voiceover (Narakeet) → scroll-synchronized web presentation. Zero ML in the product; "AI" is production tooling.
- Judged on narrative quality, illustration cohesion, educational clarity, and source trust.

### Unknown
- Translation/localization plans, classroom adoption pathway (teacher guides?), accessibility features (captions, reduced motion).

### Strengths
- **Perfect category fit + perfect execution shape**: a story product judged as a story.
- Source-anchored science in a children's format — rare discipline; the NASA/NOAA citations give teachers confidence.
- Lightweight stack, flawless deploy — zero fragility.

### Weaknesses
- No interactivity beyond scrolling; small data footprint; impact hard to measure (no educator feedback loop in evidence).

### Missing opportunities
- Bilingual/multilingual versions; classroom quiz/export kit; curated path to raw NASA media assets for teachers.

### Why it stood out
- Storytelling award winners are chosen on craft + clarity + emotional resonance; this was purpose-built for exactly that. Lesson: **match the artifact to the award category deliberately.**

---

## 8. Gaia+LEO — *Global Connection*
**Team:** Adam H., Katia L., Prajwal S., Upendra K. (US) · **Challenge:** "Commercializing Low Earth Orbit (LEO)"
**Sources:** github.com/stayingfoolish/gaia-LEO (repo verified: `mip_model.py` 49 KB, two Dash dashboards ~29/36 KB, three notebooks: antenna sizing, constellation analysis, satellite; main.js bundle), README, demo video, NASA winners announcement.

### Verified
- **Mixed-integer optimization (MIP) framework** co-designing orbital + terrestrial data-center networks: joint facility location, topology, workload placement; minimizes CapEx+OpEx under latency/bandwidth/power/thermal constraints; orbital node modeled as 40 MW solar-powered, radiatively-cooled module.
- Data inputs: **NASA POWER** (2 years: 2023-10-04→2025-10-04 — all-sky SW irradiance, 2 m temperature/max, RH), US EIA grid/energy-cost data, web-scraped data-center data, Starcloud whitepaper as domain anchor.
- Repo contains real optimization code + interactive **Dash/Streamlit-style** dashboards and Three.js visual (main.js).
- Team used AI tools (ChatGPT, Cursor, Copilot) and disclosed it.

### Reasonable inference
- `mip_model.py` (49 KB) implies a genuine solver build (likely PuLP/OR-Tools/Pyomo): binary site-selection variables, flow/routing constraints, capacity/latency constraints. Notebooks cover antenna sizing and constellation geometry — they did orbital homework.
- Judged on the Global Connection axis: a **framework others can run** + a sustainability narrative (orbital green compute) + open science practices (public repo, reproducible notebooks).

### Unknown
- Instance sizes solvable (MIP scalability), whether POWER-derived solar/thermal inputs drive real constraints or just reporting, code review status, and whether the dashboards run from a live solve or cached solutions.

### Strengths
- **Operations-research rigor** — no other winner built an actual optimizer; instantly differentiated.
- Open, reproducible, inspectable repo — the Global Connection category's archetype.
- Timely thesis (orbital AI compute) with a real policy/economics angle.

### Weaknesses
- Product skin is minimal (notebooks + Dash); no web product beyond visualization; assumptions (40 MW modules, cost curves) carry the conclusions.
- POWER data usage is input-level, not validation-level.

### Missing opportunities
- Case-study library (specific constellations/sites); sensitivity widgets; publication-ready report; partnership framing with actual cloud providers.

### Why it stood out
- Global Connection rewarded **open, reusable, globally relevant infrastructure thinking**. The optimizer + open repo + whitepaper-grade thesis hit that profile exactly.

---

## 9. Henry's Farm Adventures (Zumorroda-X) — *Art & Technology*
**Team:** Alaa A., Esraa A., Malak S., Mennatulla E. (Egypt) · **Challenge:** "NASA Farm Navigators: Using NASA Data Exploration in Agriculture"
**Sources:** henrysfarmadventures.vercel.app (live, playable), demo video, submission text, GitHub link on page, NASA winners announcement.

### Verified
- **Story-driven educational game** (Phaser, JS canvas): farmer Henry travels the world; real events as levels — India 2021 heatwave (Ramesh), Pakistan 2022 floods (Bilal), Egypt soil salinization (Mohamed), US drought (Sam), Brazil crop adaptation (João).
- Real NASA data embedded in gameplay: **Landsat before/after flood imagery** (1984→present comparisons), **NDVI** via APIs, **US Drought Monitor** map integration, NASA Earth Observatory/Harvest/Pathfinders cited, NASA food-supply tables.
- A small **Python ML model** predicting crop survival from country/year/CO₂/adaptation — presented inside the Brazil act.
- Live site confirms playable quiz/mini-game structure with NASA imagery and maps.

### Reasonable inference
- Game data flows were preprocessed into assets/JSON at build time (Phaser games don't query Earthdata at runtime); the "ML model" is a lightweight classifier (likely decision-tree/sklearn) wrapped as a demo endpoint.
- Judged on Art & Technology: pixel-art craft (Piskel), narrative warmth, and the *cleverness of embedding real data into game mechanics*.

### Unknown
- Code depth in the GitHub link (not inspected), model quality, and whether NDVI calls are live or cached.

### Strengths
- **Emotional accessibility**: NASA data reaching kids/farmers through play — high inspiration density per minute of demo.
- Concrete data grounding per level (before/after satellite imagery is a universally legible wow).
- Culturally specific, globally relevant story (Global South climate resilience).

### Weaknesses
- Game is linear/quiz-heavy; ML is thin; the challenge's "data exploration" goal is served more narratively than analytically.
- No teacher analytics or replay structure.

### Missing opportunities
- Open sandbox mode with live NDVI per region; localization beyond English; measurable learning outcomes.

### Why it stood out
- Art & Technology = craft + inventive data use. They turned datasets into *levels*, which is the most literal and delightful possible answer to the challenge.

---

## 10. Queñaris — *Local Impact*
**Team:** Borax Q., Carlos Y., Marcelo S., Máximo S., Oscar M., Pamela P. (Peru) · **Challenge:** "BloomWatch: An Earth Observation Application for Global Flowering Phenology" (they adapted to queñua/Polylepis reforestation for Arequipa's water crisis)
**Sources:** quenaris.vercel.app (live), YouTube demo, extensive submission text, NASA winners announcement, crafterwiki project page.

### Verified
- **Decision-support platform for reforestation of queñua (Polylepis) forests** in Arequipa, Peru — water-security motivated (spring-flow collapse from 14 L/s to 0 documented locally; water users: human consumption, agribusiness 28.5%, energy 67.7%, mining 11%).
- Full remote-sensing pipeline: drone orthomosaics (DJI Matrice 4, Agisoft Metashape), NASA **MODIS/FIRMS**-derived indices — NDVI, EVI, SAVI, MSAVI, NDMI, NDWI, NBR/NBR2 via **LAADS DAAC, FIRMS API, Earthdata CMR, earthaccess**; QGIS/GDAL/GeoPandas/Rasterio processing; USGS/ESA cross-referencing.
- **Gemini AI analysis** of drone orthomosaics (tree counting, health assessment, slope/water detection, conservation recommendations).
- Real production stack: **Django 5 + DRF + PostgreSQL/GeoDjango + Redis + Celery + Gunicorn**; React 18 + TS + Vite + Tailwind + shadcn/radix; Vercel + Cloudinary; Docker.
- Real-world field component: 5,000 microorganism-treated seedlings (mycorrhizae/Trichoderma) ready for a December planting; target growth/survival claims (25 cm/yr, >80% survival).
- Business model: per-hectare processing/monitoring services.

### Reasonable inference
- The strongest full-stack + geospatial engineering in the pool, and the only winner with **field operations** in the loop. The "AI" is a Gemini-driven analysis pass over orthomosaic metadata/imagery — valuable but qualitative; the index math (NDVI/NDMI/NBR) is standard and transparent.
- Local Impact category matched perfectly: hyper-local problem, verified stakeholders, deployable this season.

### Unknown
- Validation of growth/survival claims (pending field results), Gemini analysis accuracy/ground truth, and whether planting-site recommendations were checked by local ecologists.

### Strengths
- **End-to-end realism**: satellites → drone → nursery → planting plan → monitoring, with real deadlines and real partners.
- Deep, correct NASA data usage (right DAACs, right indices, right tools — earthaccess + CMR + FIRMS).
- Water-security framing converts an ecology project into a public-utility project.

### Weaknesses
- Heavy ops dependency (drones, nurseries) — hard to replicate in a demo; AI claims qualitative; the BloomWatch challenge fit is loose (adaptation, not alignment).

### Missing opportunities
- Quantified phenology tracking (they had BloomWatch's actual goal in reach); species distribution modeling with terrain/climate covariates; carbon/water-balance quantification.

### Why it stood out
- Local Impact rewards demonstrated, tangible benefit to a specific community. No other team could point to 5,000 seedlings and a planting date. **Execution + authenticity won the category.**

---

## Cross-cutting quick facts table

| # | Project | Award | Core NASA data | AI/ML reality | Product form | Code public? |
|---|---------|-------|----------------|---------------|--------------|--------------|
| 1 | SpaceGenes+ | Best Use of Science | GeneLab OSD-288 | None (threshold formula) | Framer/Bolt dashboard | No |
| 2 | Resonant Exoplanets | Best Use of Data | Kepler/TESS/JWST/Hubble (MAST) | XGBoost + custom LLM-modified solver + paper | FastAPI+React app | No (paper yes) |
| 3 | SkySense | Best Use of Technology | NASA POWER (+Earthdata refs) | Gemini chatbot only | React+Firebase app | No |
| 4 | Astro Sweepers | Galactic Impact | SPARK-2022, DAS/ODAR/ORDEM/LEGEND | CNN exploratory only | Vercel app + PDF docs | No |
| 5 | PureFlow | Best Mission Concept | DONKI (live) | None | GitHub Pages 3D app | Yes (thin) |
| 6 | AakashNet | Most Inspirational | NASA Image Library only | None | Static dashboard + deck | No |
| 7 | A Solar Tale | Best Storytelling | NASA solar pages/NOAA | AI as production tooling | Scrollytelling site | No |
| 8 | Gaia+LEO | Global Connection | NASA POWER | None (MIP/OR) | Dash + notebooks + repo | **Yes (real)** |
| 9 | Henry's Farm | Art & Technology | Landsat, NDVI, Drought Monitor, EO | Small crop model | Phaser game | Partial |
| 10 | Queñaris | Local Impact | MODIS/FIRMS/LAADS/CMR + drones | Gemini CV analysis | Django+React+PostGIS | Partial |

**Meta-observation:** Only 4/10 have meaningful trained models or custom algorithms beyond scoring formulas; only 2–3 have inspectable public code; 10/10 had a live link + video; 7/10 have a named proprietary metric/method; the average winner is a **decision-support tool for a clearly named user**, wrapped in a strong narrative, deployed publicly, with honest AI disclosure.
