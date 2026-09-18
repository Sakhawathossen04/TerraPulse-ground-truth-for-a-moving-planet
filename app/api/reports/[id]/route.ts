import { NextResponse } from "next/server";
import { getReport } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  if (!report) {
    return NextResponse.json({ error: "report not found", aoiId: params.id }, { status: 404 });
  }
  return NextResponse.json(report);
}
