import { useEffect, useState } from 'react';
import { Copy, MapPin, MessageCircle, Phone, Power } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Order } from '@/lib/db.ts';
import { assignRider, setOrderStatus } from '@/lib/db.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useOrdersLive } from '@/hooks/use-orders-live.ts';
import { useRing } from '@/hooks/use-ring.ts';
import { mapsLink, money } from '@/lib/format.ts';

type Status = Order['status'];
const ACTIVE: Status[] = ['accepted', 'preparing', 'out_for_delivery', 'ready'];
const DONE: Status[] = ['delivered', 'rejected', 'cancelled'];
const TYPE_LABEL: Record<Order['order_type'], string> = { delivery: 'Delivery', pickup: 'Pickup', dine_in: 'Table' };
type TypeFilter = 'all' | Order['order_type'];

function errMsg(e: unknown): string {
  return e && typeof e === 'object' && 'message' in e && typeof e.message === 'string' ? e.message : 'Something went wrong';
}

export default function OrdersTab() {
  const orders = useOrdersLive();
  const [tab, setTab] = useState('new');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [shift, setShift] = useState(false);
  const hasNew = orders?.some((o) => o.status === 'new') ?? false;
  const unlock = useRing(hasNew, shift);

  useEffect(() => {
    if (!shift || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    (navigator as Navigator & { wakeLock: { request: (t: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen').then((l) => { lock = l; }).catch(() => undefined);
    return () => { void lock?.release(); };
  }, [shift]);

  const byStatus = (o: Order) => (tab === 'new' ? o.status === 'new' : tab === 'active' ? ACTIVE.includes(o.status) : DONE.includes(o.status));
  const list = orders?.filter((o) => byStatus(o) && (typeFilter === 'all' || o.order_type === typeFilter)) ?? [];
  const countFor = (k: string) => orders?.filter((o) => (k === 'new' ? o.status === 'new' : k === 'active' ? ACTIVE.includes(o.status) : false)).length ?? 0;

  return (
    <div className="space-y-4">
      {!shift ? (
        <Button size="lg" onClick={() => { unlock(); setShift(true); }}><Power className="size-4" />Start Shift (enable sound)</Button>
      ) : (
        <p className="text-sm text-muted-foreground">Shift running. A loud ring plays while any order is new.</p>
      )}
      {hasNew && !shift && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">New order waiting. Press Start Shift to hear the alert.</p>}
      <div className="flex flex-wrap gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="new">New ({countFor('new')})</TabsTrigger>
            <TabsTrigger value="active">Active ({countFor('active')})</TabsTrigger>
            <TabsTrigger value="done">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="dine_in">Table</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="pickup">Pickup</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {orders === undefined ? <p>Loading...</p> : list.length === 0 ? <p className="text-muted-foreground">No orders here.</p> : (
        <div className="grid gap-4 lg:grid-cols-2">{list.map((o) => <OrderCard key={o.id} o={o} />)}</div>
      )}
    </div>
  );
}

function OrderCard({ o }: { o: Order }) {
  const go = (status: Status) => void setOrderStatus(o.id, status).then(() => toast.success(`${o.order_no}: ${status.replace(/_/g, ' ')}`)).catch((e) => toast.error(errMsg(e)));
  const [rn, setRn] = useState(o.rider_name ?? '');
  const [rp, setRp] = useState(o.rider_phone ?? '');
  const [riderToken, setRiderToken] = useState(o.rider_token ?? '');
  const link = riderToken ? `${window.location.origin}/rider/${riderToken}` : '';
  const trackLink = `${window.location.origin}/track/${o.order_no}?t=${o.tracking_token}`;
  const dine = o.order_type === 'dine_in';

  const makeLink = async () => {
    if (!rn.trim()) return toast.error('Enter the rider name');
    try {
      setRiderToken(await assignRider(o.id, rn, rp));
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-lg font-bold">{o.order_no}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge>{TYPE_LABEL[o.order_type]}{dine && o.table_no ? ` ${o.table_no}` : ''}</Badge>
          <Badge variant="secondary">{o.status.replace(/_/g, ' ')}</Badge>
        </div>
      </div>
      {o.booking_no && <p className="text-sm font-medium">Booking {o.booking_no}</p>}
      {(o.customer_name || o.customer_phone) && <p className="text-sm">{o.customer_name ?? 'Guest'}{o.customer_phone ? ` · ${o.customer_phone}` : ''}</p>}
      {o.address_text && <p className="text-sm text-muted-foreground">{o.address_text}</p>}
      {o.address_extra && Object.values(o.address_extra).some(Boolean) && <p className="text-xs text-muted-foreground">{Object.values(o.address_extra).filter(Boolean).join(' · ')}</p>}
      <ul className="text-sm">{o.items.map((l, i) => <li key={i}>{l.qty} × {l.name}{l.variantLabel ? ` (${l.variantLabel})` : ''}</li>)}</ul>
      {o.notes && <p className="text-sm italic">"{o.notes}"</p>}
      <p className="font-semibold">{money(o.total)} · {dine ? 'Pay at table' : 'Cash on delivery'}</p>
      <div className="flex flex-wrap gap-2">
        {o.customer_phone && <Button asChild size="sm" variant="secondary"><a href={`tel:${o.customer_phone}`}><Phone className="size-4" />Call</a></Button>}
        {o.lat !== null && o.lng !== null && <Button asChild size="sm" variant="secondary"><a href={mapsLink(o.lat, o.lng)} target="_blank" rel="noreferrer"><MapPin className="size-4" />Maps</a></Button>}
        <Button size="sm" variant="secondary" onClick={() => { void navigator.clipboard.writeText(trackLink); toast.success('Tracking link copied'); }}><Copy className="size-4" />Tracking link</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {o.status === 'new' && <><Button size="sm" onClick={() => go('accepted')}>Accept</Button><Button size="sm" variant="destructive" onClick={() => go('rejected')}>Reject</Button></>}
        {o.status === 'accepted' && <Button size="sm" onClick={() => go('preparing')}>Preparing</Button>}
        {o.status === 'preparing' && (o.order_type === 'delivery' ? <Button size="sm" onClick={() => go('out_for_delivery')}>Out for delivery</Button> : <Button size="sm" onClick={() => go('ready')}>{dine ? 'Ready to serve' : 'Ready'}</Button>)}
        {(o.status === 'out_for_delivery' || o.status === 'ready') && <Button size="sm" onClick={() => go('delivered')}>{dine ? 'Served' : o.order_type === 'pickup' ? 'Picked up' : 'Delivered'}</Button>}
        {ACTIVE.includes(o.status) && <Button size="sm" variant="destructive" onClick={() => go('cancelled')}>Cancel</Button>}
      </div>
      {o.order_type === 'delivery' && ACTIVE.includes(o.status) && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Rider</p>
          <div className="grid grid-cols-2 gap-2"><Input placeholder="Rider name" value={rn} onChange={(e) => setRn(e.target.value)} /><Input placeholder="Rider phone" value={rp} onChange={(e) => setRp(e.target.value)} /></div>
          <Button size="sm" variant="secondary" onClick={() => void makeLink()}>{link ? 'Regenerate link' : 'Generate rider link'}</Button>
          {link && (
            <div className="flex flex-wrap items-center gap-2">
              <code className="max-w-full truncate rounded bg-muted px-2 py-1 text-xs">{link}</code>
              <Button size="sm" variant="secondary" onClick={() => { void navigator.clipboard.writeText(link); toast.success('Copied'); }}><Copy className="size-4" />Copy</Button>
              <Button asChild size="sm"><a href={`https://wa.me/${rp.replace(/\D/g, '')}?text=${encodeURIComponent(`Delivery ${o.order_no}: ${link}`)}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />WhatsApp</a></Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
