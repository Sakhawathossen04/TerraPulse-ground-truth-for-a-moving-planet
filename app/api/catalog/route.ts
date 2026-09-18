import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json({ count: catalog.length, entries: catalog });
}
