import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { formatTime12 } from "@/lib/format.ts";

export default function BookingsTab() {
  const bookings = useQuery(api.bookings.listForAdmin, {});
  const setStatus = useMutation(api.bookings.setStatus);
  if (!bookings) return <p>Loading...</p>;
  if (bookings.length === 0) return <p className="text-muted-foreground">No bookings yet.</p>;

  const byDate = new Map<string, typeof bookings>();
  for (const b of [...bookings].sort((a, b) => (a.bookingDate + a.slot).localeCompare(b.bookingDate + b.slot))) {
    byDate.set(b.bookingDate, [...(byDate.get(b.bookingDate) ?? []), b]);
  }
  return (
    <div className="space-y-6">
      {[...byDate.entries()].map(([date, list]) => (
        <section key={date}>
          <h3 className="mb-2 font-bold">{date}</h3>
          <div className="space-y-2">
            {list.map((b) => (
              <div key={b._id} className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${b.status === "pending" ? "border-primary bg-primary/5" : "bg-card"}`}>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{b.bookingNo} · {formatTime12(b.slot)} · {b.guests} guests</p>
                  <p>{b.name} · {b.phone}</p>
                  {b.notes && <p className="text-muted-foreground">{b.notes}</p>}
                </div>
                <Badge variant={b.status === "cancelled" ? "destructive" : "secondary"}>{b.status}</Badge>
                {b.status !== "confirmed" && b.status !== "cancelled" && <Button size="sm" onClick={() => void setStatus({ id: b._id, status: "confirmed" })}>Confirm</Button>}
                {b.status !== "cancelled" && <Button size="sm" variant="destructive" onClick={() => void setStatus({ id: b._id, status: "cancelled" })}>Cancel</Button>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
