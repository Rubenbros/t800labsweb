interface DemoFooterProps {
  businessName: string;
  createdBy: string;
  rights: string;
}

export function DemoFooter({ businessName, createdBy, rights }: DemoFooterProps) {
  const initial = businessName.charAt(0).toUpperCase();

  return (
    <footer className="bg-demo-bg-dark py-10">
      <div className="mx-auto max-w-7xl px-5 md:px-20">
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-demo-primary text-demo-text-on-primary font-bold text-sm">
            {initial}
          </div>
          <span className="text-lg font-semibold text-white">{businessName}</span>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-white/50">
            {rights}
          </p>
          <p className="text-xs text-white/50">
            {createdBy}{" "}
            <a
              href="https://t800labs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/70 underline underline-offset-2 transition-colors hover:text-white"
            >
              T800 Labs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
