import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const zBody = z.object({
  email: z.string().email(),
  aoiIds: z.array(z.string()).min(1).max(20),
  cadence: z.enum(["weekly", "monthly"]).default("weekly"),
});

// In-memory registry (demo stub). Production: Postgres + Celery digest cron.
const subs = new Map<string, { email: string; aoiIds: string[]; cadence: string }>();

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const parsed = zBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed", issues: parsed.error.issues }, { status: 422 });
  }
  const id = `sub-${Buffer.from(parsed.data.email).toString("base64url").slice(0, 10)}`;
  subs.set(id, parsed.data);
  return NextResponse.json({
    id,
    status: "subscribed (demo stub — no email is sent)",
    cadence: parsed.data.cadence,
    aois: parsed.data.aoiIds.length,
  });
}

export async function GET() {
  return NextResponse.json({ subscriptions: subs.size, note: "demo registry; resets on redeploy" });
}
