import { NextResponse } from "next/server";
import { getRawAoi, getReport } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [aoi, report] = await Promise.all([getRawAoi(params.id), getReport(params.id)]);
  if (!aoi || !report) {
    return NextResponse.json({ error: "timeseries not found", aoiId: params.id }, { status: 404 });
  }
  return NextResponse.json({
    aoiId: params.id,
    units: { displacement: "mm", dates: "ISO-8601" },
    epochs: aoi.epochs,
    decomposition: report.decomposition,
    staleness: report.staleness,
  });
}
