import { DemoMobileMenu } from "./DemoMobileMenu";

interface DemoHeaderProps {
  businessName: string;
  cta: string;
  isDark: boolean;
  navLinks: {
    services: string;
    reviews: string;
    hours: string;
    contact: string;
  };
}

export function DemoHeader({ businessName, cta, isDark, navLinks }: DemoHeaderProps) {
  const initial = businessName.charAt(0).toUpperCase();

  return (
    <header
      className={`sticky top-0 z-50 border-b border-demo-border ${
        isDark ? "bg-demo-bg/95" : "bg-white/95"
      } backdrop-blur-md`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 md:h-[72px] h-[56px]">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-demo-primary text-demo-text-on-primary font-bold text-lg">
            {initial}
          </div>
          <span className="text-lg font-semibold text-demo-text">{businessName}</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#servicios" className="text-sm font-medium text-demo-text-muted hover:text-demo-primary transition-colors">
            {navLinks.services}
          </a>
          <a href="#resenas" className="text-sm font-medium text-demo-text-muted hover:text-demo-primary transition-colors">
            {navLinks.reviews}
          </a>
          <a href="#horarios" className="text-sm font-medium text-demo-text-muted hover:text-demo-primary transition-colors">
            {navLinks.hours}
          </a>
          <a href="#contacto" className="text-sm font-medium text-demo-text-muted hover:text-demo-primary transition-colors">
            {navLinks.contact}
          </a>
        </nav>

        {/* Desktop CTA + Mobile Menu */}
        <div className="flex items-center gap-3">
          <a
            href="#contacto"
            className="hidden rounded-lg bg-demo-primary px-5 py-2.5 text-sm font-semibold text-demo-text-on-primary transition-all hover:opacity-90 md:inline-block"
          >
            {cta}
          </a>
          <DemoMobileMenu
            navLinks={navLinks}
            cta={cta}
          />
        </div>
      </div>
    </header>
  );
}
