// All theme colors, fonts and radii live here. Change values to restyle a theme.
export type ThemeId = "theme-1" | "theme-2" | "theme-3";

export type ThemeDef = {
  id: ThemeId;
  label: string;
  font: string;
  vars: Record<string, string>;
  hero: "full" | "split" | "centered";
  card: "photo" | "flat" | "outlined";
};

const base = {
  "--card": "oklch(1 0 0)",
  "--popover": "oklch(1 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
};

export const THEMES: ThemeDef[] = [
  {
    id: "theme-1",
    label: "Theme 1",
    font: "'Poppins', sans-serif",
    hero: "full",
    card: "photo",
    vars: {
      ...base,
      "--radius": "0.9rem",
      "--background": "oklch(0.985 0.012 95)",
      "--foreground": "oklch(0.24 0.04 150)",
      "--card-foreground": "oklch(0.24 0.04 150)",
      "--popover-foreground": "oklch(0.24 0.04 150)",
      "--primary": "oklch(0.42 0.11 150)",
      "--primary-foreground": "oklch(0.985 0.01 95)",
      "--secondary": "oklch(0.94 0.03 100)",
      "--secondary-foreground": "oklch(0.3 0.06 150)",
      "--muted": "oklch(0.95 0.02 100)",
      "--muted-foreground": "oklch(0.5 0.03 150)",
      "--accent": "oklch(0.62 0.2 27)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--border": "oklch(0.9 0.02 100)",
      "--input": "oklch(0.9 0.02 100)",
      "--ring": "oklch(0.42 0.11 150)",
    },
  },
  {
    id: "theme-2",
    label: "Theme 2",
    font: "'DM Sans', sans-serif",
    hero: "split",
    card: "flat",
    vars: {
      ...base,
      "--radius": "0.3rem",
      "--background": "oklch(0.2 0.02 60)",
      "--foreground": "oklch(0.96 0.02 85)",
      "--card": "oklch(0.26 0.025 60)",
      "--card-foreground": "oklch(0.96 0.02 85)",
      "--popover": "oklch(0.26 0.025 60)",
      "--popover-foreground": "oklch(0.96 0.02 85)",
      "--primary": "oklch(0.78 0.15 75)",
      "--primary-foreground": "oklch(0.2 0.02 60)",
      "--secondary": "oklch(0.3 0.03 60)",
      "--secondary-foreground": "oklch(0.96 0.02 85)",
      "--muted": "oklch(0.3 0.03 60)",
      "--muted-foreground": "oklch(0.75 0.03 80)",
      "--accent": "oklch(0.68 0.17 45)",
      "--accent-foreground": "oklch(0.16 0.02 60)",
      "--border": "oklch(0.36 0.03 60)",
      "--input": "oklch(0.36 0.03 60)",
      "--ring": "oklch(0.78 0.15 75)",
    },
  },
  {
    id: "theme-3",
    label: "Theme 3",
    font: "'Playfair Display', serif",
    hero: "centered",
    card: "outlined",
    vars: {
      ...base,
      "--radius": "1.5rem",
      "--background": "oklch(0.97 0.02 40)",
      "--foreground": "oklch(0.25 0.05 20)",
      "--card-foreground": "oklch(0.25 0.05 20)",
      "--popover-foreground": "oklch(0.25 0.05 20)",
      "--primary": "oklch(0.45 0.16 25)",
      "--primary-foreground": "oklch(0.98 0.01 40)",
      "--secondary": "oklch(0.93 0.04 50)",
      "--secondary-foreground": "oklch(0.3 0.08 25)",
      "--muted": "oklch(0.94 0.03 50)",
      "--muted-foreground": "oklch(0.5 0.05 25)",
      "--accent": "oklch(0.55 0.13 150)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--border": "oklch(0.86 0.05 40)",
      "--input": "oklch(0.86 0.05 40)",
      "--ring": "oklch(0.45 0.16 25)",
    },
  },
];

export function applyTheme(def: ThemeDef): void {
  const root = document.documentElement;
  for (const [k, val] of Object.entries(def.vars)) root.style.setProperty(k, val);
  document.body.style.fontFamily = def.font;
}

export const getTheme = (id: string): ThemeDef =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];
