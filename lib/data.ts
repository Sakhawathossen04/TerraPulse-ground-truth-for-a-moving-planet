/**
 * Data layer — server-only access to pipeline artifacts under /data.
 * Artifacts are regenerated deterministically by `npm run pipeline`.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  zCatalogEntry,
  zReport,
  zReceipt,
  zWatchlistRow,
  type Aoi,
  type CatalogEntry,
  type Report,
  type Receipt,
  type WatchlistRow,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "artifacts");

async function readJson<T>(rel: string): Promise<T> {
  const buf = await fs.readFile(path.join(DATA_DIR, rel), "utf8");
  return JSON.parse(buf) as T;
}

let catalogCache: CatalogEntry[] | null = null;

export async function getCatalog(): Promise<CatalogEntry[]> {
  if (catalogCache) return catalogCache;
  const raw = await readJson<unknown>("catalog.json");
  catalogCache = z.array(zCatalogEntry).parse(raw);
  return catalogCache!;
}

export async function getReport(aoiId: string): Promise<Report | null> {
  try {
    const raw = await readJson<unknown>(`reports/${aoiId}.json`);
    return zReport.parse(raw);
  } catch {
    return null;
  }
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  try {
    const raw = await readJson<unknown>(`receipts/${id}.json`);
    return zReceipt.parse(raw);
  } catch {
    return null;
  }
}

export async function getReceiptForAoi(aoiId: string): Promise<Receipt | null> {
  const cat = await getCatalog();
  const entry = cat.find((c) => c.id === aoiId);
  if (!entry) return null;
  return getReceipt(entry.receiptId);
}

export async function getWatchlist(): Promise<WatchlistRow[]> {
  const raw = await readJson<unknown>("watchlist.json");
  return z.array(zWatchlistRow).parse(raw);
}

export async function getRawAoi(aoiId: string): Promise<Aoi | null> {
  try {
    const raw = await readJson<unknown>(`aois/${aoiId}.json`);
    return raw as Aoi;
  } catch {
    return null;
  }
}
