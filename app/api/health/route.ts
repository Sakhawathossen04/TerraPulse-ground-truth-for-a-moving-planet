import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/data";
import { getReceipt } from "@/lib/data";
import { assertReceipt } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getCatalog();
    let receiptsOk = 0;
    for (const entry of catalog) {
      const r = await getReceipt(entry.receiptId);
      if (!r) continue;
      try {
        assertReceipt(r);
        receiptsOk++;
      } catch {
        // hash mismatch counts as unhealthy
      }
    }
    return NextResponse.json({
      status: receiptsOk === catalog.length ? "ok" : "degraded",
      aois: catalog.length,
      receiptsVerified: receiptsOk,
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
