import { NextResponse } from "next/server";
import { getRawAoi } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const aoi = await getRawAoi(params.id);
  if (!aoi) {
    return NextResponse.json({ error: "aoi not found", aoiId: params.id }, { status: 404 });
  }
  return NextResponse.json({
    aoiId: params.id,
    provider: "Nevada Geodetic Lab (mirror) / EarthScope",
    note: "Station velocities are the ground-truth backbone for validation and conformal calibration.",
    stations: aoi.gnss,
  });
}
