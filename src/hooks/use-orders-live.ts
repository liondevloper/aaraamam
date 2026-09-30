import { useEffect, useState } from 'react';
import type { Order } from '@/lib/db.ts';
import { listOrdersForAdmin } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';

/** Live admin orders list with realtime inserts/updates. */
export function useOrdersLive() {
  const [orders, setOrders] = useState<Order[] | undefined>(undefined);

  useEffect(() => {
    listOrdersForAdmin().then(setOrders).catch(console.error);

    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        listOrdersForAdmin().then(setOrders).catch(console.error);
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  return orders;
}
