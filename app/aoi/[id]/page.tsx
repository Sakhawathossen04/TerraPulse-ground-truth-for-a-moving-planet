import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getReport } from "@/lib/data";
import { DecompositionChart, GnssChart, ScenarioChart, ClassifierBars } from "@/components/charts";
import { TrendPill, formatVelocity } from "@/components/format";
import AgentDemo from "@/components/AgentDemo";

export const dynamic = "force-dynamic";

export default async function AoiPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [report, catalog] = await Promise.all([getReport(id), getCatalog()]);
  if (!report) notFound();
  const entry = catalog.find((c) => c.id === id);
  const aoiName = entry?.name ?? id;

  return (
    <div className="space-y-6">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-signal">Atlas</Link> / <span className="text-slate-300">{aoiName}</span>
      </nav>

      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{aoiName}</h1>
              <TrendPill cls={report.headline.trendClass} />
            </div>
            <p className="mt-1 text-sm text-muted">{entry?.country} · {report.headline.sample}</p>
          </div>
          <div className="text-right">
            <div className="stat-num text-4xl">{formatVelocity(report.headline.medianVelocityMmYr)}</div>
            <div className="text-xs text-muted">mm/yr · 95% CI [{report.headline.lo95}, {report.headline.hi95}]</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Trend class" value={report.headline.trendClass} sub={`confidence ${(report.headline.confidence * 100).toFixed(0)}%`} />
          <StatCard label="GNSS stations" value={`${report.validation.nStations}`} sub={`MAE ${report.validation.maeMmYr} mm/yr`} />
          <StatCard
            label="Conformal coverage"
            value={`${(report.validation.conformalCoverage * 100).toFixed(0)}%`}
            sub={`target ${(report.validation.targetCoverage * 100).toFixed(0)}% · ${report.validation.coverageMet ? "met ✓" : "flagged ⚠"}`}
          />
          <StatCard label="Affected area" value={`${(report.areaStats.affectedFrac * 100).toFixed(0)}%`} sub={`p90 ${report.areaStats.p90} mm/yr`} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-2 font-medium">Displacement decomposition</h2>
          <DecompositionChart report={report} />
          <p className="mt-2 text-xs text-muted">
            Robust Theil–Sen trend separated from annual + semi-annual seasonal cycles.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="mb-2 font-medium">GNSS validation</h2>
          <GnssChart report={report} />
          <p className="mt-2 text-xs text-muted">
            Satellite velocity compared against independent GNSS station velocities. The trust engine of the product.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="mb-2 font-medium">Scenario: if the trend continues</h2>
          <ScenarioChart report={report} />
          <p className="mt-2 text-xs text-muted">
            Projection with widening 95% interval — uncertainty grows honestly with horizon.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="mb-2 font-medium">Deformation signature</h2>
          <ClassifierBars report={report} />
          <p className="mt-2 text-xs text-muted">
            Interpretable feature-rule classifier v1 (CNN upgrade path documented in /method). Eval card in /eval.
          </p>
        </section>
      </div>

      <section className="panel p-5">
        <h2 className="mb-3 font-medium">What this means</h2>
        <ul className="space-y-2">
          {report.narrator.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-signal">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <AgentDemo aoiId={id} aoiName={aoiName} bbox={entry?.bbox ?? [0, 0, 0, 0]} />

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Exports & receipt</h2>
            <p className="text-xs text-muted">
              Every number is one click from its evidence: receipt {report.receiptId} · last epoch{" "}
              {report.staleness.lastEpoch} ({report.staleness.daysSinceLastEpoch}d — {report.staleness.flag}).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="btn text-xs" href={`/api/reports/${id}/export?format=csv`}>CSV</a>
            <a className="btn text-xs" href={`/api/reports/${id}/export?format=json`}>JSON</a>
            <a className="btn btn-primary text-xs" href={`/receipts/${report.receiptId}`}>View receipt</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-edge bg-ink/60 p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="stat-num mt-1 text-2xl">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{sub}</div>
    </div>
  );
}
