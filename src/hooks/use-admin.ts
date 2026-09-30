import { useEffect, useState } from 'react';
import { getAdminStatus } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';

type AdminStatus = { signedIn: boolean; isAdmin: boolean; canClaim: boolean };

const DEFAULT_STATUS: AdminStatus = { signedIn: false, isAdmin: false, canClaim: false };

export function useAdminStatus() {
  const [status, setStatus] = useState<AdminStatus | undefined>(undefined);

  useEffect(() => {
    // On error, fall back to default so login form always shows
    getAdminStatus()
      .then(setStatus)
      .catch(() => setStatus(DEFAULT_STATUS));

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      getAdminStatus()
        .then(setStatus)
        .catch(() => setStatus(DEFAULT_STATUS));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return status;
}
