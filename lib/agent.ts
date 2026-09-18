/**
 * Deterministic "agent" — provenance-first analysis planner.
 *
 * Blueprint guardrail: the agent may only *plan and call tools*;
 * it cannot invent numbers. Given an AOI name it emits an ordered tool plan
 * (CMR search → scene pick → download → coregister → invert → validate →
 * receipt) with per-step wall-times, and degrades gracefully when no LLM key
 * is configured (rule-based planner is the default and the audit baseline;
 * the LLM path is opt-in and receives the same tool schema).
 */

import type { AgentPlan, PlanStep } from "./types";

export interface PlanRequest {
  aoiName: string;
  bbox: [number, number, number, number];
  deadlineMinutes?: number;
}

export function planAnalysis(req: PlanRequest): AgentPlan {
  const steps: PlanStep[] = [];
  const [w, s, e, n] = req.bbox;
  const deadline = req.deadlineMinutes ?? 10;

  const push = (tool: string, summary: string, detail: string, params: PlanStep["params"], ms: number) =>
    steps.push({ tool, summary, detail, params, ms });

  push(
    "cmr.search",
    `Search NASA CMR for NISAR L2 GCOV scenes over "${req.aoiName}"`,
    "Temporal + spatial filter; provisional products; writes candidate list to receipt.",
    { shortName: "NISAR_L2_GCOV", bbox: `${w},${s},${e},${n}` },
    1200
  );
  push(
    "cmr.pick",
    "Rank and select epochs (max coverage, min off-nadir)",
    "Picks up to 24 epochs across the available window; stores scene IDs.",
    { maxEpochs: 24, strategy: "max-coverage" },
    640
  );
  push(
    "earthaccess.download",
    "Download GCOV rasters via earthaccess",
    "Authenticated, resumable, checksum-verified downloads to staged storage.",
    { parallel: 4, verify: "sha512" },
    42000
  );
  push(
    "insar.coregister",
    "Coregister stack to master scene",
    "DEM-assisted geometric alignment; residual offset < 0.1 pixel gate.",
    { dem: "COP-DEM 30m", master: "latest" },
    54000
  );
  push(
    "insar.invert",
    "SBAS time-series inversion → displacement per epoch",
    "Weighted least squares over interferogram pairs; unwrapped-phase input.",
    { method: "sbas", minPairs: 18 },
    96000
  );
  push(
    "stats.velocity",
    "Theil–Sen velocity + seasonal decomposition + conformal intervals",
    "Robust per-pixel slope; uncertainty calibrated against GNSS.",
    { slope: "theil-sen", seasonalHarmonics: 2, conformal: "jackknife+", targetCoverage: 0.9 },
    24000
  );
  push(
    "gnss.validate",
    "Validate against co-located GNSS velocities",
    "Nearest-station match ≤10 km; emits MAE + coverage into receipt.",
    { maxDistKm: 10 },
    8000
  );
  push(
    "receipt.write",
    "Emit JSON-LD provenance receipt",
    "Datasets, versions, parameters, QC flags, validation stats, content hash.",
    { schema: "terrapulse/receipt/v1" },
    900
  );

  const totalMs = steps.reduce((s, x) => s + x.ms, 0);
  const note =
    totalMs > deadline * 60_000
      ? `Estimated wall-time ${(totalMs / 60000).toFixed(1)} min exceeds the ${deadline}-min demo budget; the live demo uses cached precomputed artifacts and this plan is shown for transparency.`
      : `Estimated wall-time ${(totalMs / 60000).toFixed(1)} min fits the ${deadline}-min budget.`;

  return {
    aoiName: req.aoiName,
    planner: "deterministic/rule-v1",
    steps,
    totalMs,
    note,
  };
}

/**
 * Optional LLM refinement. Same tool schema, same receipts; the LLM may only
 * reorder/annotate steps — it cannot add or remove them (audited by schema).
 */
export async function refineWithLlm(plan: AgentPlan): Promise<AgentPlan> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ...plan, note: `${plan.note} (LLM planner not configured — deterministic planner used.)` };
  try {
    const base = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You annotate TerraPulse pipeline plans. Return ONLY a JSON object {annotated: string[]} with one short past-tense annotation per step, same order, same count. No numbers.",
          },
          { role: "user", content: JSON.stringify({ steps: plan.steps.map((s) => s.tool) }) },
        ],
        temperature: 0,
      }),
    });
    if (!res.ok) throw new Error(`llm ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw.replace(/^```json\n?|```$/g, "")) as { annotated?: string[] };
    const ann = parsed.annotated ?? [];
    const steps = plan.steps.map((s, i) => ({ ...s, detail: ann[i] ? `${s.detail} — ${ann[i]}` : s.detail }));
    return { ...plan, planner: "llm-annotated/deterministic-core", steps };
  } catch {
    return { ...plan, note: `${plan.note} (LLM refinement failed — deterministic plan kept.)` };
  }
}
