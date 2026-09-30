import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { placeOrder, quotePromo } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import MapView from '@/components/map-view.tsx';
import { useCart } from '@/components/providers/cart.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { money, reverseGeocode } from '@/lib/format.ts';
import { haversineKm } from '@/lib/geo.ts';
import { cn } from '@/lib/utils.ts';

type HomeType = 'delivery' | 'pickup';

function errorText(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') return e.message;
  return fallback;
}

export default function CheckoutPage() {
  const { t, lang } = useLang();
  const s = useSettings();
  const cart = useCart();
  const navigate = useNavigate();
  const d = s.delivery;
  const dineIn = cart.channel === 'dine_in';

  const [homeType, setHomeType] = useState<HomeType>(s.flags.delivery ? 'delivery' : 'pickup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [notes, setNotes] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; message?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const type = dineIn ? 'dine_in' : homeType;
  const isDelivery = type === 'delivery';

  const applyPromo = async () => {
    const result = await quotePromo(promoInput.trim().toUpperCase(), cart.subtotal);
    setPromoResult(result);
  };

  const discount = promoResult?.valid ? promoResult.discount : 0;
  const fee = isDelivery ? d.fee : 0;
  const total = Math.round((cart.subtotal - discount + fee) * 100) / 100;
  const vat = Math.round(((total * s.vat_percent) / (100 + s.vat_percent)) * 100) / 100;
  const outside = isDelivery && pin ? haversineKm(d.lat, d.lng, pin[0], pin[1]) > d.radiusKm : false;
  const belowMin = isDelivery && cart.subtotal < d.minOrder;
  const tableMissing = dineIn && !cart.table.tableNo.trim() && !cart.table.bookingNo.trim();

  const movePin = async (lat: number, lng: number) => {
    setPin([lat, lng]);
    if (!s.flags.autofill) return;
    const text = await reverseGeocode(lat, lng);
    if (text) setAddress(text);
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) return toast.error(t('Location is not available on this device', 'الموقع غير متاح'));
    navigator.geolocation.getCurrentPosition(
      (p) => void movePin(p.coords.latitude, p.coords.longitude),
      () => toast.error(t('Location permission denied. Place the pin on the map instead.', 'تم رفض إذن الموقع. حرّك الدبوس على الخريطة.')),
    );
  };

  const submit = async () => {
    if (!dineIn && !phone.trim()) return toast.error(t('Phone number is required', 'رقم الهاتف مطلوب'));
    if (tableMissing) return toast.error(t('Enter your table number', 'أدخل رقم الطاولة'));
    setBusy(true);
    try {
      const res = await placeOrder({
        orderType: type,
        items: cart.lines.map((l) => ({ slug: l.slug, variantLabel: l.variantLabel, qty: l.qty })),
        customerName: name || undefined,
        customerPhone: phone || undefined,
        addressText: isDelivery ? address : undefined,
        addressExtra: isDelivery ? extra : undefined,
        lat: isDelivery ? pin?.[0] : undefined,
        lng: isDelivery ? pin?.[1] : undefined,
        promoCode: promoResult?.valid ? promoInput.trim().toUpperCase() : undefined,
        notes: notes || undefined,
        tableNo: dineIn ? cart.table.tableNo || undefined : undefined,
        bookingNo: dineIn ? cart.table.bookingNo || undefined : undefined,
      });
      cart.clear();
      navigate(`/track/${res.orderNo}?t=${res.trackingToken}`);
    } catch (e) {
      toast.error(errorText(e, t('Could not place order', 'تعذر إرسال الطلب')));
    } finally {
      setBusy(false);
    }
  };

  if (!s.flags.ordering) {
    return <p className="mx-auto max-w-xl p-10 text-center">{t('Online ordering is currently closed.', 'الطلب عبر الإنترنت مغلق حاليًا.')}</p>;
  }
  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-10 text-center">
        <p>{t('Your cart is empty.', 'السلة فارغة.')}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => navigate('/order')}>{t('Order for home', 'اطلب للمنزل')}</Button>
          <Button variant="secondary" onClick={() => navigate('/table')}>{t('Order at table', 'اطلب على الطاولة')}</Button>
        </div>
      </div>
    );
  }

  const fields = Object.entries(s.address_fields).filter(([, f]) => f.on);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{dineIn ? t('Send order to kitchen', 'أرسل الطلب للمطبخ') : t('Checkout', 'إتمام الطلب')}</h1>

        {dineIn ? (
          <div className="space-y-4 rounded-lg border bg-card p-4">
            <p className="flex items-center gap-2 font-medium"><UtensilsCrossed className="size-4 text-primary" />{t('Dine-in order', 'طلب داخل المطعم')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{t('Table number', 'رقم الطاولة')}</Label><Input value={cart.table.tableNo} onChange={(e) => cart.setTable({ tableNo: e.target.value })} placeholder="5" inputMode="numeric" /></div>
              <div className="space-y-2"><Label>{t('Booking number (optional)', 'رقم الحجز (اختياري)')}</Label><Input value={cart.table.bookingNo} onChange={(e) => cart.setTable({ bookingNo: e.target.value.toUpperCase() })} placeholder="BK-..." /></div>
            </div>
            <p className="text-xs text-muted-foreground">{t('Pay at the table after your meal.', 'ادفع على الطاولة بعد الوجبة.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {(['delivery', 'pickup'] as const).filter((k) => s.flags[k]).map((k) => (
              <button key={k} onClick={() => setHomeType(k)} className={cn('cursor-pointer rounded-lg border p-3 font-medium', homeType === k ? 'border-primary bg-primary text-primary-foreground' : 'bg-card')}>
                {k === 'delivery' ? t('Delivery', 'توصيل') : t('Pickup', 'استلام')}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>{t('Name', 'الاسم')}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" /></div>
          <div className="space-y-2"><Label>{t('Phone', 'الهاتف')}{!dineIn && ' *'}</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 123 4567" inputMode="tel" /></div>
        </div>

        {isDelivery && (
          <div className="space-y-4">
            {s.flags.mapPin && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('Drop the pin at your location', 'ضع الدبوس على موقعك')}</Label>
                  <Button size="sm" variant="secondary" onClick={useMyLocation}><LocateFixed className="size-4" />{t('Use my location', 'استخدم موقعي')}</Button>
                </div>
                <MapView center={[d.lat, d.lng]} zoom={14} pin={pin} onPinChange={(la, ln) => void movePin(la, ln)} className="h-72 w-full rounded-lg" />
              </div>
            )}
            <div className="space-y-2"><Label>{t('Address', 'العنوان')}</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(([key, f]) => (
                <div key={key} className="space-y-2">
                  <Label>{lang === 'ar' ? f.labelAr : f.labelEn}{f.required && ' *'}</Label>
                  <Input value={extra[key] ?? ''} onChange={(e) => setExtra({ ...extra, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            {outside && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{t(`Sorry, this location is outside our ${d.radiusKm} km delivery area.`, `عذرًا، هذا الموقع خارج منطقة التوصيل (${d.radiusKm} كم).`)}</p>}
          </div>
        )}

        <div className="space-y-2"><Label>{t('Order notes', 'ملاحظات الطلب')}</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        {!dineIn && <div className="rounded-lg border bg-card p-4 text-sm font-medium">{t('Payment: Cash on Delivery', 'الدفع: نقدًا عند الاستلام')}</div>}
      </div>

      <aside className="h-fit space-y-4 rounded-[var(--radius)] border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">{t('Summary', 'الملخص')}</h2>
        {cart.lines.map((l) => (
          <div key={l.key} className="flex justify-between gap-2 text-sm"><span>{l.qty} × {l.name}{l.variantLabel ? ` (${l.variantLabel})` : ''}</span><span>{money(l.price * l.qty)}</span></div>
        ))}
        <div className="flex gap-2">
          <Input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder={t('Promo code', 'كود الخصم')} />
          <Button variant="secondary" onClick={() => void applyPromo()}>{t('Apply', 'تطبيق')}</Button>
        </div>
        {promoResult && !promoResult.valid && <p className="text-sm text-destructive">{promoResult.message}</p>}
        <div className="space-y-1 border-t pt-3 text-sm">
          <Row label={t('Subtotal', 'المجموع الفرعي')} value={money(cart.subtotal)} />
          {discount > 0 && <Row label={t('Discount', 'الخصم')} value={`- ${money(discount)}`} />}
          {isDelivery && <Row label={t('Delivery fee', 'رسوم التوصيل')} value={money(fee)} />}
          <Row label={t(`VAT ${s.vat_percent}% (included)`, `ضريبة ${s.vat_percent}% (شاملة)`)} value={money(vat)} muted />
          <div className="flex justify-between pt-2 text-base font-bold"><span>{t('Total', 'الإجمالي')}</span><span>{money(total)}</span></div>
        </div>
        {belowMin && <p className="text-sm text-destructive">{t(`Minimum delivery order is ${money(d.minOrder)}`, `الحد الأدنى للتوصيل ${money(d.minOrder)}`)}</p>}
        <Button className="w-full" size="lg" disabled={busy || outside || belowMin || tableMissing || (isDelivery && (!address.trim() || (s.flags.mapPin && !pin)))} onClick={() => void submit()}>
          {busy && <Spinner />}{dineIn ? t('Send to kitchen', 'أرسل للمطبخ') : t('Place order', 'أرسل الطلب')}
        </Button>
        {isDelivery && s.flags.mapPin && !pin && <p className="text-xs text-muted-foreground">{t('Place the pin on the map to continue.', 'ضع الدبوس على الخريطة للمتابعة.')}</p>}
      </aside>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className={cn('flex justify-between', muted && 'text-muted-foreground')}><span>{label}</span><span>{value}</span></div>;
}
