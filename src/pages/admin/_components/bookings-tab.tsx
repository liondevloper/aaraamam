import { useCallback, useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Phone, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Booking } from '@/lib/db.ts';
import { listBookingsForAdmin, setBookingStatus } from '@/lib/db.ts';
import { errMsg } from '@/lib/errors.ts';
import { formatTime12 } from '@/lib/format.ts';
import { dubaiDayKey } from '@/lib/store.ts';
import { supabase } from '@/lib/supabase.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { EmptyBox, LoadingList, Segmented } from './admin-ui.tsx';

type View = 'upcoming' | 'pending' | 'all';

const STATUS_CLS: Record<Booking['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  confirmed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-destructive/15 text-destructive',
};

const dayLabel = (date: string, today: string) => {
  if (date === today) return 'Today';
  try {
    return format(parseISO(date), 'EEEE, d MMM yyyy');
  } catch {
    return date;
  }
};

export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[] | undefined>(undefined);
  const [view, setView] = useState<View>('upcoming');

  const load = useCallback(() => {
    listBookingsForAdmin().then(setBookings).catch((e: unknown) => {
      toast.error(errMsg(e, 'Could not load bookings'));
      setBookings((b) => b ?? []);
    });
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('bookings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, load)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load]);

  const change = async (b: Booking, status: Booking['status']) => {
    try {
      await setBookingStatus(b.id, status);
      toast.success(`${b.booking_no} ${status}`);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (!bookings) return <LoadingList count={4} />;

  const today = dubaiDayKey(new Date());
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const visible = bookings.filter((b) =>
    view === 'all' ? true : view === 'pending' ? b.status === 'pending' : b.booking_date >= today && b.status !== 'cancelled');

  const byDate = new Map<string, Booking[]>();
  for (const b of [...visible].sort((a, c) => (a.booking_date + a.slot).localeCompare(c.booking_date + c.slot))) {
    byDate.set(b.booking_date, [...(byDate.get(b.booking_date) ?? []), b]);
  }

  return (
    <div className="space-y-5">
      <Segmented<View>
        value={view}
        onChange={setView}
        options={[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'pending', label: 'Needs reply', count: pendingCount },
          { id: 'all', label: 'All' },
        ]}
      />

      {byDate.size === 0 ? (
        <EmptyBox icon={CalendarDays} title={view === 'pending' ? 'No bookings waiting' : 'No bookings here'} description="Table bookings from the website show up here live." />
      ) : (
        [...byDate.entries()].map(([date, list]) => {
          const guests = list.filter((b) => b.status !== 'cancelled').reduce((n, b) => n + b.guests, 0);
          return (
            <section key={date} className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className={cn('font-bold', date === today && 'text-primary')}>{dayLabel(date, today)}</h3>
                <span className="text-xs text-muted-foreground">{list.length} booking{list.length > 1 ? 's' : ''} · {guests} guests</span>
              </div>
              <div className="space-y-2">
                {list.map((b) => (
                  <div key={b.id} className={cn('flex flex-wrap items-center gap-3 rounded-[calc(var(--radius)+4px)] border bg-card p-3 text-card-foreground shadow-sm', b.status === 'pending' && 'border-amber-500/50')}>
                    <div className="flex w-16 shrink-0 flex-col items-center rounded-[var(--radius)] bg-primary/10 py-2 text-primary">
                      <span className="text-sm font-bold">{formatTime12(b.slot)}</span>
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold">{b.name} <span className="font-normal text-muted-foreground">· {b.booking_no}</span></p>
                      <p className="flex flex-wrap items-center gap-x-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{b.guests} guests</span>
                        <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 hover:text-foreground"><Phone className="size-3.5" />{b.phone}</a>
                      </p>
                      {b.notes && <p className="mt-1 text-muted-foreground">{b.notes}</p>}
                    </div>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', STATUS_CLS[b.status])}>{b.status}</span>
                    <div className="flex w-full gap-2 sm:w-auto">
                      {b.status === 'pending' && <Button size="sm" className="flex-1 sm:flex-none" onClick={() => void change(b, 'confirmed')}>Confirm</Button>}
                      {b.status !== 'cancelled' && <Button size="sm" variant="ghost" className="flex-1 text-destructive hover:text-destructive sm:flex-none" onClick={() => void change(b, 'cancelled')}>Cancel</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
