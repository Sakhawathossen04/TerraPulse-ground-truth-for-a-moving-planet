import { NextResponse } from "next/server";
import { z } from "zod";
import { planAnalysis, refineWithLlm } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const zBody = z.object({
  aoiId: z.string().optional(),
  aoiName: z.string().min(1).max(120),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  deadlineMinutes: z.number().min(1).max(60).optional(),
});

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
  const { aoiName, bbox, deadlineMinutes } = parsed.data;
  const plan = planAnalysis({
    aoiName,
    bbox: bbox ?? [-99.35, 19.25, -98.9, 19.6],
    deadlineMinutes,
  });
  const refined = await refineWithLlm(plan);
  return NextResponse.json(refined);
}
