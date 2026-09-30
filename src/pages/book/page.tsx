import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { createBooking, getBookingSlots } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import PageHeading from '@/components/page-heading.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { formatTime12 } from '@/lib/format.ts';
import { getLook } from '@/lib/theme-look.ts';
import { cn } from '@/lib/utils.ts';

export default function BookPage() {
  const { t } = useLang();
  const s = useSettings();
  const look = getLook(s.theme);
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState<{ slot: string; remaining: number }[] | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState('');
  const [loading, setLoading] = useState(false);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (s.booking_config.maxDaysAhead || 30));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectDate = async (d: Date | undefined) => {
    setDate(d);
    setSlot('');
    setSlots(null);
    if (!d) return;
    const result = await getBookingSlots(format(d, 'yyyy-MM-dd'), s.booking_config);
    // Hide times that already passed today
    const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    setSlots(isToday ? result.filter((x) => { const [h, m] = x.slot.split(':').map(Number); return h * 60 + m > nowMin; }) : result);
  };

  if (!s.flags.booking) return <p className="p-10 text-center">{t('Table booking is currently unavailable.', 'حجز الطاولات غير متاح حاليًا.')}</p>;
  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-10 text-center">
        <PageHeading>{t('Booking received', 'تم استلام الحجز')}</PageHeading>
        <p className="text-4xl font-bold text-primary">{done}</p>
        <p className="text-muted-foreground">{t('We will confirm your table shortly. Save this booking number.', 'سنؤكد طاولتك قريبًا. احتفظ برقم الحجز.')}</p>
        {s.flags.ordering && (
          <div className={cn('space-y-2', look.panel)}>
            <p className="text-sm">{t('Want your food ready when you arrive? Pre-order from the dine-in menu.', 'تريد طعامك جاهزًا عند وصولك؟ اطلب مسبقًا من قائمة المطعم.')}</p>
            <Button asChild className="w-full"><Link to={`/table?b=${encodeURIComponent(done)}`}><UtensilsCrossed className="size-4" />{t('Pre-order for my table', 'اطلب مسبقًا لطاولتي')}</Link></Button>
          </div>
        )}
      </div>
    );
  }

  const submit = async () => {
    setLoading(true);
    try {
      const r = await createBooking({ name, phone, date: date ? format(date, 'yyyy-MM-dd') : '', slot, guests, notes: notes || undefined, config: s.booking_config });
      setDone(r.bookingNo);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e && typeof e.message === 'string' ? e.message : t('Booking failed', 'فشل الحجز');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className="space-y-4">
        <PageHeading className="mb-2">{t('Book a Table', 'احجز طاولة')}</PageHeading>
        <Calendar mode="single" selected={date} onSelect={(d) => void selectDate(d)} disabled={[{ before: today }, { after: maxDate }]} className={cn('bg-card', look.panel)} />
      </div>
      <div className={cn('space-y-4 md:mt-14', look.panel)}>
        <div className="space-y-2"><Label>{t('Guests', 'عدد الضيوف')}</Label><Input type="number" min={1} max={50} value={guests} onChange={(e) => setGuests(Number(e.target.value))} /></div>
        <div className="space-y-2">
          <Label>{t('Available times', 'الأوقات المتاحة')}</Label>
          {!date ? <p className="text-sm text-muted-foreground">{t('Pick a date first.', 'اختر التاريخ أولًا.')}</p>
            : slots === null ? <p className="text-sm">...</p>
            : slots.length === 0 ? <p className="text-sm text-muted-foreground">{t('No times available on this date.', 'لا توجد أوقات متاحة.')}</p>
            : <div className="flex flex-wrap gap-2">{slots.map((x) => (
                <button key={x.slot} disabled={x.remaining < guests} onClick={() => setSlot(x.slot)} className={cn('cursor-pointer disabled:cursor-not-allowed disabled:opacity-40', look.chip, slot === x.slot && look.chipActive)}>{formatTime12(x.slot)}</button>
              ))}</div>}
        </div>
        <div className="space-y-2"><Label>{t('Name', 'الاسم')}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" /></div>
        <div className="space-y-2"><Label>{t('Phone', 'الهاتف')}</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 123 4567" inputMode="tel" /></div>
        <div className="space-y-2"><Label>{t('Special request', 'طلب خاص')}</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        <Button className="w-full" size="lg" disabled={!slot || !name.trim() || !phone.trim() || guests < 1 || loading} onClick={() => void submit()}>{t('Book table', 'احجز')}</Button>
      </div>
    </div>
  );
}
