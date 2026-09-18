# Cross-Project Analysis — What Actually Wins NASA Space Apps, and Where the Gaps Are

Companion to `01-10-project-deep-dive.md`. Judgments marked as inference are interpretations from observed evidence, not confirmed facts about judges' deliberations.

---

## 1. Common winning patterns (observed across all 10)

### P1. A named, user-anchored problem — never "we used NASA data"
Every winner opens with a person and a pain: astronauts' cancer risk (SpaceGenes+), an operator facing a compliance deadline (Astro Sweepers), a family planning a wedding outdoors (SkySense), Arequipa losing its springs (Queñaris), a kid afraid of the Sun's tantrums (A Solar Tale). The NASA data is the engine, never the headline. **Inference:** judges reward "actionable tool for X" over "interesting analysis of Y" because the program is run by NASA's Earth Science Division explicitly to "transform NASA's open data into actionable tools" (quote from the official announcement).

### P2. One proprietary, nameable method
7/10 winners coined a named method or metric: Synergy Threshold Formula (SpaceGenes+), Modulus/PAT + physics-validated pipeline (Resonant), ASRI/DCRA v3 (Astro Sweepers), DCRA Δv-integrated compliance model, live DONKI survival test (PureFlow), phased-array mesh concept (AakashNet), five-act Sun-narrator structure (A Solar Tale), MIP co-design framework (Gaia+LEO). The name gives judges something to cite and makes the contribution legible as intellectual property rather than glue code.

