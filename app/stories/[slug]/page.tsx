import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getReport } from "@/lib/data";
import StoryActs from "@/components/StoryActs";

export const dynamic = "force-dynamic";

const SLUG_TO_AOI: Record<string, string> = {
  "the-sinking-capital": "mexico-city",
  "the-breadbasket-that-sank": "central-valley",
  "the-city-moves-to-higher-ground": "jakarta",
};

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const aoiId = SLUG_TO_AOI[params.slug];
  if (!aoiId) notFound();
  const [report, catalog] = await Promise.all([getReport(aoiId), getCatalog()]);
  if (!report) notFound();
  const entry = catalog.find((c) => c.id === aoiId)!;

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <nav className="text-xs text-muted">
        <Link href="/stories" className="hover:text-signal">Stories</Link> / <span className="text-slate-300">{entry.name}</span>
      </nav>

      <header className="panel p-8 text-center">
        <div className="chip mx-auto mb-3">{entry.country}</div>
        <h1 className="text-3xl font-semibold tracking-tight">{entry.story}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Every figure below comes from the live verified report for {entry.name} — receipt {report.receiptId}.
        </p>
      </header>

      <StoryActs
        report={{
          velocity: report.headline.medianVelocityMmYr,
          lo: report.headline.lo95,
          hi: report.headline.hi95,
          stations: report.validation.nStations,
          mae: report.validation.maeMmYr,
          coverage: report.validation.conformalCoverage,
          affected: report.areaStats.affectedFrac,
          lastEpoch: report.staleness.lastEpoch,
          years: report.scenario.years,
          projected: report.scenario.medianMm[report.scenario.medianMm.length - 1],
          receiptId: report.receiptId,
        }}
      />

      <div className="panel flex flex-wrap items-center justify-between gap-3 p-5">
        <span className="text-sm text-muted">Read the full instrument view:</span>
        <Link className="btn btn-primary text-xs" href={`/aoi/${aoiId}`}>
          open motion report →
        </Link>
      </div>
    </article>
  );
}
