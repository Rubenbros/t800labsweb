import { Inter } from "next/font/google";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { businesses } from "@/lib/demo/businesses";
import { sectors } from "@/lib/demo/sectors";
import { themeToCSS } from "@/lib/demo/theme";
import "../../../globals-demo.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

export default async function DemoLayout({ children, params }: Props) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const business = businesses[slug];
  if (!business) {
    notFound();
  }

  const sector = sectors[business.sectorId];
  if (!sector) {
    notFound();
  }

  const cssVars = themeToCSS(sector.theme);

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} font-demo antialiased`}
        style={{
          ...cssVars,
          background: sector.theme.bgMain,
          color: sector.theme.textPrimary,
          colorScheme: sector.theme.isDark ? "dark" : "light",
        }}
      >
        {children}
      </body>
    </html>
  );
}