### P3. The "one-screen artifact" demo
Each winner has a single visual that carries the whole story: one heatmap (SpaceGenes+), before/after compliance scores (Astro Sweepers), a solar storm hitting your 3D habitat (PureFlow), before/after Landsat floods (Henry's), an animated scrollytelling act (A Solar Tale). Demo design: the artifact appears within 30–60 seconds of the video/page opening.

### P4. Live NASA data > static screenshots
5/10 used genuinely live data feeds: DONKI (PureFlow), POWER/Open-Meteo (SkySense), Space-Track-style orbital data (Astro Sweepers), NDVI/drought APIs (Henry's), FIRMS/CMR pipelines (Queñaris). Even when analytics are precomputed, live *freshness* creates the "it's real right now" effect. PureFlow's "a solar storm is hitting your habitat *today*" is the archetype.

### P5. Honest scope + honest AI disclosure
SpaceGenes+ labeled its non-live cases "conceptual." SkySense, Gaia+LEO, Henry's, Queñaris, Resonant, and AakashNet all published AI-usage disclosures distinguishing team-authored logic from AI assistance. **Inference:** NASA's judging culture (open-science ethos since 2023) rewards candor; overclaiming is a known disqualifier.

### P6. Persona-structured targeting
Winners name 2–3 specific user types and shape features to them (SpaceGenes+: researchers/drug developers/mission planners; Astro Sweepers: operators/insurers/regulators). The product's IA mirrors personas — different tabs/panels per user, not a generic dashboard.

### P7. Multi-stakeholder / multi-domain narratives
Strong winners connect their tool to at least one adjacent domain: insurance (Astro Sweepers), cancer research (SpaceGenes+), national policy (AakashNet), climate adaptation (Henry's, Queñaris), sustainability economics (Gaia+LEO). This widens the perceived impact surface without expanding the build scope.

### P8. Complete submission hygiene
10/10 had: live deployed link, demo video, challenge-fit statement, data-source list, AI-use statement. Stronger ones added research papers (Resonant), standards documents (Astro Sweepers), open repos (Gaia+LEO, PureFlow). **Verified baseline:** the submission form itself requires several of these.

---

## 2. Innovation standards (implicit bar to clear in 2026)

- A **novel analytic angle** on well-known data (synergy, disequilibrium, risk-index, co-design) — not novelty of dataset alone. Using POWER or NDVI is table stakes; the angle is what differentiates.
- At least one element judges haven't seen before: a live data coupling (PureFlow), a custom solver narrative (Resonant), a regulatory artifact (Astro Sweepers), an optimizer (Gaia+LEO).
- A quantified counterfactual or claim: "22 m/s → compliant," "70% Pc reduction," "X tonnes of launch mass saved." Numbers convert curiosity into belief.
- A defensible method sentence: "we compute Y as function of Z because [reasoning]" — reviewable in 10 seconds.

## 3. Technical standards observed

- **Deployed web product** (Vercel/Netlify/GitHub Pages/Firebase) — no winner shipped "runs on my laptop."
- **Real data pipeline** somewhere in the stack, even if the demo consumes preprocessed JSON (Henry's, Queñaris, SpaceGenes+ all did build-time preprocessing into deployable artifacts — a smart hackathon pattern: heavy compute offline, light compute live).
- **Modest, working AI beats ambitious, broken AI**: SkySense (Gemini chatbot), Queñaris (Gemini orthomosaic analysis) won with thin-but-functional AI; nobody shipped a fragile research system as the core demo.
- **Speed tolerance:** heavyweight computation (DAS runs, MIP solves, transcriptomics) ran offline; products exposed results, parameters, and visualizations — not raw compute.

## 4. Product / UI standards

- Landing page that explains problem → audience → "how it works" in 3 steps → CTA (SpaceGenes+ template is the cleanest example).
- Dashboards favor **layered disclosure**: summary score/index first, drill-down second, raw data/export last (Astro Sweepers' index → components → DAS numbers).
- Glassy/minimal aesthetics (SkySense, SpaceGenes+) or thematic pixel/3D craft (Henry's, PureFlow) — both work; generic Bootstrap does not appear among winners.
- Mobile-responsive or at least demo-safe resolution; scrollytelling and step-through flows for storytelling categories.
- Export/share features (PNG heatmaps, PDF reports) — small features that signal real-world use.

## 5. NASA data usage patterns

- **APIs favored for liveness:** POWER, DONKI, FIRMS, Earthdata CMR, Open-Meteo (as real-time complement), Space-Track.
- **Archive depth for credibility:** GeneLab/OSDR, MAST (JWST/Hubble), LAADS, SPARK-2022, Landsat via Earth Observatory.
- **Cross-mission fusion as a flex:** Resonant (4 missions), Queñaris (satellite + drone + in-situ), Henry's (5 datasets across levels).
- **Citation discipline:** winners list exact datasets and often exact product IDs (OSD-288, SPARK-2022 Stream 1, MODIS products). This is cheap and reads as rigor.
- Notably: **no winner used NISAR or SWOT** (data too fresh in Oct 2025) — a genuinely open lane for 2026 (verified: NISAR provisional release July 20, 2026).

## 6. AI/ML usage pattern

- LLMs as **interfaces** (SkySense's TwisterBot) or **analysts** (Queñaris' Gemini CV pass), never as unsupervised decision-makers.
- Classical ML where it's defensible: XGBoost vetting (Resonant), small crop model (Henry's), exploratory CNN (Astro Sweepers).
- **Zero winners** shipped agentic pipelines, RAG systems, or multi-model orchestration. The agentic/AI-native space is wide open — but note the risk: the 2025 bar rewarded *purposeful, verifiable* AI, not sophistication theater.
- AI-generated *content* (art, voice, video) was fine when disclosed and human-curated (A Solar Tale won Best Storytelling with AI assets).

## 7. Visualization strategy

- Every winner had an "explain in one image" visualization: heatmaps, before/after bars, 3D scenes, scrollytelling panels, animated maps.
- Interactive drill-downs existed where data supported it (dashboards), but animation/narrative visuals carried emotional weight (games, stories, 3D).
- Publication-ready export (PNG/PDF) appeared in the science/data winners — signals respect for the user's downstream workflow.

## 8. Storytelling strategy

- **Structure:** problem stakes → "aha" mechanism → demo → impact numerically quantified → roadmap.
- **Villain framing works:** debris (Astro Sweepers), solar storms (PureFlow, A Solar Tale), climate shocks (Henry's), water scarcity (Queñaris), misleading forecasts (SkySense).
- **Human proximity:** a named beneficiary (Ramesh the farmer, the child narrator, the Arequipa spring) beats population statistics.
- Video: 2–4 minutes, screen-recorded product flow with narration; winners' videos are demos, not trailers.

## 9. Research depth

- Only Resonant shipped a research paper; Astro Sweepers shipped standards-grade documentation; Gaia+LEO shipped reproducible notebooks. That's the entire depth distribution — **most "research" was literature framing, not experiments**.
- A real evaluation (ablation, benchmark, validation against known cases) would have cleared the entire field. Nobody did proper uncertainty quantification.

## 10. Deployment maturity

- Tier 1 (product-grade): SkySense (auth, notifications), Queñaris (Django/PostGIS/Celery stack).
- Tier 2 (demo-grade, stable): SpaceGenes+, Astro Sweepers, Resonant, Henry's, PureFlow, A Solar Tale.
- Tier 3 (artifact-grade): AakashNet (local dashboard), Gaia+LEO (Dash/notebooks).
- Nobody shipped: auth-scoped multi-tenancy, background job health, monitoring, CI/CD — deployment maturity is NOT the differentiator; reliability of the demo path is.

## 11. Common weaknesses (our opening)

1. **No statistical rigor.** Thresholds and heuristics substitute for significance testing everywhere (SpaceGenes' synergy rule is the purest case). A single properly done uncertainty treatment would outclass the field.
2. **Unverifiable claims.** Financial "audits," exact-math solvers, growth-rate promises — none independently checkable. Trust is being left on the table.
3. **Code opacity.** 6/10 winners have no public code. Open, reproducible pipelines are rare enough to be a differentiator (Gaia+LEO won partly on this).
4. **No user validation.** Zero winners showed evidence of testing with a real member of their target persona (a researcher, an operator, a teacher, a farmer).
5. **Depth-1 analysis.** Most stop at first-order metrics (a fold change, an NDVI, a risk score). Few second-order insights: interactions, uncertainty, longitudinal trends, causal-ish reasoning.
6. **Weak data engineering.** Preprocessed CSVs rule; no winner demonstrated robust pipelines (retries, provenance, versioning, update cadence).
7. **Freshness blindness.** Nobody used the newest missions (NISAR, SWOT, PACE's newer products, TEMPO L3 hourly) — winners used famous-but-old data.
8. **Accessibility/i18n gap.** Global South winners tell global stories but ship English-only, desktop-first products.
9. **No measurement of impact.** No winner instrumented their own product (usage analytics tied to claimed outcomes).

## 12. Unexplored gaps / opportunities (ranked by fit to our team)

1. **Fresh missions, zero hackathon exposure:** NISAR (SAR deformation/freeze-thaw/wetlands, provisional data live), SWOT (submesoscale eddies, river discharge), TEMPO (hourly AQ over NA), PACE (plankton/aerosol OCI hyperspectral). A 2026 project that is *the first good hackathon consumer of NISAR or SWOT* automatically has a novelty moat.
2. **Uncertainty-aware decision products:** probabilistic outputs, confidence intervals, forecast-verification dashboards. Nobody in 2025 did this; every persona (event planner, farmer, insurer, AQ manager) actually needs it.
3. **Agentic orchestration of NASA archives:** a verifiable agent that plans→fetches→processes→cites across DAACs with provenance receipts. Fully open lane; must be built for auditability, not magic.
4. **Longitudinal "digital twin" products:** decade-scale change monitoring (deformation, heat, water) with alerts — winners show snapshots; nobody ships time as a first-class axis.
5. **Open science as a feature:** reproducible notebooks, DOIs, verification harnesses — the Gaia+LEO lesson amplified.
6. **Local-impact template with global replication:** Queñaris' hyper-local authenticity + a replicability kit for other regions.
7. **Standards-adjacent tooling:** Astro Sweepers proved regulators' artifacts (ODAR/DAS) are gold; other NASA standards (NASA-STD-3001 human factors, land-cover product validation protocols) are unmined.
8. **AI for sensor fusion across scales:** drone + satellite + in-situ fusion with quantified error — Queñaris gestured at this; nobody did it rigorously.

---

## 13. Implications for our team

Given the team's strengths (AI/ML/DL, LLMs, agentic systems, RAG, CV, NLP, geospatial, research, full-stack, data engineering, cloud):

- **Do not** compete on consumer-polish alone (SkySense owns that) or story-only (A Solar Tale owns that) or business-plan theater (Astro Sweepers owns that).
- **Do** combine: fresh-mission data (NISAR/SWOT/TEMPO) + rigorous-but-explainable AI (uncertainty quantification, verifiable agents) + production engineering (real pipelines, open code) + one-screen demo artifact + honest scope.
- **The winning formula for a technically deep team in 2026:** *a decision product on yesterday's unexploited mission data, with quantified uncertainty, an auditable agentic pipeline, and a demo moment judges can't forget.*
