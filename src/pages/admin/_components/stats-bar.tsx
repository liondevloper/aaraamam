import { Banknote, ChefHat, Inbox, ShoppingBag } from 'lucide-react';
import type { Order } from '@/lib/db.ts';
import { money } from '@/lib/format.ts';
import { ACTIVE_STATUSES } from '@/lib/orders.ts';
import { dubaiDayKey } from '@/lib/store.ts';
import { cn } from '@/lib/utils.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';

export default function StatsBar({ orders, onOpenOrders }: { orders: Order[] | undefined; onOpenOrders?: () => void }) {
  if (!orders) {
    return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[calc(var(--radius)+4px)]" />)}</div>;
  }
  const today = dubaiDayKey(new Date());
  const todays = orders.filter((o) => dubaiDayKey(new Date(o.created_at)) === today && o.status !== 'rejected' && o.status !== 'cancelled');
  const newOrders = orders.filter((o) => o.status === 'new').length;
  const stats = [
    { label: 'New orders', value: String(newOrders), icon: Inbox, hot: newOrders > 0 },
    { label: 'In kitchen / on the way', value: String(orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length), icon: ChefHat, hot: false },
    { label: 'Orders today', value: String(todays.length), icon: ShoppingBag, hot: false },
    { label: 'Sales today', value: money(todays.reduce((n, o) => n + Number(o.total), 0)), icon: Banknote, hot: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, hot }) => (
        <button
          key={label}
          type="button"
          onClick={onOpenOrders}
          className={cn(
            'cursor-pointer rounded-[calc(var(--radius)+4px)] border bg-card p-4 text-left text-card-foreground shadow-sm transition-colors hover:border-primary/50',
            hot && 'border-primary bg-primary/10',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)]', hot ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
              <Icon className="size-4" />
            </span>
          </div>
          <p className="mt-2 truncate text-2xl font-bold tabular-nums">{value}</p>
        </button>
      ))}
    </div>
  );
}
