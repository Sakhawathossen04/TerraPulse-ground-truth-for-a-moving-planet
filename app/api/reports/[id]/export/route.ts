import { NextResponse } from "next/server";
import { getReport } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  if (!report) {
    return NextResponse.json({ error: "report not found", aoiId: params.id }, { status: 404 });
  }
  const format = new URL(req.url).searchParams.get("format") ?? "json";

  if (format === "csv") {
    const lines: string[] = [];
    lines.push(`# TerraPulse motion report — ${report.aoiId}`);
    lines.push(`# generated,median_velocity_mm_yr,lo95,hi95,trend_class,gnss_stations,mae_mm_yr,conformal_coverage,receipt`);
    lines.push(
      `${report.generatedAtUtc},${report.headline.medianVelocityMmYr},${report.headline.lo95},${report.headline.hi95},${report.headline.trendClass},${report.validation.nStations},${report.validation.maeMmYr},${report.validation.conformalCoverage},${report.receiptId}`
    );
    lines.push("");
    lines.push("date,trend_mm,seasonal_mm");
    for (const d of report.decomposition) {
      lines.push(`${d.date},${d.trendMm},${d.seasonalMm}`);
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="terrapulse-${params.id}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="terrapulse-${params.id}.json"`,
    },
  });
}
