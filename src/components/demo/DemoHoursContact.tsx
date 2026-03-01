interface DemoHoursContactProps {
  hoursTitle: string;
  contactTitle: string;
  hours: Record<string, string>;
  address: string;
  phone: string;
  email: string;
  closedLabel: string;
  addressLabel: string;
  phoneLabel: string;
  emailLabel: string;
  mapEmbedUrl?: string;
  dayLabels: Record<string, string>;
}

export function DemoHoursContact({
  hoursTitle,
  contactTitle,
  hours,
  address,
  phone,
  email,
  closedLabel,
  addressLabel,
  phoneLabel,
  emailLabel,
  mapEmbedUrl,
  dayLabels,
}: DemoHoursContactProps) {
  return (
    <section id="horarios" className="bg-demo-bg-section py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-20">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Hours */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-demo-text">{hoursTitle}</h2>
            <div className="rounded-xl border border-demo-border bg-demo-card overflow-hidden">
              {Object.entries(hours).map(([day, time], i) => {
                const isClosed = time === "Cerrado";
                const translatedDay = dayLabels[day] || day;
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between px-5 py-3.5 ${
                      i < Object.entries(hours).length - 1 ? "border-b border-demo-border" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-demo-text">{translatedDay}</span>
                    <span className={`text-sm ${isClosed ? "font-semibold text-red-500" : "text-demo-text-muted"}`}>
                      {isClosed ? closedLabel : time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div id="contacto">
            <h2 className="mb-6 text-2xl font-bold text-demo-text">{contactTitle}</h2>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3 rounded-xl border border-demo-border bg-demo-card p-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-demo-primary">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-demo-text-muted">{addressLabel}</p>
                  <p className="mt-1 text-sm text-demo-text">{address}</p>
                </div>
              </div>

              {/* Phone */}
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-start gap-3 rounded-xl border border-demo-border bg-demo-card p-5 transition-colors hover:border-demo-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-demo-primary">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-demo-text-muted">{phoneLabel}</p>
                  <p className="mt-1 text-sm text-demo-text">{phone}</p>
                </div>
              </a>

              {/* Email */}
              <a href={`mailto:${email}`} className="flex items-start gap-3 rounded-xl border border-demo-border bg-demo-card p-5 transition-colors hover:border-demo-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-demo-primary">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-demo-text-muted">{emailLabel}</p>
                  <p className="mt-1 text-sm text-demo-text">{email}</p>
                </div>
              </a>

              {/* Map */}
              {mapEmbedUrl && (
                <div className="overflow-hidden rounded-xl border border-demo-border">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location map"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
