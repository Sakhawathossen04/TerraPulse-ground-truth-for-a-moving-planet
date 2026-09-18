import { NextResponse } from "next/server";
import { getWatchlist } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getWatchlist();
  return NextResponse.json({ count: rows.length, rows });
}
