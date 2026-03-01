"use client";

interface LavaFooterProps {
  t: (key: string) => string;
}

export default function LavaFooter({ t }: LavaFooterProps) {
  return (
    <div
      className="lava-rising-container absolute inset-x-0 bottom-0 z-[20] pointer-events-none"
      style={{ height: "100vh" }}
    >
      {/* Full container gradient: lava orange → red → dark → black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #ea580c 0%, #c2410c 4%, #991b1b 8%, #7f1d1d 13%, #450a0a 20%, #1c0500 28%, #050100 38%, #000 50%)",
        }}
      />

      {/* ── LAVA SURFACE (waves, hand, bubbles) ── */}
      {/* Height 0 — everything extends ABOVE via negative positioning */}
      <div className="lava-visual relative overflow-visible" style={{ height: 0 }}>

        {/* Heat shimmer glow above lava surface */}
        <div
          className="lava-heat-shimmer pointer-events-none absolute inset-x-0 h-24 opacity-0"
          style={{
            top: "-96px",
            background:
              "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255,120,0,0.3) 0%, rgba(255,60,0,0.1) 50%, transparent 100%)",
          }}
        />

        {/* SVG Wave Layer 1 — BACK (slowest, deep red) */}
        <svg
          className="lava-wave-back absolute inset-x-0"
          style={{ width: "200%", height: "120px", top: "-60px" }}
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60 C160 20, 320 90, 480 55 C640 20, 800 85, 960 50 C1120 15, 1280 80, 1440 55 C1600 30, 1760 90, 1920 50 C2080 10, 2240 85, 2400 55 C2560 25, 2720 80, 2880 60 L2880 120 L0 120Z"
            fill="#7f1d1d"
          />
          <path
            d="M0 75 C180 50, 360 95, 540 70 C720 45, 900 90, 1080 65 C1260 40, 1440 85, 1620 70 C1800 55, 1980 95, 2160 65 C2340 35, 2520 85, 2700 70 L2880 75 L2880 120 L0 120Z"
            fill="#991b1b"
            opacity="0.7"
          />
        </svg>

        {/* SVG Wave Layer 2 — MID (orange) */}
        <svg
          className="lava-wave-mid absolute inset-x-0"
          style={{ width: "200%", height: "100px", top: "-45px" }}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 50 C200 20, 400 75, 600 45 C800 15, 1000 70, 1200 40 C1400 10, 1600 65, 1800 45 C2000 25, 2200 75, 2400 40 C2600 5, 2800 60, 2880 50 L2880 100 L0 100Z"
            fill="#c2410c"
          />
          <path
            d="M0 65 C240 40, 480 80, 720 55 C960 30, 1200 75, 1440 55 C1680 35, 1920 80, 2160 55 C2400 30, 2640 70, 2880 65 L2880 100 L0 100Z"
            fill="#ea580c"
            opacity="0.6"
          />
        </svg>

        {/* Terminator hand — offset right, extends above lava surface */}
        <div
          className="lava-hand absolute z-[5]"
          style={{
            top: "-220px",
            right: "18%",
            width: "clamp(70px, 10vw, 120px)",
            height: "clamp(140px, 22vw, 260px)",
            transformOrigin: "bottom center",
          }}
        >
          <img
            src="/terminator-hand.png"
            alt="Terminator thumbs up"
            className="h-full w-full object-contain"
            style={{
              filter: "drop-shadow(0 0 14px rgba(255,100,0,0.4))",
              maskImage: "linear-gradient(to bottom, black 82%, transparent 98%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 98%)",
            }}
          />
          {/* Small lava glow at the very base of the arm */}
          <div
            className="absolute bottom-0 left-1/2 pointer-events-none"
            style={{
              width: "80%",
              height: "18px",
              transform: "translateX(-50%)",
              background: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(249,115,22,0.7) 0%, rgba(234,88,12,0.3) 50%, transparent 100%)",
              filter: "blur(6px)",
            }}
          />
        </div>

        {/* SVG Wave Layer 3 — FRONT (fastest, bright orange-yellow) */}
        <svg
          className="lava-wave-front absolute inset-x-0"
          style={{ width: "200%", height: "80px", top: "-30px" }}
          viewBox="0 0 2880 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 40 C180 15, 360 60, 540 35 C720 10, 900 55, 1080 30 C1260 5, 1440 50, 1620 35 C1800 20, 1980 60, 2160 30 C2340 0, 2520 50, 2700 35 L2880 40 L2880 80 L0 80Z"
            fill="#ea580c"
          />
          <path
            d="M0 55 C200 35, 400 65, 600 45 C800 25, 1000 60, 1200 40 C1400 20, 1600 55, 1800 45 C2000 35, 2200 65, 2400 40 C2600 15, 2800 55, 2880 55 L2880 80 L0 80Z"
            fill="#f97316"
            opacity="0.8"
          />
          {/* Surface highlight line */}
          <path
            d="M0 42 C180 17, 360 62, 540 37 C720 12, 900 57, 1080 32 C1260 7, 1440 52, 1620 37 C1800 22, 1980 62, 2160 32 C2340 2, 2520 52, 2700 37 L2880 42"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            opacity="0.5"
          />
        </svg>

        {/* Bubble particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`lava-bubble-${i}`}
            className={`lava-bubble lava-bubble-${i} absolute rounded-full opacity-0`}
            style={{
              width: `${8 + (i % 3) * 5}px`,
              height: `${8 + (i % 3) * 5}px`,
              left: `${8 + i * 11}%`,
              top: "-10px",
              background:
                "radial-gradient(circle, #fbbf24 0%, #f97316 50%, #ea580c 100%)",
              boxShadow: "0 0 10px 3px rgba(251,191,36,0.5)",
            }}
          />
        ))}
      </div>

      {/* ── FOOTER CONTENT ── */}
      <div
        className="lava-footer-content pointer-events-none relative px-6 py-6 md:px-10 md:py-8"
        style={{ marginTop: "18vh" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-10">
            {/* Column 1: Logo + description */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <img src="/logo-small.png" alt="T800 Labs" className="h-7" />
                <span className="text-base font-bold text-white">
                  T800<span className="text-[#e50914]">Labs</span>
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-white/40">
                {t("Footer.description")}
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                {t("Footer.navigation")}
              </h4>
              <div className="space-y-1.5 font-mono text-[10px] text-white/40">
                <a href="#servicios" className="pointer-events-auto block transition-colors duration-300 hover:text-[#e50914]">
                  {t("Navbar.servicios")}
                </a>
                <a href="#proceso" className="pointer-events-auto block transition-colors duration-300 hover:text-[#e50914]">
                  {t("Navbar.proceso")}
                </a>
                <a href="#portfolio" className="pointer-events-auto block transition-colors duration-300 hover:text-[#e50914]">
                  {t("Navbar.portfolio")}
                </a>
                <a href="#equipo" className="pointer-events-auto block transition-colors duration-300 hover:text-[#e50914]">
                  {t("Navbar.equipo")}
                </a>
                <a href="#contacto" className="pointer-events-auto block transition-colors duration-300 hover:text-[#e50914]">
                  {t("Navbar.contacto")}
                </a>
              </div>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                {t("Footer.contact")}
              </h4>
              <div className="space-y-1.5 font-mono text-[10px] text-white/40">
                <a
                  href="mailto:hola@t800labs.com"
                  className="pointer-events-auto block transition-colors duration-300 hover:text-[#e50914]"
                >
                  hola@t800labs.com
                </a>
                <a
                  href="https://wa.me/34645515267"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto block transition-colors duration-300 hover:text-[#e50914]"
                >
                  +34 646 515 267
                </a>
              </div>
            </div>

            {/* Column 4: Social */}
            <div>
              <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                {t("Footer.followUs")}
              </h4>
              <div className="flex gap-5">
                <a
                  href="https://github.com/rubenbros"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto font-mono text-[10px] text-white/40 transition-colors duration-300 hover:text-[#e50914]"
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/rubenbros"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto font-mono text-[10px] text-white/40 transition-colors duration-300 hover:text-[#e50914]"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <span className="font-mono text-[9px] text-white/20">
              {t("Footer.copyright")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
