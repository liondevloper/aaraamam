import { useEffect, useState } from 'react';
import type { Order } from '@/lib/db.ts';
import { getOrderByRiderToken } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';

export function useRiderOrder(token: string) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    getOrderByRiderToken(token).then(setOrder).catch(() => setOrder(null));

    const channel = supabase
      .channel('rider-order-' + token)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        getOrderByRiderToken(token).then(setOrder).catch(() => setOrder(null));
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [token]);

  return order;
}
