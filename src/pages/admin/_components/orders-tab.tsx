import { useState } from 'react';
import { Copy, Inbox, MapPin, MessageCircle, Phone, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Order } from '@/lib/db.ts';
import { assignRider, setOrderStatus } from '@/lib/db.ts';
import { errMsg } from '@/lib/errors.ts';
import { ACTIVE_STATUSES as ACTIVE, DONE_STATUSES as DONE } from '@/lib/orders.ts';
import { mapsLink, money } from '@/lib/format.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { EmptyBox, LoadingList, Segmented } from './admin-ui.tsx';

type Status = Order['status'];
type StatusTab = 'new' | 'active' | 'done';
type TypeFilter = 'all' | Order['order_type'];

const TYPE_LABEL: Record<Order['order_type'], string> = { delivery: 'Delivery', pickup: 'Pickup', dine_in: 'Table' };

const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-destructive text-white' },
  accepted: { label: 'Accepted', cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  preparing: { label: 'Preparing', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  out_for_delivery: { label: 'On the way', cls: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
  ready: { label: 'Ready', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  delivered: { label: 'Completed', cls: 'bg-muted text-muted-foreground' },
  rejected: { label: 'Rejected', cls: 'bg-destructive/15 text-destructive' },
  cancelled: { label: 'Cancelled', cls: 'bg-destructive/15 text-destructive' },
};

const matchTab = (tab: StatusTab, s: Status) => (tab === 'new' ? s === 'new' : tab === 'active' ? ACTIVE.includes(s) : DONE.includes(s));

export default function OrdersTab({ orders }: { orders: Order[] | undefined }) {
  const [tab, setTab] = useState<StatusTab>('new');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const list = orders?.filter((o) => matchTab(tab, o.status) && (typeFilter === 'all' || o.order_type === typeFilter)) ?? [];
  const count = (t: StatusTab) => orders?.filter((o) => matchTab(t, o.status)).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Segmented<StatusTab>
          value={tab}
          onChange={setTab}
          options={[
            { id: 'new', label: 'New', count: count('new') },
            { id: 'active', label: 'Active', count: count('active') },
            { id: 'done', label: 'Completed' },
          ]}
        />
        <Segmented<TypeFilter>
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { id: 'all', label: 'All' },
            { id: 'dine_in', label: 'Table' },
            { id: 'delivery', label: 'Delivery' },
            { id: 'pickup', label: 'Pickup' },
          ]}
        />
      </div>

      {orders === undefined ? (
        <LoadingList count={4} grid className="h-56" />
      ) : list.length === 0 ? (
        <EmptyBox
          icon={Inbox}
          title={tab === 'new' ? 'No new orders' : tab === 'active' ? 'Nothing in progress' : 'No completed orders yet'}
          description={tab === 'new' ? 'New orders appear here instantly. Turn on the order sound so you never miss one.' : undefined}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{list.map((o) => <OrderCard key={o.id} o={o} />)}</div>
      )}
    </div>
  );
}

