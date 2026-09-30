import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { MapPin, Navigation, Phone } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { mapsLink } from "@/lib/format.ts";

export default function RiderPage() {
  const { token = "" } = useParams();
  const order = useQuery(api.rider.get, { token });
  const update = useMutation(api.rider.update);
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
    if (!("geolocation" in navigator)) return toast.error("Location is not available on this device");
    await update({ token, action: "picked_up" });
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        if (Date.now() - lastSent.current < 10000) return;
        lastSent.current = Date.now();
        void update({ token, action: "location", lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => toast.error("Location permission denied. Live tracking is off."),
      { enableHighAccuracy: true },
    );
  };

  const delivered = async () => {
    stop();
    await update({ token, action: "delivered" });
    toast.success("Marked as delivered");
  };

  if (order === undefined) return <div className="p-6"><Skeleton className="h-64" /></div>;
  if (order === null) return <p className="p-10 text-center">This delivery link has expired.</p>;

  return (
    <div className="mx-auto max-w-md space-y-5 p-5">
      <div>
        <p className="text-sm text-muted-foreground">Delivery</p>
        <h1 className="text-3xl font-bold">{order.orderNo}</h1>
      </div>
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <p className="font-semibold">{order.customerName ?? "Customer"}</p>
        <p className="text-sm">{order.addressText}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary"><a href={`tel:${order.customerPhone}`}><Phone className="size-4" />Call</a></Button>
          {order.destLat !== undefined && order.destLng !== undefined && (
            <Button asChild variant="secondary"><a href={mapsLink(order.destLat, order.destLng)} target="_blank" rel="noreferrer"><MapPin className="size-4" />Open in Maps</a></Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Collect AED {order.total.toFixed(2)} (cash)</p>
      </div>
      <div className="space-y-3">
        <Button size="lg" className="w-full" disabled={tracking} onClick={() => void startDelivery()}><Navigation className="size-4" />Start Delivery</Button>
        <Button size="lg" variant="secondary" className="w-full" onClick={() => void update({ token, action: "on_the_way" })}>On the way</Button>
        <Button size="lg" variant="secondary" className="w-full" onClick={() => void delivered()}>Delivered</Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">Keep this screen on while delivering. Status buttons still work if the screen locks.</p>
    </div>
  );
}
