import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Settings } from '@/lib/db.ts';
import { getSettings } from '@/lib/db.ts';
import { applyTheme, getTheme } from '@/lib/themes.ts';
import { Spinner } from '@/components/ui/spinner.tsx';

export type { Settings };

const SettingsContext = createContext<Settings | null>(null);
const ThemeContext = createContext<(id: string) => void>(() => undefined);
const THEME_KEY = 'aaraamam-theme';

export function useSetTheme(): (id: string) => void {
  return useContext(ThemeContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [override, setOverride] = useState<string | null>(() => localStorage.getItem(THEME_KEY));

  const pick = useCallback((id: string) => {
    localStorage.setItem(THEME_KEY, id);
    setOverride(id);
  }, []);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
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

  if (!settings) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={pick}>
      <SettingsContext.Provider value={{ ...settings, theme: themeId }}>{children}</SettingsContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings outside SettingsProvider');
  return ctx;
}
