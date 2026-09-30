import { useEffect, useState } from 'react';
import { getAdminStatus } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';

type AdminStatus = { signedIn: boolean; isAdmin: boolean; canClaim: boolean };

export function useAdminStatus() {
  const [status, setStatus] = useState<AdminStatus | undefined>(undefined);

  useEffect(() => {
    getAdminStatus().then(setStatus).catch(console.error);
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      getAdminStatus().then(setStatus).catch(console.error);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return status;
}
