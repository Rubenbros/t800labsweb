import { NextRequest, NextResponse } from "next/server";
import { trackDemoVisit } from "@/lib/demo/dynamic-businesses";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = body.slug;
  if (typeof slug !== "string" || slug.length === 0) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  await trackDemoVisit(slug);
  return NextResponse.json({ ok: true });
}