function OrderCard({ o }: { o: Order }) {
  const [rn, setRn] = useState(o.rider_name ?? '');
  const [rp, setRp] = useState(o.rider_phone ?? '');
  const [riderToken, setRiderToken] = useState(o.rider_token ?? '');
  const [busy, setBusy] = useState(false);
  const link = riderToken ? `${window.location.origin}/rider/${riderToken}` : '';
  const trackLink = `${window.location.origin}/track/${o.order_no}?t=${o.tracking_token}`;
  const dine = o.order_type === 'dine_in';
  const st = STATUS_STYLE[o.status];

  const go = async (status: Status) => {
    setBusy(true);
    try {
      await setOrderStatus(o.id, status);
      toast.success(`${o.order_no}: ${STATUS_STYLE[status].label}`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const makeLink = async () => {
    if (!rn.trim()) return toast.error('Enter the rider name');
    try {
      setRiderToken(await assignRider(o.id, rn, rp));
      toast.success('Rider link ready');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const copy = (text: string, msg: string) => {
    void navigator.clipboard.writeText(text).then(() => toast.success(msg)).catch(() => toast.error('Could not copy'));
  };

  const next: { label: string; to: Status } | null =
    o.status === 'accepted' ? { label: 'Start preparing', to: 'preparing' }
    : o.status === 'preparing' ? (o.order_type === 'delivery' ? { label: 'Out for delivery', to: 'out_for_delivery' } : { label: dine ? 'Ready to serve' : 'Ready for pickup', to: 'ready' })
    : o.status === 'out_for_delivery' || o.status === 'ready' ? { label: dine ? 'Served' : o.order_type === 'pickup' ? 'Picked up' : 'Delivered', to: 'delivered' }
    : null;

  return (
    <article className={cn('flex flex-col overflow-hidden rounded-[calc(var(--radius)+4px)] border bg-card text-card-foreground shadow-sm', o.status === 'new' && 'border-2 border-destructive/70')}>
      <div className="flex items-start justify-between gap-3 border-b bg-muted/40 px-4 py-3">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">{o.order_no}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className="rounded-full border bg-background px-2.5 py-0.5 text-xs font-semibold">{TYPE_LABEL[o.order_type]}{dine && o.table_no ? ` ${o.table_no}` : ''}</span>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', st.cls)}>{st.label}</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {(o.customer_name || o.customer_phone || o.booking_no) && (
          <div className="text-sm">
            <p className="font-medium">{o.customer_name ?? 'Guest'}{o.customer_phone ? ` · ${o.customer_phone}` : ''}</p>
            {o.booking_no && <p className="text-muted-foreground">Booking {o.booking_no}</p>}
          </div>
        )}
        {o.address_text && (
          <p className="flex gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" /><span className="break-words">{o.address_text}
            {o.address_extra && Object.values(o.address_extra).some(Boolean) && <span className="block text-xs">{Object.values(o.address_extra).filter(Boolean).join(' · ')}</span>}
          </span></p>
        )}
        <ul className="divide-y rounded-[var(--radius)] border text-sm">
          {o.items.map((l, i) => (
            <li key={i} className="flex justify-between gap-3 px-3 py-1.5">
              <span className="min-w-0 break-words"><span className="font-semibold">{l.qty}×</span> {l.name}{l.variantLabel ? ` (${l.variantLabel})` : ''}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{money(l.unitPrice * l.qty)}</span>
            </li>
          ))}
        </ul>
        {o.notes && <p className="flex gap-2 rounded-[var(--radius)] bg-amber-500/10 p-2 text-sm"><StickyNote className="mt-0.5 size-4 shrink-0 text-amber-600" />{o.notes}</p>}
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">{dine ? 'Pay at table' : 'Cash on delivery'}{o.promo_code ? ` · ${o.promo_code}` : ''}</span>
          <span className="text-lg font-bold tabular-nums">{money(o.total)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {o.customer_phone && <Button asChild size="sm" variant="secondary"><a href={`tel:${o.customer_phone}`}><Phone className="size-4" />Call</a></Button>}
          {o.lat !== null && o.lng !== null && <Button asChild size="sm" variant="secondary"><a href={mapsLink(o.lat, o.lng)} target="_blank" rel="noreferrer"><MapPin className="size-4" />Maps</a></Button>}
          <Button size="sm" variant="secondary" onClick={() => copy(trackLink, 'Tracking link copied')}><Copy className="size-4" />Tracking link</Button>
        </div>

        {o.order_type === 'delivery' && ACTIVE.includes(o.status) && (
          <div className="space-y-2 rounded-[var(--radius)] border border-dashed p-3">
            <p className="text-sm font-semibold">Rider</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Rider name" value={rn} onChange={(e) => setRn(e.target.value)} />
              <Input placeholder="Rider phone" inputMode="tel" value={rp} onChange={(e) => setRp(e.target.value)} />
            </div>
            <Button size="sm" variant="secondary" onClick={() => void makeLink()}>{link ? 'Regenerate link' : 'Generate rider link'}</Button>
            {link && (
              <div className="space-y-2">
                <code className="block truncate rounded bg-muted px-2 py-1 text-xs">{link}</code>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => copy(link, 'Rider link copied')}><Copy className="size-4" />Copy</Button>
                  <Button asChild size="sm"><a href={`https://wa.me/${rp.replace(/\D/g, '')}?text=${encodeURIComponent(`Delivery ${o.order_no}: ${link}`)}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />WhatsApp</a></Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(o.status === 'new' || next || ACTIVE.includes(o.status)) && (
        <div className="flex gap-2 border-t p-3">
          {o.status === 'new' && (
            <>
              <Button className="flex-1" size="lg" disabled={busy} onClick={() => void go('accepted')}>Accept</Button>
              <Button size="lg" variant="destructive" disabled={busy} onClick={() => void go('rejected')}>Reject</Button>
            </>
          )}
          {next && <Button className="flex-1" size="lg" disabled={busy} onClick={() => void go(next.to)}>{next.label}</Button>}
          {ACTIVE.includes(o.status) && <Button size="lg" variant="ghost" className="text-destructive hover:text-destructive" disabled={busy} onClick={() => void go('cancelled')}>Cancel</Button>}
        </div>
      )}
    </article>
  );
}
