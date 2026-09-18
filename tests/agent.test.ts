import { describe, expect, it } from "vitest";
import { planAnalysis } from "../lib/agent";

describe("agent planner", () => {
  it("emits the full ordered tool plan ending with a receipt", () => {
    const plan = planAnalysis({ aoiName: "Test Basin", bbox: [0, 0, 1, 1] });
    const tools = plan.steps.map((s) => s.tool);
    expect(tools[0]).toBe("cmr.search");
    expect(tools).toContain("insar.invert");
    expect(tools).toContain("gnss.validate");
    expect(tools[tools.length - 1]).toBe("receipt.write");
    expect(plan.planner).toBe("deterministic/rule-v1");
  });

  it("flags when the plan exceeds the demo deadline", () => {
    const plan = planAnalysis({ aoiName: "Slow AOI", bbox: [0, 0, 1, 1], deadlineMinutes: 1 });
    expect(plan.note).toMatch(/exceeds/i);
  });

  it("reports wall-time on every step", () => {
    const plan = planAnalysis({ aoiName: "X", bbox: [0, 0, 1, 1] });
    for (const s of plan.steps) {
      expect(s.ms).toBeGreaterThan(0);
      expect(s.summary.length).toBeGreaterThan(5);
    }
    expect(plan.totalMs).toBe(plan.steps.reduce((acc, s) => acc + s.ms, 0));
  });
});
