import Link from "next/link";
import { getWatchlist } from "@/lib/data";
import { TrendPill, formatVelocity } from "@/components/format";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const rows = await getWatchlist();

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-xl font-semibold">Watchlist — ranked by motion × exposure</h1>
        <p className="mt-2 text-sm text-slate-300">
          Every monitored AOI scored by median velocity, confidence and infrastructure/population exposure. Built for
          hazard agencies: the top of this list is where attention (and budget) goes first.
        </p>
      </section>

      <section className="panel overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">AOI</th>
              <th className="px-4 py-3 text-right">velocity (mm/yr)</th>
              <th className="px-4 py-3">trend</th>
              <th className="px-4 py-3 text-right">affected</th>
              <th className="px-4 py-3 text-right">exposure</th>
              <th className="px-4 py-3 text-right">watch score</th>
              <th className="px-4 py-3 text-right">receipt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.aoiId} className="border-b border-edge/50 transition hover:bg-panel/60">
                <td className="px-4 py-3 text-muted">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/aoi/${r.aoiId}`} className="font-medium hover:text-signal">
                    {r.name}
                  </Link>
                  <div className="text-xs text-muted">{r.country}</div>
                </td>
                <td className="stat-num px-4 py-3 text-right">{formatVelocity(r.velocityMmYr)}</td>
                <td className="px-4 py-3">
                  <TrendPill cls={r.trendClass} />
                </td>
                <td className="stat-num px-4 py-3 text-right">{(r.affectedFrac * 100).toFixed(0)}%</td>
                <td className="stat-num px-4 py-3 text-right">{r.exposureScore}</td>
                <td className="stat-num px-4 py-3 text-right text-signal">{r.watchScore}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/receipts/${r.receiptId}`} className="font-mono text-xs text-muted hover:text-signal">
                    {r.receiptId}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel p-5 text-xs text-muted">
        Scoring: watchScore = |median velocity| × log₁₀(exposure+10). Exposure score combines population (log scale)
        with an infrastructure density index from OSM/SEDAC-derived layers. Subscribable alert digests ship post-MVP
        (blueprint §6).
      </section>
    </div>
  );
}
