import { useEffect, useState } from 'react';
import type { Order } from '@/lib/db.ts';
import { getOrderByRiderToken } from '@/lib/db.ts';

/** Orders are private (RLS), so poll the secure rider RPC instead of realtime. */
export function useRiderOrder(token: string) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    const load = () => getOrderByRiderToken(token).then(setOrder).catch(() => setOrder(null));
    void load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [token]);

  return order;
}
