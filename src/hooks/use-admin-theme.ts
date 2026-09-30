import { useEffect } from 'react';
import { useSettings } from '@/components/providers/settings.tsx';
import { ADMIN_THEME, applyTheme, getTheme } from '@/lib/themes.ts';

// Gives the admin panel its own fixed look and restores the visitor theme when leaving
export function useAdminTheme(): void {
  const { theme, primary_color: primary } = useSettings();

  useEffect(() => {
    applyTheme(ADMIN_THEME);
    return () => {
      const def = getTheme(theme);
      applyTheme(def);
      const root = document.documentElement;
      if (primary) {
        root.style.setProperty('--primary', primary);
        root.style.setProperty('--ring', primary);
      }
    };
  }, [theme, primary]);
}
