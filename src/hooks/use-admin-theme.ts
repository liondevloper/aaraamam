import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '@/components/providers/settings.tsx';
import { ADMIN_THEME_KEY, getAdminTheme, type AdminThemeId } from '@/lib/admin-themes.ts';
import { applyTheme, getTheme } from '@/lib/themes.ts';

const readStored = (): AdminThemeId => {
  try {
    return getAdminTheme(localStorage.getItem(ADMIN_THEME_KEY) ?? '').id;
  } catch {
    return getAdminTheme('').id;
  }
};

/**
 * Gives the admin panel its own look (one of 5 admin themes, saved per device)
 * and restores the visitor theme when leaving the admin page.
 */
export function useAdminTheme(): [AdminThemeId, (id: AdminThemeId) => void] {
  const { theme, primary_color: primary } = useSettings();
  const [id, setId] = useState<AdminThemeId>(readStored);
  // Remember the page's original dark class once, so leaving admin puts it back
  const initialDark = useRef<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (initialDark.current === null) initialDark.current = root.classList.contains('dark');
    const def = getAdminTheme(id);
    applyTheme(def);
    root.classList.toggle('dark', def.dark);

    return () => {
      applyTheme(getTheme(theme));
      root.classList.toggle('dark', initialDark.current ?? false);
      if (primary) {
        root.style.setProperty('--primary', primary);
        root.style.setProperty('--ring', primary);
      }
    };
  }, [id, theme, primary]);

  const choose = useCallback((next: AdminThemeId) => {
    try {
      localStorage.setItem(ADMIN_THEME_KEY, next);
    } catch {
      // Private mode: the choice just will not persist
    }
    setId(next);
  }, []);

  return [id, choose];
}
