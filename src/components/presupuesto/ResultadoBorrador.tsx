"use client";

import type { ResumenBorrador } from "@/lib/presupuestos/presentacion";

interface Props {
  resumen: ResumenBorrador;
  pdfUrl: string;
  nombreArchivo: string;
  segundos: number;
  onOtro: () => void;
}

export function formatearSegundos(s: number): string {
  return s.toFixed(1).replace(".", ",");
}

export function ResultadoBorrador({ resumen, pdfUrl, nombreArchivo, segundos, onOtro }: Props) {
  return (
    <section aria-live="polite" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a9a9a]">Borrador listo en</p>
        <p className="font-mono text-4xl font-semibold tabular-nums text-white">
          {formatearSegundos(segundos)}
          <span className="ml-1 text-xl text-[#e50914]">s</span>
        </p>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a9a9a]">{resumen.numero}</p>
        <h2 className="mt-1 text-xl font-semibold leading-tight text-white">{resumen.titulo}</h2>
      </div>

      <ol className="flex flex-col divide-y divide-white/10 border-y border-white/10">
        {resumen.lineas.map((l) => (
          <li key={l.numero} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-[15px] leading-snug text-[#ededed]">{l.descripcion}</p>
              <p className="mt-1 font-mono text-xs text-[#9a9a9a]">
                {l.cantidad ?? "—"} {l.unidad}
                {l.estimada ? " · medición estimada" : ""}
              </p>
            </div>
            {l.importe ? (
              <p className="shrink-0 font-mono text-[15px] tabular-nums text-white">{l.importe}</p>
            ) : (
              <p className="shrink-0 rounded-sm border border-[#f59e0b]/60 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#f59e0b]">
                precio pendiente
              </p>
            )}
          </li>
        ))}
      </ol>

      <dl className="ml-auto grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1 font-mono text-sm tabular-nums">
        <dt className="text-[#9a9a9a]">Base imponible</dt>
        <dd className="text-right text-[#ededed]">{resumen.base}</dd>
        <dt className="text-[#9a9a9a]">IVA {resumen.ivaPorcentaje} %</dt>
        <dd className="text-right text-[#ededed]">{resumen.iva}</dd>
        <dt className="mt-2 font-semibold text-white">Total</dt>
        <dd className="mt-2 text-right text-lg font-semibold text-white">{resumen.total}</dd>
      </dl>
      {resumen.pendientes > 0 && (
        <p className="text-right font-mono text-xs text-[#f59e0b]">
          {resumen.pendientes === 1
            ? "1 partida con precio pendiente, sin sumar."
            : `${resumen.pendientes} partidas con precio pendiente, sin sumar.`}
        </p>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener"
          className="flex h-14 items-center justify-center rounded-md bg-[#e50914] text-base font-semibold text-white active:bg-[#b80710]"
        >
          Abrir el PDF
        </a>
        <div className="flex items-center justify-between">
          <a href={pdfUrl} download={nombreArchivo} className="font-mono text-xs text-[#9a9a9a] underline underline-offset-4">
            Descargar
          </a>
          <button type="button" onClick={onOtro} className="font-mono text-xs text-[#ededed] underline underline-offset-4">
            Grabar otro
          </button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-[#7a7a7a]">
        Es un borrador: lo revisas, lo tocas si quieres y lo mandas tú. No se envía solo al cliente.
      </p>
    </section>
  );
}
