import { NextRequest, NextResponse } from "next/server";
import { recordShutdown } from "@/lib/hal-stats";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const userTime =
    typeof (body as Record<string, unknown>).userTime === "number" &&
    ((body as Record<string, unknown>).userTime as number) > 0
      ? ((body as Record<string, unknown>).userTime as number)
      : 0;

  try {
    const stats = await recordShutdown(userTime);
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json(
      { error: "recordShutdown failed", detail: String(err) },
      { status: 500 }
    );
  }
}
