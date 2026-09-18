import { describe, expect, it } from "vitest";
import { AOI_SPECS, buildAoi } from "../data/registry";
import { composeReport } from "../pipeline/compose";
import { assertReceipt, newReceiptId, stableStringify } from "../lib/receipts";
import { zReceipt } from "../lib/types";
import fs from "node:fs";
import path from "node:path";

const NOW = "2026-09-18T12:00:00.000Z";

describe("receipts", () => {
  it("builds schema-valid receipts for every AOI", () => {
    for (const spec of AOI_SPECS) {
      const report = composeReport(buildAoi(spec), NOW);
      const raw = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "data", "artifacts", "reports", `${spec.id}.json`), "utf8")
      );
      void raw;
      const receipt = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "data", "artifacts", "receipts", `${report.receiptId}.json`),
          "utf8"
        )
      );
      expect(() => zReceipt.parse(receipt)).not.toThrow();
      expect(() => assertReceipt(receipt)).not.toThrow(); // hash intact
    }
  });

  it("detects tampering via content hash", () => {
    const report = composeReport(buildAoi(AOI_SPECS[0]), NOW);
    const receipt = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "data", "artifacts", "receipts", `${report.receiptId}.json`),
        "utf8"
      )
    );
    receipt.validation.maeMmYr = 0.0001; // someone "improves" the numbers
    expect(() => assertReceipt(receipt)).toThrow(/contentHash mismatch/);
  });

  it("generates stable ids and deterministic canonical JSON", () => {
    expect(newReceiptId("x", NOW)).toBe(newReceiptId("x", NOW));
    const a = stableStringify({ b: 1, a: [2, { d: 3, c: 4 }] });
    expect(a).toBe('{"a":[2,{"c":4,"d":3}],"b":1}');
  });
});
