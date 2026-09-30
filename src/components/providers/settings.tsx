import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api.js";
import { applyTheme, getTheme } from "@/lib/themes.ts";
import { Spinner } from "@/components/ui/spinner.tsx";

export type Settings = FunctionReturnType<typeof api.settings.getPublic>;

const SettingsContext = createContext<Settings | null>(null);

const ThemeContext = createContext<(id: string) => void>(() => undefined);
const THEME_KEY = "aaraamam-theme";

// Visitors can pick their own theme; it is remembered in their browser.
export function useSetTheme(): (id: string) => void {
  return useContext(ThemeContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = useQuery(api.settings.getPublic, {});
  const [override, setOverride] = useState<string | null>(() => localStorage.getItem(THEME_KEY));
  const pick = (id: string) => {
    localStorage.setItem(THEME_KEY, id);
    setOverride(id);
  };

  const themeId = override ?? settings?.theme ?? "theme-1";
  const primary = settings?.primaryColor;
  useEffect(() => {
    const def = getTheme(themeId);
    applyTheme(def);
    const root = document.documentElement;
    if (primary) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
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
  if (!ctx) throw new Error("useSettings outside SettingsProvider");
  return ctx;
}
