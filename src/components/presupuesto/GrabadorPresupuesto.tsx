"use client";

/**
 * Demo «presupuesto por audio» (canal web). Dirección visual: el cronómetro es
 * el protagonista —la promesa es «en segundos» y se enseña medida—, sobre el
 * negro de T800 Labs con el rojo #e50914 como única señal y etiquetas en mono,
 * como un instrumento de taller. Anti-patrones: nada de degradados, tarjetas de
 * cristal, iconos de «chispa IA» ni emojis; un solo botón grande por pantalla.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumenBorrador } from "@/lib/presupuestos/presentacion";
import { ResultadoBorrador, formatearSegundos } from "./ResultadoBorrador";
import { MAX_SEGUNDOS_GRABACION, useGrabadora } from "./useGrabadora";

const CLAVE_CODIGO = "t800.presupuesto.codigo";

type Fase =
  | { tipo: "acceso"; error?: string }
  | { tipo: "listo"; error?: string }
  | { tipo: "enviando"; inicio: number }
  | { tipo: "hecho"; resumen: ResumenBorrador; pdfUrl: string; nombreArchivo: string; segundos: number };

interface RespuestaApi {
  resumen?: ResumenBorrador;
  pdf?: string;
  nombreArchivo?: string;
  error?: string;
}

function leerCodigo(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_CODIGO);
  } catch {
    return null;
  }
}

function guardarCodigo(codigo: string | null) {
  try {
    if (codigo) window.localStorage.setItem(CLAVE_CODIGO, codigo);
    else window.localStorage.removeItem(CLAVE_CODIGO);
  } catch {
    /* sin almacenamiento: se pedirá el código otra vez */
  }
}

/** El código llega una vez por enlace (#c=...), se recuerda en este móvil y se quita de la barra. */
function codigoInicial(): string | null {
  const delEnlace = new URLSearchParams(window.location.hash.slice(1)).get("c");
  if (delEnlace) {
    guardarCodigo(delEnlace);
    window.history.replaceState(null, "", window.location.pathname);
  }
  return delEnlace ?? leerCodigo();
}

function base64ABlob(base64: string): Blob {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
}

