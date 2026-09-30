import { useParams, useSearchParams } from 'react-router-dom';
import { Check, Clock, Phone, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import MapView from '@/components/map-view.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useOrderTrack } from '@/hooks/use-order-track.ts';
import { money } from '@/lib/format.ts';
import { cn } from '@/lib/utils.ts';

const STEPS: Record<string, readonly string[]> = {
  delivery: ['new', 'accepted', 'preparing', 'out_for_delivery', 'delivered'],
  pickup: ['new', 'accepted', 'preparing', 'ready', 'delivered'],
  dine_in: ['new', 'accepted', 'preparing', 'ready', 'delivered'],
};

export default function TrackPage() {
  const { orderNo = '' } = useParams();
  const [sp] = useSearchParams();
  const { t } = useLang();
  const order = useOrderTrack(orderNo, sp.get('t') ?? '');

  if (order === undefined) return <div className="mx-auto max-w-xl p-6"><Skeleton className="h-64" /></div>;
  if (order === null) {
    return <p className="mx-auto max-w-xl p-10 text-center">{t('This tracking link is not valid.', 'رابط التتبع غير صالح.')}</p>;
  }

  const dine = order.order_type === 'dine_in';
  const labels: Record<string, [string, string]> = {
    new: ['Order received', 'تم استلام الطلب'],
    accepted: ['Accepted by restaurant', 'قبله المطعم'],
    preparing: ['Being prepared in kitchen', 'قيد التحضير في المطبخ'],
    out_for_delivery: ['Out for delivery', 'في الطريق'],
    ready: dine ? ['Coming to your table', 'في الطريق إلى طاولتك'] : ['Ready for pickup', 'جاهز للاستلام'],
    delivered: dine ? ['Served', 'تم التقديم'] : order.order_type === 'pickup' ? ['Picked up', 'تم الاستلام'] : ['Delivered', 'تم التوصيل'],
  };

  const steps = STEPS[order.order_type] ?? STEPS.delivery;
  const idx = steps.indexOf(order.status);
  const dead = order.status === 'rejected' || order.status === 'cancelled';
  const finished = order.status === 'delivered';
  const hasRider = order.rider_lat !== null && order.rider_lng !== null;
  const updated = order.updated_at ?? order.created_at;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm text-muted-foreground">
          {t('Order', 'الطلب')}
          {dine && order.table_no && ` · ${t('Table', 'طاولة')} ${order.table_no}`}
        </p>
        <h1 className="text-3xl font-bold">{order.order_no}</h1>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />{t('Placed', 'وقت الطلب')} {format(new Date(order.created_at), 'p')}
        </p>
      </div>

      {dead ? (
        <p className="rounded-lg bg-destructive/10 p-4 font-medium text-destructive">
          {order.status === 'rejected' ? t('Sorry, the restaurant could not accept this order.', 'عذرًا، لم يتمكن المطعم من قبول الطلب.') : t('This order was cancelled.', 'تم إلغاء الطلب.')}
        </p>
      ) : (
        <>
          <div className={cn('rounded-lg p-4', finished ? 'bg-primary text-primary-foreground' : 'border bg-card')}>
            <p className="text-xs uppercase tracking-wide opacity-70">{t('Current status', 'الحالة الحالية')}</p>
            <p className="text-xl font-bold">{t(...labels[order.status])}</p>
            <p className="mt-1 text-xs opacity-70">{t('Last update', 'آخر تحديث')} {format(new Date(updated), 'p')}</p>
          </div>
          <ol className="space-y-3">
            {steps.map((st, i) => (
              <li key={st} className="flex items-center gap-3">
                <span className={cn('flex size-7 items-center justify-center rounded-full border text-xs', i <= idx ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                  {i <= idx ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn(i === idx && 'font-bold', i > idx && 'text-muted-foreground')}>{t(...labels[st])}</span>
              </li>
            ))}
          </ol>
          {!finished && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><RefreshCw className="size-3" />{t('This page updates automatically.', 'تتحدث هذه الصفحة تلقائيًا.')}</p>
          )}
        </>
      )}

      {order.status === 'out_for_delivery' && order.lat !== null && order.lng !== null && (
        <div className="space-y-2">
          <MapView center={[order.lat, order.lng]} zoom={14} dest={[order.lat, order.lng]} rider={hasRider ? [order.rider_lat!, order.rider_lng!] : null} className="h-72 w-full rounded-lg" />
          {order.rider_name && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
              <span>{t('Rider', 'المندوب')}: {order.rider_name}</span>
              {order.rider_phone && <Button asChild size="sm" variant="secondary"><a href={`tel:${order.rider_phone}`}><Phone className="size-4" />{t('Call', 'اتصال')}</a></Button>}
            </div>
          )}
          {!hasRider && <p className="text-sm text-muted-foreground">{t("Waiting for the rider's location...", 'بانتظار موقع المندوب...')}</p>}
        </div>
      )}

      <div className="space-y-1 rounded-lg border bg-card p-4 text-sm">
        {order.items.map((l, i) => <div key={i} className="flex justify-between"><span>{l.qty} × {l.name}{l.variantLabel ? ` (${l.variantLabel})` : ''}</span><span>{money(l.qty * l.unitPrice)}</span></div>)}
        <div className="flex justify-between border-t pt-2 font-bold"><span>{t('Total', 'الإجمالي')}</span><span>{money(order.total)}</span></div>
      </div>
    </div>
  );
}
