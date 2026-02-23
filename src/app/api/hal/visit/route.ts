import { NextResponse } from "next/server";
import { recordVisitor } from "@/lib/hal-stats";

export async function POST() {
  await recordVisitor();
  return NextResponse.json({ ok: true });
}
