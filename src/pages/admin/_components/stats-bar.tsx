import { Banknote, ChefHat, Inbox, ShoppingBag } from 'lucide-react';
import type { Order } from '@/lib/db.ts';
import { money } from '@/lib/format.ts';
import { ACTIVE_STATUSES } from '@/lib/orders.ts';
import { dubaiDayKey } from '@/lib/store.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';

export default function StatsBar({ orders }: { orders: Order[] | undefined }) {
  if (!orders) {
    return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  }
  const today = dubaiDayKey(new Date());
  const todays = orders.filter((o) => dubaiDayKey(new Date(o.created_at)) === today && o.status !== 'rejected' && o.status !== 'cancelled');
  const stats = [
    { label: 'New orders', value: String(orders.filter((o) => o.status === 'new').length), icon: Inbox, hot: orders.some((o) => o.status === 'new') },
    { label: 'In kitchen / on the way', value: String(orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length), icon: ChefHat, hot: false },
    { label: 'Orders today', value: String(todays.length), icon: ShoppingBag, hot: false },
    { label: 'Sales today', value: money(todays.reduce((n, o) => n + Number(o.total), 0)), icon: Banknote, hot: false },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, hot }) => (
        <div key={label} className={hot ? 'rounded-xl border border-primary bg-primary/10 p-4' : 'rounded-xl border bg-card p-4'}>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4" />{label}</p>
          <p className="mt-1 truncate text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
