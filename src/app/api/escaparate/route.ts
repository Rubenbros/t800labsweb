// Los vídeos publicados, para que las páginas se pongan al día en el navegador sin
// esperar a un despliegue. Solo reenvía lo que el panel ya da en abierto.
import { NextResponse } from "next/server";
import { loadShowcase } from "@/lib/escaparate/source";

export const dynamic = "force-dynamic";

export async function GET() {
  const videos = await loadShowcase({ waitMs: 8_000 });
  return NextResponse.json({ videos }, { headers: { "Cache-Control": "public, max-age=60" } });
}
