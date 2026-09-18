import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraPulse — ground truth for a moving planet",
  description:
    "Station-verified, uncertainty-quantified land-motion intelligence from NASA–ISRO NISAR. Every number ships with its error and its evidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b border-edge bg-ink/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-signal shadow-[0_0_18px_rgba(94,234,212,0.8)]" />
              <span className="font-semibold tracking-tight">TerraPulse</span>
              <span className="chip hidden sm:inline-flex">NISAR · receipts · verified</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link className="rounded-lg px-3 py-1.5 text-muted transition hover:text-signal" href="/">
                Atlas
              </Link>
              <Link className="rounded-lg px-3 py-1.5 text-muted transition hover:text-signal" href="/watchlist">
                Watchlist
              </Link>
              <Link className="rounded-lg px-3 py-1.5 text-muted transition hover:text-signal" href="/stories">
                Stories
              </Link>
              <Link className="rounded-lg px-3 py-1.5 text-muted transition hover:text-signal" href="/method">
                Method
              </Link>
              <Link className="rounded-lg px-3 py-1.5 text-muted transition hover:text-signal" href="/about">
                About
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="border-t border-edge py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-muted">
            <div>
              TerraPulse · NASA Space Apps 2026 · Built on NASA–ISRO NISAR, Sentinel-1 (ASF), Nevada Geodetic Lab GNSS,
              Copernicus DEM, OSM/SEDAC.
            </div>
            <div>
              Demo dataset: synthetic literature-calibrated displacement series (deterministic, receipts disclose
              parameters). See <Link className="text-signal/80 hover:underline" href="/method">Method</Link> and{" "}
              <Link className="text-signal/80 hover:underline" href="/about">AI disclosure</Link>.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
