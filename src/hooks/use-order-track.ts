import { useEffect, useState } from 'react';
import type { Order } from '@/lib/db.ts';
import { getOrderByToken } from '@/lib/db.ts';

/** Orders are private (RLS), so realtime events don't reach customers; poll the secure RPC instead. */
export function useOrderTrack(orderNo: string, token: string) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!orderNo || !token) return;
    const load = () => getOrderByToken(orderNo, token).then(setOrder).catch(() => setOrder(null));
    void load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [orderNo, token]);

  return order;
}
