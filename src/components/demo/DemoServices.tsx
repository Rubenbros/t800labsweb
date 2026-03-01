import { ServiceIcon } from "./ServiceIcon";

interface DemoServicesProps {
  title: string;
  subtitle: string;
  services: { icon: string; title: string; desc: string }[];
  isDark: boolean;
}

export function DemoServices({ title, subtitle, services, isDark }: DemoServicesProps) {
  return (
    <section id="servicios" className="bg-demo-bg-section py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-demo-primary">
            {subtitle}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-demo-text md:text-3xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <div
              key={i}
              className={`rounded-xl border border-demo-border p-6 transition-shadow hover:shadow-md ${
                isDark ? "bg-demo-card" : "bg-white"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-demo-primary/10 text-demo-primary">
                <ServiceIcon name={service.icon} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-demo-text">{service.title}</h3>
              <p className="text-sm leading-relaxed text-demo-text-muted">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
