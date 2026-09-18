import { NextResponse } from "next/server";
import { getReceipt } from "@/lib/data";
import { assertReceipt } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const receipt = await getReceipt(params.id);
  if (!receipt) {
    return NextResponse.json({ error: "receipt not found", id: params.id }, { status: 404 });
  }
  let verified = true;
  try {
    assertReceipt(receipt);
  } catch {
    verified = false;
  }
  return NextResponse.json({ verified, receipt });
}
