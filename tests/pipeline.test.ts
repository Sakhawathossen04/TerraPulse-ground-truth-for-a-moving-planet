import { describe, expect, it } from "vitest";
import { AOI_SPECS, buildAoi } from "../data/registry";
import { composeReport } from "../pipeline/compose";
import { zReport } from "../lib/types";

const NOW = "2026-09-18T12:00:00.000Z";

describe("composeReport", () => {
  it("produces schema-valid reports for every AOI", () => {
    for (const spec of AOI_SPECS) {
      const report = composeReport(buildAoi(spec), NOW);
      expect(() => zReport.parse(report)).not.toThrow();
    }
  });

  it("recovers literature-calibrated velocity within the 95% CI", () => {
    for (const spec of AOI_SPECS) {
      const report = composeReport(buildAoi(spec), NOW);
      const truth = spec.trueVelocityMmYr;
      expect(report.headline.lo95).toBeLessThanOrEqual(truth + 1e-9);
      expect(report.headline.hi95).toBeGreaterThanOrEqual(truth - 1e-9);
    }
  });

  it("meets the conformal coverage target on every AOI", () => {
    for (const spec of AOI_SPECS) {
      const report = composeReport(buildAoi(spec), NOW);
      expect(report.validation.coverageMet).toBe(true);
      expect(report.validation.conformalCoverage).toBeGreaterThanOrEqual(report.validation.targetCoverage);
    }
  });

  it("classifies strongly subsiding AOIs as subsiding (not creep)", () => {
    const mex = composeReport(buildAoi(AOI_SPECS[0]), NOW);
    expect(mex.headline.trendClass).toBe("subsiding");
  });

  it("attaches a receipt id, narrator lines and staleness", () => {
    const report = composeReport(buildAoi(AOI_SPECS[1]), NOW);
    expect(report.receiptId).toMatch(/^rcpt-jakarta-/);
    expect(report.narrator.length).toBeGreaterThanOrEqual(6);
    expect(report.staleness.daysSinceLastEpoch).toBeGreaterThan(30);
    expect([
      "fresh (12-day NISAR revisit cycle)",
      "recent (1–2 revisit cycles old)",
      "stale — pipeline refresh pending",
    ]).toContain(report.staleness.flag);
  });

  it("is deterministic: same inputs → identical reports", () => {
    const a = composeReport(buildAoi(AOI_SPECS[2]), NOW);
    const b = composeReport(buildAoi(AOI_SPECS[2]), NOW);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
