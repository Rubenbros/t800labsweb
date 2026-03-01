import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(229,9,20,0.08) 0%, transparent 70%)",
        }}
      />

      {/* 404 number */}
      <h1
        className="relative font-mono text-[clamp(100px,20vw,200px)] font-black leading-none tracking-tighter text-white/5"
        style={{ WebkitTextStroke: "1px rgba(229,9,20,0.3)" }}
      >
        404
      </h1>

      {/* Terminal-style message */}
      <div className="relative -mt-6 space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#e50914]">
          // SYSTEM ERROR
        </p>
        <h2 className="font-sans text-xl font-semibold text-white/90 md:text-2xl">
          Página no encontrada
        </h2>
        <p className="mx-auto max-w-md font-mono text-[11px] leading-relaxed text-white/40">
          La ruta solicitada no existe en el sistema. Verifica la URL o regresa
          al punto de origen.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="relative mt-8 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-6 py-3 font-mono text-xs uppercase tracking-widest text-white/70 transition-all duration-300 hover:border-[#e50914]/40 hover:bg-[#e50914]/10 hover:text-white"
      >
        <span>&larr;</span>
        <span>Volver al inicio</span>
      </Link>

      {/* Decorative corners */}
      <div className="pointer-events-none absolute left-6 top-6 font-mono text-[9px] text-white/10">
        SYS.ERR
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 font-mono text-[9px] text-white/10">
        T800_LABS // 404
      </div>
    </div>
  );
}
