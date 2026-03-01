import Image from "next/image";

interface DemoHeroProps {
  title: string;
  subtitle: string;
  badge: string;
  cta1: string;
  cta2: string;
  imageUrl: string;
  businessName: string;
}

export function DemoHero({ title, subtitle, badge, cta1, cta2, imageUrl, businessName }: DemoHeroProps) {
  return (
    <section className="overflow-hidden">
      {/* Mobile: image on top */}
      <div className="relative h-[220px] w-full md:hidden">
        <Image
          src={imageUrl}
          alt={businessName}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-demo-bg/30" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col md:flex-row md:items-center md:gap-[60px]">
        {/* Text column */}
        <div className="flex-1 px-5 py-10 md:px-20 md:py-20" style={{ flexBasis: "55%" }}>
          <span className="inline-block rounded-full bg-demo-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-demo-primary">
            {badge}
          </span>
          <h1 className="mt-5 text-[28px] font-bold leading-tight text-demo-text md:text-5xl md:leading-[1.15]">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-demo-text-muted md:text-lg md:mt-6">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-xl bg-demo-primary px-7 py-3.5 text-sm font-semibold text-demo-text-on-primary transition-all hover:opacity-90"
            >
              {cta1}
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center rounded-xl border-2 border-demo-primary px-7 py-3.5 text-sm font-semibold text-demo-primary transition-all hover:bg-demo-primary/5"
            >
              {cta2}
            </a>
          </div>
        </div>

        {/* Desktop image column */}
        <div className="relative hidden md:block md:py-20 md:pr-20" style={{ flexBasis: "45%" }}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Image
              src={imageUrl}
              alt={businessName}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
