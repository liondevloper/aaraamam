import { useEffect, useState } from 'react';
import type { Order } from '@/lib/db.ts';
import { listOrdersForAdmin } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';

/** Live admin orders list: realtime updates plus a 15s fallback poll in case the socket drops. */
export function useOrdersLive() {
  const [orders, setOrders] = useState<Order[] | undefined>(undefined);

  useEffect(() => {
    const load = () => listOrdersForAdmin().then(setOrders).catch(console.error);
    void load();

    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => void load())
      .subscribe();
    const id = setInterval(load, 15000);

    return () => {
      clearInterval(id);
      void supabase.removeChannel(channel);
    };
  }, []);

  return orders;
}
