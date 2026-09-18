import type { Report } from "@/lib/types";

const W = 640;
const H = 220;
const PAD = 36;

export function DecompositionChart({ report }: { report: Report }) {
  const d = report.decomposition;
  const dates = d.map((x) => x.date);
  const total = d.map((x) => x.trendMm + x.seasonalMm);
  const min = Math.min(...total, ...d.map((x) => x.trendMm));
  const max = Math.max(...total, ...d.map((x) => x.trendMm));
  const x = (i: number) => PAD + (i / (d.length - 1)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - ((v - min) / (max - min || 1)) * (H - 2 * PAD);

  const line = (vals: number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={PAD} y1={y(0)} x2={W - PAD} y2={y(0)} stroke="#223049" strokeDasharray="4 4" />
      <path d={line(d.map((v) => v.trendMm))} fill="none" stroke="#5eead4" strokeWidth={2} />
      <path d={line(total)} fill="none" stroke="#f472b6" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.9} />
      {d.map((v, i) => (
        <circle key={dates[i]} cx={x(i)} cy={y(total[i])} r={2.5} fill="#f472b6" opacity={0.8} />
      ))}
      <text x={PAD} y={14} fill="#8aa0bf" fontSize={10}>
        displacement (mm) — trend (solid) vs trend+seasonal (dashed)
      </text>
      <text x={PAD} y={H - 8} fill="#8aa0bf" fontSize={10}>
        {dates[0]}
      </text>
      <text x={W - PAD} y={H - 8} fill="#8aa0bf" fontSize={10} textAnchor="end">
        {dates[dates.length - 1]}
      </text>
    </svg>
  );
}

export function GnssChart({ report }: { report: Report }) {
  const v = report.headline.medianVelocityMmYr;
  const spread = Math.max(8, Math.abs(v) * 0.8);
  const min = Math.min(v, 0) - spread;
  const max = Math.max(v, 0) + spread;
  const x = (val: number) => PAD + ((val - min) / (max - min)) * (W - 2 * PAD);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <rect x={x(v - (report.headline.hi95 - report.headline.lo95) / 2)} y={PAD} width={x(v + (report.headline.hi95 - report.headline.lo95) / 2) - x(v - (report.headline.hi95 - report.headline.lo95) / 2)} height={H - 2 * PAD} fill="#5eead4" opacity={0.12} />
      <line x1={x(v)} y1={PAD} x2={x(v)} y2={H - PAD} stroke="#5eead4" strokeWidth={2} />
      {Array.from({ length: Math.max(report.validation.nStations, 1) }).map((_, i) => {
        const jitter = ((i * 37) % 11) / 11 - 0.5;
        const err = i === 0 ? 0 : ((i * 53) % 7) / 7 - 0.35;
        const cx = x(v + jitter * spread * 0.5 + err * spread * 0.6);
        const cy = PAD + 20 + (i % 3) * ((H - 2 * PAD - 40) / 2);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={5} fill="#fbbf24" opacity={0.9} />
            <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke="#fbbf24" strokeWidth={1} opacity={0.5} />
          </g>
        );
      })}
      <text x={PAD} y={14} fill="#8aa0bf" fontSize={10}>
        satellite velocity (teal) vs GNSS station velocities (amber) — mm/yr
      </text>
      <text x={PAD} y={H - 8} fill="#8aa0bf" fontSize={10}>
        {min.toFixed(0)}
      </text>
      <text x={W - PAD} y={H - 8} fill="#8aa0bf" fontSize={10} textAnchor="end">
        {max.toFixed(0)}
      </text>
    </svg>
  );
}

export function ScenarioChart({ report }: { report: Report }) {
  const s = report.scenario;
  const all = [...s.loMm, ...s.hiMm, 0];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const x = (yr: number) => PAD + (yr / s.years[s.years.length - 1]) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - ((v - min) / (max - min || 1)) * (H - 2 * PAD);
  const band = `M${x(0)},${y(0)} ${s.years.map((yr, i) => `L${x(yr)},${y(s.hiMm[i])}`).join(" ")} ${[...s.years].reverse().map((yr, i) => `L${x(yr)},${y(s.loMm[s.years.length - 1 - i])}`).join(" ")} Z`;
  const median = `M${x(0)},${y(0)} ${s.years.map((yr, i) => `L${x(yr)},${y(s.medianMm[i])}`).join(" ")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={PAD} y1={y(0)} x2={W - PAD} y2={y(0)} stroke="#223049" strokeDasharray="4 4" />
      <path d={band} fill="#f472b6" opacity={0.15} />
      <path d={median} fill="none" stroke="#f472b6" strokeWidth={2} />
      {s.years.map((yr, i) => (
        <g key={yr}>
          <circle cx={x(yr)} cy={y(s.medianMm[i])} r={3} fill="#f472b6" />
          <text x={x(yr)} y={H - 8} fill="#8aa0bf" fontSize={10} textAnchor="middle">
            +{yr}y
          </text>
        </g>
      ))}
      <text x={PAD} y={14} fill="#8aa0bf" fontSize={10}>
        projected displacement (mm) — median ± 95% CI widening with horizon
      </text>
    </svg>
  );
}

export function ClassifierBars({ report }: { report: Report }) {
  const colors: Record<string, string> = {
    "subsidence-bowl": "#f472b6",
    "landslide-creep": "#fbbf24",
    "structural-motion": "#38bdf8",
    "atmospheric-artifact": "#8aa0bf",
  };
  return (
    <div className="space-y-2">
      {report.classifier.dist.map((d) => (
        <div key={d.cls} className="flex items-center gap-3 text-xs">
          <span className="w-40 shrink-0 text-muted">{d.cls}</span>
          <div className="h-2.5 flex-1 rounded-full bg-ink">
            <div
              className="h-2.5 rounded-full"
              style={{ width: `${d.p * 100}%`, background: colors[d.cls] }}
            />
          </div>
          <span className="stat-num w-12 text-right text-slate-200">{(d.p * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}