function Cronometro({ inicio }: { inicio: number }) {
  const [ahora, setAhora] = useState(inicio);
  useEffect(() => {
    const id = window.setInterval(() => setAhora(performance.now()), 100);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="font-mono text-6xl font-semibold tabular-nums text-white" aria-live="off">
      {formatearSegundos(Math.max(0, (ahora - inicio) / 1000))}
      <span className="ml-1 text-2xl text-[#e50914]">s</span>
    </p>
  );
}

/** Solo en el navegador (se carga sin SSR desde `GrabadorPresupuestoCliente`). */
export function GrabadorPresupuesto() {
  const [codigo, setCodigo] = useState<string | null>(codigoInicial);
  const [fase, setFase] = useState<Fase>(() => (codigo ? { tipo: "listo" } : { tipo: "acceso" }));
  const [texto, setTexto] = useState("");
  const pdfUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    },
    [],
  );

  // Si el enlace con #c=... se abre con la página ya cargada, solo cambia el hash.
  useEffect(() => {
    const alCambiar = () => {
      const c = codigoInicial();
      if (c) {
        setCodigo(c);
        setFase((f) => (f.tipo === "acceso" ? { tipo: "listo" } : f));
      }
    };
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);

  const enviar = useCallback(
    async (cuerpo: Blob | string) => {
      if (!codigo) return;
      const inicio = performance.now();
      setFase({ tipo: "enviando", inicio });
      try {
        const res = await fetch("/api/presupuesto/borrador", {
          method: "POST",
          headers: {
            "Content-Type": typeof cuerpo === "string" ? "text/plain;charset=utf-8" : cuerpo.type || "application/octet-stream",
            "x-presupuesto-codigo": codigo,
          },
          body: cuerpo,
        });
        const json = (await res.json().catch(() => ({}))) as RespuestaApi;
        if (res.status === 401) {
          guardarCodigo(null);
          setCodigo(null);
          setFase({ tipo: "acceso", error: json.error ?? "El código no es correcto." });
          return;
        }
        if (!res.ok || !json.resumen || !json.pdf) {
          setFase({ tipo: "listo", error: json.error ?? "No he podido preparar el borrador. Prueba otra vez." });
          return;
        }
        const segundos = (performance.now() - inicio) / 1000;
        if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
        const pdfUrl = URL.createObjectURL(base64ABlob(json.pdf));
        pdfUrlRef.current = pdfUrl;
        setFase({ tipo: "hecho", resumen: json.resumen, pdfUrl, nombreArchivo: json.nombreArchivo ?? "presupuesto.pdf", segundos });
      } catch {
        setFase({ tipo: "listo", error: "Sin conexión. Prueba otra vez." });
      }
    },
    [codigo],
  );

  const grabadora = useGrabadora((audio) => void enviar(audio));

  const entrarConCodigo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valor = String(new FormData(e.currentTarget).get("codigo") ?? "").trim();
    if (!valor) return;
    guardarCodigo(valor);
    setCodigo(valor);
    setFase({ tipo: "listo" });
  };

  const grabando = grabadora.estado === "grabando";
  const restante = MAX_SEGUNDOS_GRABACION - grabadora.segundos;

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-4 pb-10 pt-6 text-[#ededed]">
      <header className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#9a9a9a]">
          T800 Labs <span className="text-[#e50914]">·</span> demo
        </p>
        <p className="rounded-sm border border-[#e50914] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e50914]">
          Datos de ejemplo
        </p>
      </header>

      {fase.tipo === "hecho" ? (
        <div className="mt-8">
          <ResultadoBorrador
            resumen={fase.resumen}
            pdfUrl={fase.pdfUrl}
            nombreArchivo={fase.nombreArchivo}
            segundos={fase.segundos}
            onOtro={() => setFase({ tipo: "listo" })}
          />
        </div>
      ) : (
        <>
          <section className="mt-10">
            <h1 className="text-[28px] font-semibold leading-[1.1] text-white">Presupuesto por audio</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#b5b5b5]">
              Cuenta el trabajo como si salieras de la visita. Te devuelvo el borrador en PDF con los precios de la
              tarifa; lo que no esté en ella sale como «precio pendiente».
            </p>
          </section>

          {fase.tipo === "acceso" && (
            <form onSubmit={entrarConCodigo} className="mt-10 flex flex-col gap-3">
              <label htmlFor="codigo" className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a9a9a]">
                Código de acceso
              </label>
              <input
                id="codigo"
                name="codigo"
                type="password"
                autoComplete="off"
                className="h-12 rounded-md border border-white/15 bg-[#0a0a0a] px-3 font-mono text-white outline-none focus:border-[#e50914]"
              />
              {fase.error && <p className="text-sm text-[#ff4d4d]">{fase.error}</p>}
              <button type="submit" className="h-12 rounded-md bg-[#e50914] font-semibold text-white active:bg-[#b80710]">
                Entrar
              </button>
            </form>
          )}

          {fase.tipo === "enviando" && (
            <section className="mt-16 flex flex-col items-center gap-3" aria-live="polite">
              <Cronometro inicio={fase.inicio} />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a9a9a]">Preparando el borrador</p>
            </section>
          )}

          {fase.tipo === "listo" && (
            <section className="mt-14 flex flex-col items-center">
              <button
                type="button"
                disabled={grabadora.estado === "pidiendo-permiso"}
                onClick={grabando ? grabadora.parar : grabadora.empezar}
                aria-label={grabando ? "Parar y enviar" : "Grabar audio"}
                className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[#e50914] active:scale-95 disabled:opacity-50"
              >
                {grabando && <span className="absolute inset-0 animate-ping rounded-full bg-[#e50914]/40" />}
                {grabando ? (
                  <span className="relative h-10 w-10 rounded-sm bg-white" />
                ) : (
                  <svg viewBox="0 0 24 24" className="relative h-14 w-14 fill-white" aria-hidden="true">
                    <path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 1 0-7 0v6A3.5 3.5 0 0 0 12 15Zm6-3.5a.9.9 0 1 0-1.8 0 4.2 4.2 0 0 1-8.4 0 .9.9 0 1 0-1.8 0 6 6 0 0 0 5.1 5.93V20H8.6a.9.9 0 1 0 0 1.8h6.8a.9.9 0 1 0 0-1.8h-2.5v-2.57A6 6 0 0 0 18 11.5Z" />
                  </svg>
                )}
              </button>
              <p className="mt-5 font-mono text-sm tabular-nums text-[#ededed]">
                {grabando
                  ? `${Math.floor(grabadora.segundos / 60)}:${String(grabadora.segundos % 60).padStart(2, "0")} · toca para enviar${restante <= 15 ? ` (quedan ${restante} s)` : ""}`
                  : "Toca para grabar"}
              </p>
              {(grabadora.error || fase.error) && (
                <p className="mt-4 text-center text-sm text-[#ff4d4d]">{grabadora.error ?? fase.error}</p>
              )}

              {!grabando && (
                <form
                  className="mt-12 flex w-full flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (texto.trim()) void enviar(texto.trim());
                  }}
                >
                  <label htmlFor="texto" className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a9a9a]">
                    O escríbelo
                  </label>
                  <textarea
                    id="texto"
                    rows={3}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Baño de cinco metros: quitar la bañera, plato de ducha de 120…"
                    className="rounded-md border border-white/15 bg-[#0a0a0a] p-3 text-[15px] text-white outline-none placeholder:text-[#5a5a5a] focus:border-[#e50914]"
                  />
                  <div className="flex items-center justify-between">
                    <label className="cursor-pointer font-mono text-xs text-[#9a9a9a] underline underline-offset-4">
                      Subir un audio
                      <input
                        type="file"
                        accept="audio/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void enviar(f);
                        }}
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={!texto.trim()}
                      className="h-10 rounded-md border border-white/20 px-4 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      Enviar texto
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </>
      )}

      <footer className="mt-auto pt-12 text-xs leading-relaxed text-[#6a6a6a]">
        Empresa y tarifa ficticias («Reformas Ejemplo»): los precios son de ejemplo. El borrador no se envía a nadie.
      </footer>
    </main>
  );
}
