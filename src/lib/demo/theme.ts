import type { SectorTheme } from "./types";

export function themeToCSS(theme: SectorTheme): Record<string, string> {
  return {
    "--demo-primary": theme.primary,
    "--demo-primary-light": theme.primaryLight,
    "--demo-primary-dark": theme.primaryDark,
    "--demo-secondary": theme.secondary,
    "--demo-bg-main": theme.bgMain,
    "--demo-bg-section": theme.bgSection,
    "--demo-bg-dark": theme.bgDark,
    "--demo-text-primary": theme.textPrimary,
    "--demo-text-secondary": theme.textSecondary,
    "--demo-text-on-primary": theme.textOnPrimary,
    "--demo-border": theme.borderColor,
    "--demo-card-bg": theme.cardBg,
  };
}
