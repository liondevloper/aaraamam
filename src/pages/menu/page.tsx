import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Truck, UtensilsCrossed } from 'lucide-react';
import type { Category, MenuItem } from '@/lib/db.ts';
import { listCategories, listItems } from '@/lib/db.ts';
import { Input } from '@/components/ui/input.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import MenuItemCard from '@/components/menu-item-card.tsx';
import SectionTitle from '@/components/section-title.tsx';
import type { Channel } from '@/components/providers/cart.tsx';
import { useCart } from '@/components/providers/cart.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { getLook } from '@/lib/theme-look.ts';
import { cn } from '@/lib/utils.ts';

/** channel undefined = browse-only full menu. "delivery" = home order menu. "dine_in" = table order menu. */
export default function MenuPage({ channel }: { channel?: Channel }) {
  const { t, lang } = useLang();
  const s = useSettings();
  const look = getLook(s.theme);
  const cart = useCart();
  const [sp] = useSearchParams();
  const [categories, setCategories] = useState<Category[] | undefined>(undefined);
  const [items, setItems] = useState<MenuItem[] | undefined>(undefined);
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    listCategories().then(setCategories).catch(console.error);
    listItems().then(setItems).catch(console.error);
  }, []);

  // QR code on the table opens /table?t=5, booking confirmation opens /table?b=BK-...
  const qTable = sp.get('t');
  const qBooking = sp.get('b');
  const { setTable } = cart;
  useEffect(() => {
    if (channel !== 'dine_in') return;
    if (qTable) setTable({ tableNo: qTable });
    if (qBooking) setTable({ bookingNo: qBooking });
  }, [channel, qTable, qBooking, setTable]);

  const sections = useMemo(() => {
    if (!categories || !items) return undefined;
    const term = q.trim().toLowerCase();
    return categories
      .filter((c) => c.active)
      .map((c) => ({
        cat: c,
        items: items.filter(
          (i) =>
            i.category_id === c.id &&
            (!channel || (i.channels ?? ['dine_in', 'delivery']).includes(channel)) &&
            (!term || i.name_en.toLowerCase().includes(term) || (i.name_ar ?? '').includes(term)),
        ),
      }))
      .filter((x) => x.items.length > 0);
  }, [categories, items, q, channel]);

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const title = channel === 'dine_in' ? t('Order at Your Table', 'اطلب على طاولتك') : channel === 'delivery' ? t('Home Delivery & Pickup', 'توصيل واستلام') : t('Our Menu', 'قائمتنا');
  const hint = channel === 'dine_in'
    ? t('Dine-in menu. Add dishes and send the order straight to the kitchen.', 'قائمة داخل المطعم. أضف الأطباق وأرسل الطلب للمطبخ مباشرة.')
    : channel === 'delivery'
      ? t('Delivery menu. Add dishes, then choose delivery or pickup at checkout.', 'قائمة التوصيل. أضف الأطباق ثم اختر التوصيل أو الاستلام.')
      : null;
  const Icon = channel === 'dine_in' ? UtensilsCrossed : Truck;
  const centered = look.head.includes('text-center');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className={cn('flex items-center gap-3', centered && 'justify-center')}>
        {channel && <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon className="size-5" /></span>}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      {hint && <p className={cn('mt-1 text-sm text-muted-foreground', look.head)}>{hint}</p>}
      {channel === 'dine_in' && (cart.table.tableNo || cart.table.bookingNo) && (
        <div className={cn('mt-3 flex flex-wrap gap-2', centered && 'justify-center')}>
          {cart.table.tableNo && <Badge>{t('Table', 'طاولة')} {cart.table.tableNo}</Badge>}
          {cart.table.bookingNo && <Badge variant="secondary">{t('Booking', 'حجز')} {cart.table.bookingNo}</Badge>}
        </div>
      )}
      {channel && !s.flags.ordering && (
        <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">{t('Online ordering is currently closed. You can browse the menu.', 'الطلب عبر الإنترنت مغلق حاليًا. يمكنك تصفح القائمة.')}</p>
      )}
      <div className={cn('sticky z-30 -mx-4 mt-4 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur', look.stickyTop)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search dishes', 'ابحث عن طبق')} className="pl-9" />
        </div>
        <div className={cn('flex gap-2 overflow-x-auto pb-1', centered && 'sm:justify-center')}>
          {sections?.map(({ cat }) => (
            <button key={cat.id} onClick={() => jump(cat.id)} className={cn('shrink-0 cursor-pointer', look.chip, active === cat.id && look.chipActive)}>
              {lang === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>
      </div>

      {sections === undefined ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : sections.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">{t('No dishes found.', 'لا توجد أطباق.')}</p>
      ) : (
        sections.map(({ cat, items: list }) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-40 pt-8">
            <div className={cn('mb-4 flex flex-wrap items-center gap-3', centered && 'justify-center')}>
              <SectionTitle className={centered ? 'w-full' : undefined}>{lang === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en}</SectionTitle>
              {cat.time_label && <Badge variant="secondary">{cat.time_label}</Badge>}
            </div>
            <div className={look.grid}>
              {[...list.filter((i) => i.image_url), ...list.filter((i) => !i.image_url)].map((i) => <MenuItemCard key={i.id} item={i} channel={channel} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
