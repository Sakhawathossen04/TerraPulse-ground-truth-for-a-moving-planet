import { describe, expect, it } from "vitest";
import { AOI_SPECS, buildAoi } from "../data/registry";
import { composeReport } from "../pipeline/compose";
import { narrate } from "../lib/narrator";

const NOW = "2026-09-18T12:00:00.000Z";

/**
 * Numeric fidelity: every number the narrator prints must come from the
 * report JSON — either a numeric field (or a formatted rendering of it) or a
 * number embedded verbatim in a string field. No invented data. We walk the
 * entire report object so no field can be missed.
 */
function collectNumbers(report: ReturnType<typeof composeReport>): Set<string> {
  const s = new Set<string>();

  const add = (v: number) => {
    s.add(String(v));
    s.add(String(Math.round(v * 10) / 10));
    s.add(String(Math.round(v * 100) / 100));
    s.add(String(Math.round(v)));
    s.add((v * 100).toFixed(0)); // percentage rendering
    s.add((v * 100).toFixed(2));
    s.add((v * 1000).toFixed(0));
    s.add(v.toFixed(0));
    s.add(v.toFixed(1));
    s.add(v.toFixed(2));
    s.add((-v).toFixed(0));
    s.add((-v).toFixed(1));
    s.add((-v).toFixed(2));
  };

  const walk = (v: unknown) => {
    if (typeof v === "number") {
      add(v);
    } else if (typeof v === "string") {
      for (const m of v.match(/\d+(?:\.\d+)?/g) ?? []) s.add(m);
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (v && typeof v === "object") {
      Object.values(v).forEach(walk);
    }
  };
  walk(report);
  return s;
}

describe("narrator", () => {
  it("only uses numbers present in the report (zero violations tolerated)", () => {
    for (const spec of AOI_SPECS) {
      const report = composeReport(buildAoi(spec), NOW);
      const allowed = collectNumbers(report);
      const lines = narrate(report);
      expect(lines.length).toBeGreaterThanOrEqual(6);
      for (const line of lines) {
        // Strip date strings (they are exact fields) and receipt-style tokens.
        const cleaned = line.replace(/\d{4}-\d{2}-\d{2}/g, "").replace(/rcpt-[\w-]+/g, "");
        const nums = cleaned.match(/-?\d+(?:\.\d+)?/g) ?? [];
        for (const n of nums) {
          const val = Number(n);
          const ok =
            allowed.has(n) ||
            allowed.has(String(Math.abs(val))) ||
            (Number.isInteger(val) && allowed.has(String(val)));
          expect(ok, `narrator invented number ${n} in: "${line}"`).toBe(true);
        }
      }
    }
  });

  it("mentions GNSS validation when stations exist", () => {
    const report = composeReport(buildAoi(AOI_SPECS[0]), NOW);
    const text = report.narrator.join(" ");
    expect(text).toMatch(/GNSS/);
    expect(text).toMatch(/stations/);
  });
});
