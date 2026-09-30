import { useEffect, useState } from 'react';
import type { Booking } from '@/lib/db.ts';
import { listBookingsForAdmin, setBookingStatus } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { formatTime12 } from '@/lib/format.ts';

export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[] | undefined>(undefined);

  useEffect(() => {
    listBookingsForAdmin().then(setBookings).catch(console.error);
    const channel = supabase
      .channel('bookings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        listBookingsForAdmin().then(setBookings).catch(console.error);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  if (!bookings) return <p>Loading...</p>;
  if (bookings.length === 0) return <p className="text-muted-foreground">No bookings yet.</p>;

  const byDate = new Map<string, typeof bookings>();
  for (const b of [...bookings].sort((a, b) => (a.booking_date + a.slot).localeCompare(b.booking_date + b.slot))) {
    byDate.set(b.booking_date, [...(byDate.get(b.booking_date) ?? []), b]);
  }

  return (
    <div className="space-y-6">
      {[...byDate.entries()].map(([date, list]) => (
        <section key={date}>
          <h3 className="mb-2 font-bold">{date}</h3>
          <div className="space-y-2">
            {list.map((b) => (
              <div key={b.id} className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${b.status === 'pending' ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{b.booking_no} · {formatTime12(b.slot)} · {b.guests} guests</p>
                  <p>{b.name} · {b.phone}</p>
                  {b.notes && <p className="text-muted-foreground">{b.notes}</p>}
                </div>
                <Badge variant={b.status === 'cancelled' ? 'destructive' : 'secondary'}>{b.status}</Badge>
                {b.status !== 'confirmed' && b.status !== 'cancelled' && <Button size="sm" onClick={() => void setBookingStatus(b.id, 'confirmed').then(() => listBookingsForAdmin().then(setBookings))}>Confirm</Button>}
                {b.status !== 'cancelled' && <Button size="sm" variant="destructive" onClick={() => void setBookingStatus(b.id, 'cancelled').then(() => listBookingsForAdmin().then(setBookings))}>Cancel</Button>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
