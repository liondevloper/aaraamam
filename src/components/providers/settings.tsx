import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Settings } from '@/lib/db.ts';
import { getSettings } from '@/lib/db.ts';
import { withDefaultImages } from '@/lib/fallback-images.ts';
import { applyTheme, getTheme } from '@/lib/themes.ts';
import { Spinner } from '@/components/ui/spinner.tsx';

export type { Settings };

const SettingsContext = createContext<Settings | null>(null);
const ThemeContext = createContext<(id: string) => void>(() => undefined);
const THEME_KEY = 'aaraamam-theme';

export function useSetTheme(): (id: string) => void {
  return useContext(ThemeContext);
}

// Minimal fallback settings so the app never gets stuck loading forever
const FALLBACK_SETTINGS: Settings = {
  id: 1,
  restaurant_name: 'Aaraamam',
  theme: 'theme-1',
  primary_color: null,
  vat_percent: 5,
  flags: { ordering: true, booking: true, delivery: true, pickup: true, cod: true, mapPin: false, autofill: false, tracking: false },
  delivery: { lat: 25.2528, lng: 55.3176, radiusKm: 10, fee: 10, minOrder: 50 },
  address_fields: {},
  booking_config: { open: '10:00', close: '22:00', slotMinutes: 30, capacityPerSlot: 20, maxDaysAhead: 14, closedWeekdays: [], holidays: [] },
  content: {
    heroTitleEn: 'Authentic Kerala Cuisine', heroTitleAr: '', heroSubtitleEn: '', heroSubtitleAr: '',
    offerBannerEn: '', offerBannerAr: '', aboutEn: '', aboutAr: '',
    phone: '', whatsapp: '', address: '', openingHours: '',
    heroImage: '', aboutImage: '', gallery: [],
  },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [override, setOverride] = useState<string | null>(() => localStorage.getItem(THEME_KEY));

  const pick = useCallback((id: string) => {
    localStorage.setItem(THEME_KEY, id);
    setOverride(id);
  }, []);

  useEffect(() => {
    getSettings()
      .then((s) => setSettings(withDefaultImages(s)))
      .catch(() => setSettings(FALLBACK_SETTINGS))
      .finally(() => setLoading(false));
  }, []);

  const themeId = override ?? settings?.theme ?? 'theme-1';
  const primary = settings?.primary_color;

  useEffect(() => {
    // The admin page applies its own fixed theme (see use-admin-theme.ts)
    if (window.location.pathname.startsWith('/admin')) return;
    const def = getTheme(themeId);
    applyTheme(def);
    const root = document.documentElement;
    if (primary) {
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--ring', primary);
    }
    document.body.style.fontFamily = def.font;
  }, [themeId, primary]);

  // Show spinner only on non-admin routes to avoid blocking the login page
  if (loading && !window.location.pathname.startsWith('/admin')) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const resolvedSettings = settings ?? FALLBACK_SETTINGS;

  return (
    <ThemeContext.Provider value={pick}>
      <SettingsContext.Provider value={{ ...resolvedSettings, theme: themeId }}>{children}</SettingsContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings outside SettingsProvider');
  return ctx;
}
