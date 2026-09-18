import Link from "next/link";

export const metadata = { title: "About — TerraPulse" };

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-xl font-semibold">About TerraPulse</h1>
        <p className="mt-2 text-sm text-slate-300">
          TerraPulse turns NASA–ISRO NISAR radar data into station-verified, uncertainty-quantified land-motion
          intelligence — so cities, hazard agencies and water managers can see ground deformation years before it
          becomes disaster. Built for the NASA International Space Apps Challenge, November 14–15, 2026.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="font-medium">Who it&apos;s for</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            <li><b>Infrastructure Iris</b> — city/public-works engineer: per-asset motion status, plain-language flags, exportable evidence.</li>
            <li><b>Hazard Hank</b> — geological survey analyst: ranked watchlist, change alerts, GNSS-comparison truth.</li>
            <li><b>Water Wanda</b> — basin manager: subsidence vs recharge context, defensible numbers for policy.</li>
            <li><b>Curious Camila</b> — student/journalist: the story layer, sharable verified visuals.</li>
          </ul>
        </section>

        <section className="panel p-6">
          <h2 className="font-medium">NASA data usage</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>NISAR L2 GCOV (provisional, 2026-07-20 release) — primary epochs</li>
            <li>Sentinel-1 via NASA ASF — historical baseline</li>
            <li>Nevada Geodetic Lab GNSS mirror — validation truth</li>
            <li>Copernicus DEM GLO-30 — coregistration</li>
            <li>OSM/SEDAC/WorldPop — exposure layers</li>
            <li>Earthdata CMR + earthaccess — discovery/auth (agent tool layer)</li>
          </ul>
        </section>
      </div>

      <section className="panel p-6">
        <h2 className="font-medium">AI disclosure</h2>
        <p className="mt-2 text-sm text-slate-300">
          In the spirit of honest AI disclosure: this project&apos;s code was written with AI pair-programming
          assistance (Codebuff agent + human review). All core statistical methods (Theil–Sen, conformal calibration,
          GP regression) are standard published algorithms implemented transparently in <span className="font-mono text-xs">lib/stats.ts</span>.
          The demo agent is a deterministic rule-based planner; the optional LLM path only annotates plans and can be
          disabled with zero loss of function. The narrator is schema-constrained: it can only rephrase numbers that
          already exist in report JSON (tested). No AI-generated science claims anywhere — every figure is computed by
          the pipeline and receipted.
        </p>
      </section>

      <section className="panel p-6">
        <h2 className="font-medium">Challenge fit</h2>
        <p className="mt-2 text-sm text-slate-300">
          TerraPulse maps to Earth-observation actionability themes: it converts NASA mission data into an actionable
          decision product for named users, with verification (GNSS), uncertainty (conformal), and reproducibility
          (receipts + deterministic pipeline) as first-class features. Final challenge statement mapping happens when
          2026 statements publish (~4 weeks pre-event).
        </p>
      </section>

      <section className="panel p-6">
        <h2 className="font-medium">Reproducibility</h2>
        <div className="mt-2 space-y-1 font-mono text-xs text-muted">
          <div>npm install</div>
          <div>npm run pipeline   # regenerate all artifacts deterministically</div>
          <div>npm test           # stats, calibration, narrator, receipts suites</div>
          <div>npm run build      # production build</div>
        </div>
      </section>

      <section className="panel p-6 text-sm text-slate-300">
        Questions? Start at <Link className="text-signal hover:underline" href="/method">Method</Link> or inspect any
        report&apos;s <Link className="text-signal hover:underline" href="/watchlist">receipt</Link>.
      </section>
    </div>
  );
}
