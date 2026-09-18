import Link from "next/link";
import { getCatalog } from "@/lib/data";
import AtlasClient from "@/components/AtlasClient";
import { TrendPill, formatVelocity } from "@/components/format";

export const dynamic = "force-dynamic";

export default async function AtlasPage() {
  const catalog = await getCatalog();
  const flagships = catalog.filter((c) => c.flagship);

  return (
    <div className="space-y-6">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              The ground is moving. Now you can see it — with error bars.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              TerraPulse turns NASA–ISRO NISAR radar epochs into station-verified land-motion intelligence. Every
              velocity ships with a 95% confidence interval, GNSS validation, and a provenance receipt. This is the
              decision layer between NASA&apos;s radars and the people responsible for roads, water and safety.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-muted">
            <div className="chip">{catalog.length} AOIs monitored</div>
            <div className="chip">{catalog.reduce((s, c) => s + c.epochs, 0)} epochs processed</div>
            <div className="chip">
              {catalog.filter((c) => c.validation.coverageMet).length}/{catalog.length} coverage targets met
            </div>
          </div>
        </div>
      </section>

      <AtlasClient
        entries={catalog.map((c) => ({
          id: c.id,
          name: c.name,
          country: c.country,
          center: c.center,
          bbox: c.bbox,
          velocity: c.headline.medianVelocityMmYr,
          trendClass: c.headline.trendClass,
        }))}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {flagships.map((c) => (
          <Link
            key={c.id}
            href={`/aoi/${c.id}`}
            className="panel group flex flex-col gap-3 p-5 transition hover:border-signal/50"
          >
            <div className="flex items-center justify-between">
              <span className="chip">flagship</span>
              <TrendPill cls={c.headline.trendClass} />
            </div>
            <div>
              <div className="font-medium group-hover:text-signal">{c.name}</div>
              <div className="text-xs text-muted">{c.country}</div>
            </div>
            <div className="stat-num text-3xl">
              {formatVelocity(c.headline.medianVelocityMmYr)}
              <span className="ml-2 text-xs text-muted">mm/yr</span>
            </div>
            <div className="text-xs text-muted">
              95% CI [{c.headline.lo95}, {c.headline.hi95}] · {c.validation.nStations} GNSS stations · MAE{" "}
              {c.validation.maeMmYr} mm/yr
            </div>
          </Link>
        ))}
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold">Why now</h2>
        <p className="mt-2 text-sm text-slate-300">
          NISAR launched July 30, 2025; provisional L1/L2 products released July 20, 2026. It is the freshest global
          deformation record ever made — and almost nobody outside the SAR community can consume it. TerraPulse is
          built for the first hackathon-grade wave of users: city engineers, hazard agencies, water managers.
        </p>
      </section>
    </div>
  );
}
