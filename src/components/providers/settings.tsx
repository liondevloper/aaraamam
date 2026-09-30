import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Settings } from '@/lib/db.ts';
import { getSettings } from '@/lib/db.ts';
import { withDefaultImages } from '@/lib/fallback-images.ts';
import { DEFAULT_STORE, normalizeStore } from '@/lib/store.ts';
import { supabase } from '@/lib/supabase.ts';
import { applyTheme, getTheme } from '@/lib/themes.ts';
import { Spinner } from '@/components/ui/spinner.tsx';

export type { Settings };

const SettingsContext = createContext<Settings | null>(null);
const ThemeContext = createContext<(id: string) => void>(() => undefined);
const NowContext = createContext<Date>(new Date());
const RefreshContext = createContext<() => Promise<void>>(async () => undefined);
const THEME_KEY = 'aaraamam-theme';

export function useSetTheme(): (id: string) => void {
  return useContext(ThemeContext);
}

/** Shared clock (ticks every 30s) so open/closed state flips on time without a reload. */
export function useNow(): Date {
  return useContext(NowContext);
}

/** Re-fetch settings right after an admin change, in case the live connection is slow. */
export function useRefreshSettings(): () => Promise<void> {
  return useContext(RefreshContext);
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
  store: DEFAULT_STORE,
};

const normalize = (s: Settings): Settings => withDefaultImages({ ...s, store: normalizeStore(s.store) });

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [override, setOverride] = useState<string | null>(() => localStorage.getItem(THEME_KEY));

  const pick = useCallback((id: string) => {
    localStorage.setItem(THEME_KEY, id);
    setOverride(id);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setSettings(normalize(await getSettings()));
    } catch {
      // Keep the last known settings if the network blips
    }
  }, []);

  useEffect(() => {
    getSettings()
      .then((s) => setSettings(normalize(s)))
      .catch(() => setSettings(FALLBACK_SETTINGS))
      .finally(() => setLoading(false));

    // Shift / maintenance changes from the admin reach every open browser instantly.
    // Re-fetch instead of trusting the payload: large unchanged JSON columns can be left out of it.
    const channel = supabase
      .channel('settings-live-global')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, () => void refresh())
      .subscribe();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    const poll = setInterval(() => void refresh(), 60000);
    const tick = setInterval(() => setNow(new Date()), 30000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(poll);
      clearInterval(tick);
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

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
    <RefreshContext.Provider value={refresh}>
      <NowContext.Provider value={now}>
        <ThemeContext.Provider value={pick}>
          <SettingsContext.Provider value={{ ...resolvedSettings, theme: themeId }}>{children}</SettingsContext.Provider>
        </ThemeContext.Provider>
      </NowContext.Provider>
    </RefreshContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings outside SettingsProvider');
  return ctx;
}
