// All theme colors, fonts and radii live here. Change values to restyle a theme.
export type ThemeId = "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";

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
  {
    // Premium: near-black with champagne gold, luxury fine-dining feel
    id: "theme-4",
    label: "Royal Gold",
    font: "'Cormorant Garamond', 'Manrope', serif",
    hero: "full",
    card: "outlined",
    vars: {
      ...base,
      "--radius": "0.15rem",
      "--background": "oklch(0.14 0.005 80)",
      "--foreground": "oklch(0.95 0.02 85)",
      "--card": "oklch(0.18 0.008 80)",
      "--card-foreground": "oklch(0.95 0.02 85)",
      "--popover": "oklch(0.18 0.008 80)",
      "--popover-foreground": "oklch(0.95 0.02 85)",
      "--primary": "oklch(0.8 0.11 85)",
      "--primary-foreground": "oklch(0.14 0.005 80)",
      "--secondary": "oklch(0.23 0.01 80)",
      "--secondary-foreground": "oklch(0.92 0.03 85)",
      "--muted": "oklch(0.22 0.008 80)",
      "--muted-foreground": "oklch(0.7 0.03 85)",
      "--accent": "oklch(0.45 0.12 20)",
      "--accent-foreground": "oklch(0.96 0.02 85)",
      "--border": "oklch(0.8 0.11 85 / 25%)",
      "--input": "oklch(0.8 0.11 85 / 30%)",
      "--ring": "oklch(0.8 0.11 85)",
      "--destructive": "oklch(0.65 0.2 25)",
    },
  },
  {
    // Premium: Kerala banana-leaf green with saffron, modern editorial feel
    id: "theme-5",
    label: "Banana Leaf",
    font: "'Fraunces', 'Manrope', serif",
    hero: "split",
    card: "photo",
    vars: {
      ...base,
      "--radius": "1.1rem",
      "--background": "oklch(0.975 0.015 110)",
      "--foreground": "oklch(0.22 0.05 155)",
      "--card": "oklch(0.995 0.005 110)",
      "--card-foreground": "oklch(0.22 0.05 155)",
      "--popover": "oklch(0.995 0.005 110)",
      "--popover-foreground": "oklch(0.22 0.05 155)",
      "--primary": "oklch(0.36 0.09 158)",
      "--primary-foreground": "oklch(0.98 0.02 100)",
      "--secondary": "oklch(0.92 0.05 130)",
      "--secondary-foreground": "oklch(0.26 0.07 155)",
      "--muted": "oklch(0.94 0.025 115)",
      "--muted-foreground": "oklch(0.48 0.04 155)",
      "--accent": "oklch(0.72 0.17 60)",
      "--accent-foreground": "oklch(0.2 0.04 50)",
      "--border": "oklch(0.88 0.035 125)",
      "--input": "oklch(0.88 0.035 125)",
      "--ring": "oklch(0.36 0.09 158)",
    },
  },
];

// ── Admin panel themes ───────────────────────────────────────────────────────
// The admin panel never follows the visitor theme above. Admins pick one of these
// two premium looks instead (persisted locally per browser/device).
export type AdminLayoutId = "classic" | "midnight";

export type AdminThemeDef = {
  id: AdminLayoutId;
  label: string;
  description: string;
  /** Structural chrome, not just colors: "topnav" (classic) or "sidebar" (midnight) */
  nav: "topnav" | "sidebar";
  font: string;
  vars: Record<string, string>;
};

export const ADMIN_THEMES: AdminThemeDef[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Clean light dashboard with a top bar",
    nav: "topnav",
    font: "'Geist', ui-sans-serif, system-ui, sans-serif",
    vars: {
      "--radius": "0.625rem",
      "--background": "oklch(0.985 0.002 250)",
      "--foreground": "oklch(0.21 0.02 260)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.21 0.02 260)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.21 0.02 260)",
      "--primary": "oklch(0.45 0.18 265)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.96 0.008 260)",
      "--secondary-foreground": "oklch(0.25 0.03 260)",
      "--muted": "oklch(0.96 0.008 260)",
      "--muted-foreground": "oklch(0.52 0.02 260)",
      "--accent": "oklch(0.94 0.02 265)",
      "--accent-foreground": "oklch(0.25 0.05 265)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.92 0.006 260)",
      "--input": "oklch(0.92 0.006 260)",
      "--ring": "oklch(0.45 0.18 265)",
    },
  },
  {
    // Premium: near-black slate with a champagne-gold accent and a left sidebar
    id: "midnight",
    label: "Midnight Pro",
    description: "Premium dark dashboard with a side panel",
    nav: "sidebar",
    font: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    vars: {
      "--radius": "0.75rem",
      "--background": "oklch(0.16 0.012 265)",
      "--foreground": "oklch(0.95 0.006 260)",
      "--card": "oklch(0.205 0.014 265)",
      "--card-foreground": "oklch(0.95 0.006 260)",
      "--popover": "oklch(0.205 0.014 265)",
      "--popover-foreground": "oklch(0.95 0.006 260)",
      "--primary": "oklch(0.78 0.13 85)",
      "--primary-foreground": "oklch(0.16 0.012 265)",
      "--secondary": "oklch(0.26 0.016 265)",
      "--secondary-foreground": "oklch(0.92 0.01 260)",
      "--muted": "oklch(0.24 0.014 265)",
      "--muted-foreground": "oklch(0.68 0.015 260)",
      "--accent": "oklch(0.3 0.03 265)",
      "--accent-foreground": "oklch(0.95 0.006 260)",
      "--destructive": "oklch(0.65 0.2 25)",
      "--border": "oklch(0.78 0.13 85 / 16%)",
      "--input": "oklch(0.78 0.13 85 / 20%)",
      "--ring": "oklch(0.78 0.13 85)",
    },
  },
];

export function getAdminTheme(id: string): AdminThemeDef {
  return ADMIN_THEMES.find((t) => t.id === id) ?? ADMIN_THEMES[0];
}

export function applyAdminTheme(def: AdminThemeDef): void {
  const root = document.documentElement;
  for (const [k, val] of Object.entries(def.vars)) root.style.setProperty(k, val);
  document.body.style.fontFamily = def.font;
}

export function applyTheme(def: Pick<ThemeDef, "font" | "vars">): void {
  const root = document.documentElement;
  for (const [k, val] of Object.entries(def.vars)) root.style.setProperty(k, val);
  document.body.style.fontFamily = def.font;
}

export const getTheme = (id: string): ThemeDef =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];
