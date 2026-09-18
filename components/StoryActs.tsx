"use client";

import { useEffect, useRef, useState } from "react";

interface ReportLite {
  velocity: number;
  lo: number;
  hi: number;
  stations: number;
  mae: number;
  coverage: number;
  affected: number;
  lastEpoch: string;
  years: number[];
  projected: number;
  receiptId: string;
}

function Act({ children, kicker }: { children: React.ReactNode; kicker: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`panel p-8 transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
    >
      <div className="mb-3 font-mono text-xs uppercase tracking-widest text-signal">{kicker}</div>
      {children}
    </div>
  );
}

export default function StoryActs({ report }: { report: ReportLite }) {
  const v = Math.abs(report.velocity).toFixed(1);
  return (
    <div className="space-y-6">
      <Act kicker="Act I — the signal">
        <p className="text-lg leading-relaxed">
          The ground beneath the city is moving. Satellite radar measures it every 12 days:{" "}
          <span className="stat-num text-3xl text-motion">{v} mm/yr</span> (95% CI {report.lo} to {report.hi}).
          Invisible to the eye. Unmissable to NISAR.
        </p>
      </Act>
      <Act kicker="Act II — the verification">
        <p className="text-lg leading-relaxed">
          We don&apos;t ask you to trust the radar. {report.stations} GNSS stations on the ground check it — mean
          absolute error <span className="stat-num text-signal">{report.mae} mm/yr</span>, and{" "}
          <span className="stat-num text-signal">{(report.coverage * 100).toFixed(0)}%</span> of calibrated intervals
          covered their targets.
        </p>
      </Act>
      <Act kicker="Act III — the stakes">
        <p className="text-lg leading-relaxed">
          {(report.affected * 100).toFixed(0)}% of the area moves beyond the noise floor. If the trend holds{" "}
          {report.years[report.years.length - 1]} years, projected displacement reaches{" "}
          <span className="stat-num text-3xl text-warn">{report.projected} mm</span>. Foundations don&apos;t lie;
          they just weren&apos;t being asked.
        </p>
      </Act>
      <Act kicker="Act IV — the evidence">
        <p className="text-lg leading-relaxed">
          Last epoch {report.lastEpoch}. Every number on this page is reproducible from receipt{" "}
          <span className="font-mono text-signal">{report.receiptId}</span> — datasets, parameters, software, hashes.
        </p>
      </Act>
    </div>
  );
}
