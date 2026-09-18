import type { TrendClass } from "@/lib/types";

export function formatVelocity(v: number): string {
  const s = v.toFixed(1);
  return v > 0 ? `+${s}` : s;
}

const CLASS_META: Record<TrendClass, { label: string; cls: string }> = {
  stable: { label: "stable", cls: "border-calm/40 text-calm bg-calm/10" },
  subsiding: { label: "subsiding", cls: "border-motion/50 text-motion bg-motion/10" },
  uplifting: { label: "uplifting", cls: "border-warn/50 text-warn bg-warn/10" },
  creep: { label: "creep", cls: "border-warn/40 text-warn/90 bg-warn/5" },
};

export function TrendPill({ cls }: { cls: TrendClass }) {
  const meta = CLASS_META[cls];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
}
