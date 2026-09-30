import { useEffect, useState } from 'react';
import type { Order } from '@/lib/db.ts';
import { getOrderByToken } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';

/** Poll + realtime for order tracking page. */
export function useOrderTrack(orderNo: string, token: string) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!orderNo || !token) return;
    getOrderByToken(orderNo, token).then(setOrder).catch(() => setOrder(null));

    const channel = supabase
      .channel('order-track-' + orderNo)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        getOrderByToken(orderNo, token).then(setOrder).catch(() => setOrder(null));
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [orderNo, token]);

  return order;
}
