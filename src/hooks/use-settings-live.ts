import { useEffect, useState } from 'react';
import type { Settings } from '@/lib/db.ts';
import { getSettings, updateSettings } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';

/**
 * Subscribes to realtime settings updates. Used in site-layout so theme changes
 * made by admins propagate to all visitors.
 */
export function useSettingsLive() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);

    const channel = supabase
      .channel('settings-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        setSettings(payload.new as Settings);
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  return { settings, updateSettings };
}
