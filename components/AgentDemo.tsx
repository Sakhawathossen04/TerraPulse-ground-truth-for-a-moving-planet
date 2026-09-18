"use client";

import { useState } from "react";
import type { AgentPlan } from "@/lib/types";

export default function AgentDemo({ aoiId, aoiName, bbox }: { aoiId: string; aoiName: string; bbox: [number, number, number, number] }) {
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ aoiId, aoiName, bbox }),
      });
      setPlan(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-medium">Agent: plan a fresh analysis</h2>
          <p className="text-xs text-muted">
            Provenance-first planner — CMR search → download → coregister → invert → validate → receipt. It calls
            tools; it never invents numbers.
          </p>
        </div>
        <button className="btn btn-primary text-xs" onClick={run} disabled={loading}>
          {loading ? "planning…" : "plan new-AOI analysis"}
        </button>
      </div>

      {plan && (
        <div className="mt-4 space-y-2">
          <div className="chip">planner: {plan.planner}</div>
          {plan.steps.map((s, i) => (
            <div key={i} className="rounded-lg border border-edge bg-ink/60 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-signal">{s.tool}</span>
                <span className="text-muted">{(s.ms / 1000).toFixed(1)}s</span>
              </div>
              <div className="mt-1 text-slate-300">{s.summary}</div>
              <div className="mt-0.5 text-muted">{s.detail}</div>
            </div>
          ))}
          <div className="rounded-lg border border-signal/30 bg-signal/5 p-3 text-xs text-slate-300">
            {plan.note}
          </div>
        </div>
      )}
    </section>
  );
}
