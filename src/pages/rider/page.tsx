import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Navigation, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { updateRiderLocation } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useRiderOrder } from '@/hooks/use-rider-order.ts';
import { mapsLink } from '@/lib/format.ts';

export default function RiderPage() {
  const { token = '' } = useParams();
  const order = useRiderOrder(token);
  const [tracking, setTracking] = useState(false);
  const watchId = useRef<number | null>(null);
  const lastSent = useRef(0);

  const stop = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
  };
  useEffect(() => stop, []);

  const startDelivery = async () => {
    if (!('geolocation' in navigator)) return toast.error('Location is not available on this device');
    await updateRiderLocation(token, 'picked_up');
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        if (Date.now() - lastSent.current < 10000) return;
        lastSent.current = Date.now();
        void updateRiderLocation(token, 'location', p.coords.latitude, p.coords.longitude);
      },
      () => toast.error('Location permission denied. Live tracking is off.'),
      { enableHighAccuracy: true },
    );
  };

  const delivered = async () => {
    stop();
    await updateRiderLocation(token, 'delivered');
    toast.success('Marked as delivered');
  };

  if (order === undefined) return <div className="p-6"><Skeleton className="h-64" /></div>;
  if (order === null) return <p className="p-10 text-center">This delivery link has expired.</p>;

  return (
    <div className="mx-auto max-w-md space-y-5 p-5">
      <div>
        <p className="text-sm text-muted-foreground">Delivery</p>
        <h1 className="text-3xl font-bold">{order.order_no}</h1>
      </div>
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <p className="font-semibold">{order.customer_name ?? 'Customer'}</p>
        <p className="text-sm">{order.address_text}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary"><a href={`tel:${order.customer_phone}`}><Phone className="size-4" />Call</a></Button>
          {order.lat !== null && order.lng !== null && (
            <Button asChild variant="secondary"><a href={mapsLink(order.lat, order.lng)} target="_blank" rel="noreferrer"><MapPin className="size-4" />Open in Maps</a></Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Collect AED {order.total.toFixed(2)} (cash)</p>
      </div>
      <div className="space-y-3">
        <Button size="lg" className="w-full" disabled={tracking} onClick={() => void startDelivery()}><Navigation className="size-4" />Start Delivery</Button>
        <Button size="lg" variant="secondary" className="w-full" onClick={() => void updateRiderLocation(token, 'on_the_way')}>On the way</Button>
        <Button size="lg" variant="secondary" className="w-full" onClick={() => void delivered()}>Delivered</Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">Keep this screen on while delivering. Status buttons still work if the screen locks.</p>
    </div>
  );
}
