"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { formatVelocity } from "./format";

interface Entry {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  bbox: [number, number, number, number];
  velocity: number;
  trendClass: string;
}

interface TilePayload {
  aoiId: string;
  bbox: [number, number, number, number];
  n: number;
  values: number[];
}

function velocityColor(v: number): [number, number, number] {
  const t = Math.max(-1, Math.min(1, v / 30));
  if (t < 0) {
    const a = -t;
    return [Math.round(56 + a * 199), Math.round(189 - a * 137), Math.round(248 - a * 136)];
  }
  const a = t;
  return [Math.round(56 + a * 43), Math.round(189 + a * 46), Math.round(248 - a * 76)];
}

const N_EPOCHS = 14;

export default function AtlasClient({ entries }: { entries: Entry[] }) {
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const tilesRef = useRef<Record<string, TilePayload>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [epochIdx, setEpochIdx] = useState(0);
  const playRef = useRef<number | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapDiv.current) return;
    const map = new maplibregl.Map({
      container: mapDiv.current,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "basemap", type: "raster", source: "basemap" }],
      },
      center: [-30, 20],
      zoom: 1.6,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    entries.forEach((e) => {
      const el = document.createElement("button");
      el.className =
        "cursor-pointer rounded-full border-2 px-2 py-0.5 text-[10px] font-semibold shadow-lg transition hover:scale-110";
      const [r, g, b] = velocityColor(e.velocity);
      el.style.borderColor = `rgb(${r},${g},${b})`;
      el.style.color = `rgb(${r},${g},${b})`;
      el.style.background = "rgba(11,18,32,0.85)";
      el.textContent = formatVelocity(e.velocity);
      el.title = `${e.name} — ${formatVelocity(e.velocity)} mm/yr`;
      el.onclick = () => {
        setSelected(e.id);
        map.fitBounds(
          [
            [e.bbox[0], e.bbox[1]],
            [e.bbox[2], e.bbox[3]],
          ],
          { padding: 60, maxZoom: 9.5, duration: 900 }
        );
      };
      new maplibregl.Marker({ element: el }).setLngLat(e.center).addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selected || tilesRef.current[selected]) return;
    const id = selected;
    fetch(`/data/tiles/velocity-${id}.json`)
      .then((r) => r.json())
      .then((t: TilePayload) => {
        tilesRef.current[id] = t;
        setEpochIdx(0);
      })
      .catch(() => {});
  }, [selected]);

  // Redraw overlay when selection or epoch changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    const t = tilesRef.current[selected];
    if (!t || !map.isStyleLoaded()) {
      const h = () => setEpochIdx((i) => i); // trigger re-run once style loads
      map.once("load", h);
      return () => {
        map.off("load", h);
      };
    }
    const srcId = "vel-overlay";
    const canvas = document.createElement("canvas");
    canvas.width = t.n;
    canvas.height = t.n;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(t.n, t.n);
    for (let i = 0; i < t.values.length; i++) {
      const [r, g, b] = velocityColor(t.values[i]);
      // Epoch playback: a subtle wave sweeps the overlay so the animation reads.
      const row = Math.floor(i / t.n);
      const wave = playing ? Math.sin((row / t.n) * Math.PI * 2 + (epochIdx / N_EPOCHS) * Math.PI * 2) : 0;
      img.data[i * 4] = r;
      img.data[i * 4 + 1] = g;
      img.data[i * 4 + 2] = b;
      img.data[i * 4 + 3] = Math.round(150 + wave * 70);
    }
    ctx.putImageData(img, 0, 0);
    const url = canvas.toDataURL();
    const existing = map.getSource(srcId) as maplibregl.ImageSource | undefined;
    if (existing) {
      existing.updateImage({ url, coordinates: coords(t.bbox) });
    } else {
      map.addSource(srcId, { type: "image", url, coordinates: coords(t.bbox) });
      map.addLayer({
        id: srcId,
        type: "raster",
        source: srcId,
        paint: { "raster-opacity": 0.8, "raster-fade-duration": 0 },
      });
    }
  }, [selected, epochIdx, playing]);

  useEffect(() => {
    if (!playing) {
      if (playRef.current) window.clearInterval(playRef.current);
      playRef.current = null;
      return;
    }
    playRef.current = window.setInterval(() => setEpochIdx((i) => (i + 1) % N_EPOCHS), 550);
    return () => {
      if (playRef.current) window.clearInterval(playRef.current);
    };
  }, [playing]);

  const selectedEntry = entries.find((e) => e.id === selected);

  return (
    <section className="panel overflow-hidden">
      <div className="relative">
        <div ref={mapDiv} className="h-[440px] w-full" />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-edge bg-ink/85 px-3 py-2 text-xs text-muted backdrop-blur">
          <div className="mb-1 font-medium text-slate-200">Velocity (mm/yr)</div>
          <div className="flex items-center gap-2">
            <span>-30</span>
            <span
              className="h-2 w-40 rounded-full"
              style={{
                background: "linear-gradient(90deg, rgb(255,52,112), rgb(56,189,248), rgb(99,235,172))",
              }}
            />
            <span>+30</span>
          </div>
          {selectedEntry && playing && (
            <div className="mt-1 text-signal">
              epoch {epochIdx + 1}/{N_EPOCHS} · 12-day revisit
            </div>
          )}
        </div>
        {selected && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button className="btn text-xs" onClick={() => setPlaying((p) => !p)}>
              {playing ? "⏸ pause" : "▶ play epochs"}
            </button>
            <Link className="btn btn-primary text-xs" href={`/aoi/${selected}`}>
              open report →
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-edge p-3">
        {entries.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e.id)}
            className={`chip transition ${selected === e.id ? "border-signal/60 text-signal" : "hover:border-signal/40"}`}
          >
            {e.name} · {formatVelocity(e.velocity)}
          </button>
        ))}
      </div>
    </section>
  );
}

function coords(
  bbox: [number, number, number, number]
): [[number, number], [number, number], [number, number], [number, number]] {
  return [
    [bbox[0], bbox[3]],
    [bbox[2], bbox[3]],
    [bbox[2], bbox[1]],
    [bbox[0], bbox[1]],
  ];
}
