/**
 * POST /api/presupuesto/borrador — canal web de la demo «presupuesto por audio».
 *
 * Entrada: el audio en bruto (Content-Type audio/*; el formato real se mira por
 * los primeros bytes) o un texto (text/plain). Cabecera `x-presupuesto-codigo`
 * con el código de acceso de la demo. Salida: JSON con el resumen del borrador,
 * el PDF en base64 y los tiempos medidos.
 */
import { NextResponse, type NextRequest } from "next/server";
import { leerSecreto } from "@/lib/secretos";
import { codigoValido, SECRETO_CODIGO_DEMO } from "@/lib/presupuestos/acceso";
import { almacenPorDefecto, registrarSinFallar } from "@/lib/presupuestos/almacen";
import { AUDIO_MAX_BYTES, TEXTO_MAX, validarAudio, validarTexto } from "@/lib/presupuestos/audio";
import { consumirCupo } from "@/lib/presupuestos/cupos";
import { NoEsUnPresupuesto } from "@/lib/presupuestos/dominio/presupuesto";
import type { EntradaDictado } from "@/lib/presupuestos/ia/dictar";
import { DemasiadoGrande, leerConTope } from "@/lib/presupuestos/leer-con-tope";
import { resumir } from "@/lib/presupuestos/presentacion";
import { generarBorrador } from "@/lib/presupuestos/servicio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function error(estado: number, mensaje: string) {
  return NextResponse.json({ error: mensaje }, { status: estado, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const inicio = performance.now();

  let esperado: string | null;
  try {
    esperado = await leerSecreto(SECRETO_CODIGO_DEMO);
  } catch {
    esperado = null;
  }
  if (!esperado) return error(503, "La demo no está disponible ahora mismo.");
  if (!codigoValido(req.headers.get("x-presupuesto-codigo"), esperado)) {
    return error(401, "El código de acceso no es correcto.");
  }

  const tipo = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const esTexto = tipo === "text/plain";
  const tope = esTexto ? TEXTO_MAX * 4 : AUDIO_MAX_BYTES;
  if (Number(req.headers.get("content-length") ?? 0) > tope) return error(413, "El audio es demasiado largo.");

  let entrada: EntradaDictado;
  try {
    const bytes = await leerConTope(req.body, tope);
    if (esTexto) {
      const v = validarTexto(new TextDecoder().decode(bytes));
      if (!v.ok) return error(400, v.mensaje);
      entrada = { tipo: "texto", texto: v.texto };
    } else {
      const v = validarAudio(bytes);
      if (!v.ok) return error(v.motivo === "demasiado-grande" ? 413 : 400, v.mensaje);
      entrada = { tipo: "audio", bytes, mimeType: v.mimeType };
    }
  } catch (err) {
    if (err instanceof DemasiadoGrande) return error(413, "El audio es demasiado largo.");
    return error(400, "No se pudo leer el audio.");
  }

  const almacen = almacenPorDefecto();
  try {
    const cupo = await consumirCupo(almacen, "web", new Date());
    if (!cupo.ok) return error(429, cupo.mensaje);
  } catch (err) {
    console.error("[presupuestos] cupo:", err instanceof Error ? err.message : err);
    return error(503, "La demo no está disponible ahora mismo.");
  }

  try {
    const borrador = await generarBorrador(entrada);
    const servidorMs = Math.round(performance.now() - inicio);
    const { presupuesto: p, ia, tiempos } = borrador;
    await registrarSinFallar(almacen, {
      canal: "web",
      ok: true,
      msTotal: servidorMs,
      msIa: tiempos.iaMs,
      msPdf: tiempos.pdfMs,
      modelo: ia.modelo,
      tokensEntrada: ia.uso.tokensEntrada,
      tokensSalida: ia.uso.tokensSalida + ia.uso.tokensPensamiento,
      costeUsd: ia.uso.costeUsd,
      lineas: p.lineas.length,
      pendientes: p.lineasPendientes,
    });
    return NextResponse.json(
      {
        resumen: resumir(p),
        pdf: Buffer.from(borrador.pdf).toString("base64"),
        nombreArchivo: borrador.nombreArchivo,
        tiempos: { servidorMs, iaMs: tiempos.iaMs, pdfMs: tiempos.pdfMs },
        ia: { modelo: ia.modelo, costeUsd: Number(ia.uso.costeUsd.toFixed(5)), intentos: ia.intentos },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const noEs = err instanceof NoEsUnPresupuesto;
    if (!noEs) console.error("[presupuestos] web:", err instanceof Error ? err.message : err);
    await registrarSinFallar(almacen, {
      canal: "web",
      ok: false,
      error: noEs ? "no-es-presupuesto" : err instanceof Error ? err.message : String(err),
      msTotal: performance.now() - inicio,
    });
    if (noEs) {
      return error(422, "No he entendido trabajos que presupuestar. Cuéntame qué hay que hacer, con medidas si las tienes.");
    }
    return error(502, "No he podido preparar el borrador ahora mismo. Prueba otra vez en un momento.");
  }
}
