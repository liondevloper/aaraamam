import { ADMIN_THEME, type ThemeDef } from './themes.ts';

// Admin-only looks. Picked per device in the admin panel and never shown to customers.
export type AdminThemeId = 'admin-1' | 'admin-2' | 'admin-3' | 'admin-4' | 'admin-5';

export type AdminTheme = Pick<ThemeDef, 'font' | 'vars'> & {
  id: AdminThemeId;
  label: string;
  hint: string;
  /** Turns on `dark:` utility variants while this theme is active */
  dark: boolean;
};

export const ADMIN_THEME_KEY = 'aaraamam-admin-theme';

export const ADMIN_THEMES: AdminTheme[] = [
  {
    id: 'admin-1',
    label: 'Clean Light',
    hint: 'Bright and simple, best for daytime',
    dark: false,
    ...ADMIN_THEME,
  },
  {
    id: 'admin-2',
    label: 'Midnight',
    hint: 'Dark slate, easy on the eyes at night',
    dark: true,
    font: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    vars: {
      '--radius': '0.75rem',
      '--background': 'oklch(0.17 0.02 265)',
      '--foreground': 'oklch(0.95 0.01 265)',
      '--card': 'oklch(0.21 0.025 265)',
      '--card-foreground': 'oklch(0.95 0.01 265)',
      '--popover': 'oklch(0.21 0.025 265)',
      '--popover-foreground': 'oklch(0.95 0.01 265)',
      '--primary': 'oklch(0.7 0.15 265)',
      '--primary-foreground': 'oklch(0.15 0.02 265)',
      '--secondary': 'oklch(0.26 0.025 265)',
      '--secondary-foreground': 'oklch(0.93 0.01 265)',
      '--muted': 'oklch(0.25 0.02 265)',
      '--muted-foreground': 'oklch(0.7 0.02 265)',
      '--accent': 'oklch(0.3 0.05 265)',
      '--accent-foreground': 'oklch(0.95 0.01 265)',
      '--destructive': 'oklch(0.65 0.2 25)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 14%)',
      '--ring': 'oklch(0.7 0.15 265)',
    },
  },
  {
    id: 'admin-3',
    label: 'Kerala Green',
    hint: 'Banana-leaf green with a warm saffron touch',
    dark: false,
    font: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
    vars: {
      '--radius': '1rem',
      '--background': 'oklch(0.975 0.012 120)',
      '--foreground': 'oklch(0.23 0.05 155)',
      '--card': 'oklch(0.995 0.004 120)',
      '--card-foreground': 'oklch(0.23 0.05 155)',
      '--popover': 'oklch(0.995 0.004 120)',
      '--popover-foreground': 'oklch(0.23 0.05 155)',
      '--primary': 'oklch(0.42 0.1 155)',
      '--primary-foreground': 'oklch(0.98 0.02 100)',
      '--secondary': 'oklch(0.94 0.03 130)',
      '--secondary-foreground': 'oklch(0.28 0.06 155)',
      '--muted': 'oklch(0.95 0.02 120)',
      '--muted-foreground': 'oklch(0.48 0.04 155)',
      '--accent': 'oklch(0.93 0.06 75)',
      '--accent-foreground': 'oklch(0.3 0.07 60)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.89 0.03 125)',
      '--input': 'oklch(0.89 0.03 125)',
      '--ring': 'oklch(0.42 0.1 155)',
    },
  },
  {
    id: 'admin-4',
    label: 'Royal Gold',
    hint: 'Black and champagne gold, premium feel',
    dark: true,
    font: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    vars: {
      '--radius': '0.4rem',
      '--background': 'oklch(0.15 0.005 80)',
      '--foreground': 'oklch(0.94 0.02 85)',
      '--card': 'oklch(0.19 0.008 80)',
      '--card-foreground': 'oklch(0.94 0.02 85)',
      '--popover': 'oklch(0.19 0.008 80)',
      '--popover-foreground': 'oklch(0.94 0.02 85)',
      '--primary': 'oklch(0.8 0.11 85)',
      '--primary-foreground': 'oklch(0.15 0.005 80)',
      '--secondary': 'oklch(0.24 0.01 80)',
      '--secondary-foreground': 'oklch(0.92 0.03 85)',
      '--muted': 'oklch(0.23 0.008 80)',
      '--muted-foreground': 'oklch(0.7 0.03 85)',
      '--accent': 'oklch(0.27 0.03 85)',
      '--accent-foreground': 'oklch(0.94 0.02 85)',
      '--destructive': 'oklch(0.65 0.2 25)',
      '--border': 'oklch(0.8 0.11 85 / 20%)',
      '--input': 'oklch(0.8 0.11 85 / 28%)',
      '--ring': 'oklch(0.8 0.11 85)',
    },
  },
  {
    id: 'admin-5',
    label: 'Sunset Warm',
    hint: 'Cream and terracotta, soft and friendly',
    dark: false,
    font: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    vars: {
      '--radius': '0.9rem',
      '--background': 'oklch(0.975 0.015 60)',
      '--foreground': 'oklch(0.25 0.04 40)',
      '--card': 'oklch(0.995 0.005 60)',
      '--card-foreground': 'oklch(0.25 0.04 40)',
      '--popover': 'oklch(0.995 0.005 60)',
      '--popover-foreground': 'oklch(0.25 0.04 40)',
      '--primary': 'oklch(0.58 0.17 38)',
      '--primary-foreground': 'oklch(0.99 0.01 60)',
      '--secondary': 'oklch(0.94 0.03 55)',
      '--secondary-foreground': 'oklch(0.3 0.06 40)',
      '--muted': 'oklch(0.95 0.02 60)',
      '--muted-foreground': 'oklch(0.5 0.04 40)',
      '--accent': 'oklch(0.93 0.04 55)',
      '--accent-foreground': 'oklch(0.3 0.08 40)',
      '--destructive': 'oklch(0.55 0.22 27)',
      '--border': 'oklch(0.89 0.03 55)',
      '--input': 'oklch(0.89 0.03 55)',
      '--ring': 'oklch(0.58 0.17 38)',
    },
  },
];

export const getAdminTheme = (id: string): AdminTheme => ADMIN_THEMES.find((t) => t.id === id) ?? ADMIN_THEMES[0];
