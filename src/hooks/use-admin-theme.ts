import { useCallback, useEffect, useState } from 'react';
import { useSettings } from '@/components/providers/settings.tsx';
import { applyAdminTheme, applyTheme, getAdminTheme, getTheme, type AdminLayoutId } from '@/lib/themes.ts';

const ADMIN_LAYOUT_KEY = 'aaraamam-admin-layout';
const VALID_LAYOUTS: AdminLayoutId[] = ['classic', 'midnight', 'emerald'];

function readStored(): AdminLayoutId {
  const v = localStorage.getItem(ADMIN_LAYOUT_KEY);
  return VALID_LAYOUTS.includes(v as AdminLayoutId) ? (v as AdminLayoutId) : 'classic';
}

/**
 * Gives the admin panel its own switchable look (independent from the visitor theme)
 * and restores the visitor theme when leaving. Persisted per browser via localStorage.
 */
export function useAdminTheme(): { layout: AdminLayoutId; setLayout: (id: AdminLayoutId) => void } {
  const { theme, primary_color: primary } = useSettings();
  const [layout, setLayoutState] = useState<AdminLayoutId>(readStored);

  useEffect(() => {
    applyAdminTheme(getAdminTheme(layout));
    return () => {
      const def = getTheme(theme);
      applyTheme(def);
      const root = document.documentElement;
      if (primary) {
        root.style.setProperty('--primary', primary);
        root.style.setProperty('--ring', primary);
      }
    };
  }, [layout, theme, primary]);

  const setLayout = useCallback((id: AdminLayoutId) => {
    localStorage.setItem(ADMIN_LAYOUT_KEY, id);
    setLayoutState(id);
  }, []);

  return { layout, setLayout };
}
