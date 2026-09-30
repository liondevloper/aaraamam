import type { ThemeId } from "@/lib/themes.ts";

// Each theme gets its own navigation pattern and footer treatment, not just colors.
export type NavStyle = "classic" | "bottom" | "editorial" | "drawer" | "dock";

export type ThemeNav = {
  nav: NavStyle;
  name: string;
  // Extra footer classes that give each theme its own line / border character
  footer: string;
};

export const THEME_NAV: Record<ThemeId, ThemeNav> = {
  "theme-1": { nav: "classic", name: "Classic", footer: "border-t bg-secondary/50" },
  "theme-2": { nav: "bottom", name: "App Tabs", footer: "border-t-2 border-primary bg-card" },
  "theme-3": { nav: "editorial", name: "Editorial", footer: "border-t-4 border-double border-primary/50 bg-secondary/40" },
  "theme-4": { nav: "drawer", name: "Royal Drawer", footer: "border-t border-primary/40 bg-card" },
  "theme-5": { nav: "dock", name: "Floating Dock", footer: "mx-3 mb-3 rounded-[var(--radius)] border bg-secondary/60" },
};

export const hasTabBar = (nav: NavStyle): boolean => nav === "bottom" || nav === "dock";
