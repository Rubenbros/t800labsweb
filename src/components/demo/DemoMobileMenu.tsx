"use client";

import { useState } from "react";

interface DemoMobileMenuProps {
  navLinks: {
    services: string;
    reviews: string;
    hours: string;
    contact: string;
  };
  cta: string;
}

export function DemoMobileMenu({ navLinks, cta }: DemoMobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-demo-text"
        aria-label="Menu"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[56px] border-b border-demo-border bg-demo-bg p-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            <a href="#servicios" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-demo-text hover:bg-demo-primary/10">
              {navLinks.services}
            </a>
            <a href="#resenas" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-demo-text hover:bg-demo-primary/10">
              {navLinks.reviews}
            </a>
            <a href="#horarios" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-demo-text hover:bg-demo-primary/10">
              {navLinks.hours}
            </a>
            <a href="#contacto" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-demo-text hover:bg-demo-primary/10">
              {navLinks.contact}
            </a>
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-demo-primary px-4 py-3 text-center text-sm font-semibold text-demo-text-on-primary"
            >
              {cta}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
