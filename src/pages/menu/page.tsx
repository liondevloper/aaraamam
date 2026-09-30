import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Category, MenuItem } from '@/lib/db.ts';
import { listCategories, listItems } from '@/lib/db.ts';
import { Input } from '@/components/ui/input.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import MenuItemCard from '@/components/menu-item-card.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { cn } from '@/lib/utils.ts';

export default function MenuPage({ orderMode = false }: { orderMode?: boolean }) {
  const { t, lang } = useLang();
  const s = useSettings();
  const [categories, setCategories] = useState<Category[] | undefined>(undefined);
  const [items, setItems] = useState<MenuItem[] | undefined>(undefined);
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    listCategories().then(setCategories).catch(console.error);
    listItems().then(setItems).catch(console.error);
  }, []);

  const sections = useMemo(() => {
    if (!categories || !items) return undefined;
    const term = q.trim().toLowerCase();
    return categories
      .filter((c) => c.active)
      .map((c) => ({
        cat: c,
        items: items.filter(
          (i) => i.category_id === c.id && (!term || i.name_en.toLowerCase().includes(term) || (i.name_ar ?? '').includes(term)),
        ),
      }))
      .filter((x) => x.items.length > 0);
  }, [categories, items, q]);

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-3xl font-bold">{orderMode ? t('Order Online', 'اطلب الآن') : t('Our Menu', 'قائمتنا')}</h1>
      {orderMode && <p className="mt-1 text-sm text-muted-foreground">{t('Add dishes to your cart, then choose delivery or pickup at checkout.', 'أضف الأطباق إلى السلة ثم اختر التوصيل أو الاستلام عند الدفع.')}</p>}
      {orderMode && !s.flags.ordering && (
        <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">{t('Online ordering is currently closed. You can browse the menu.', 'الطلب عبر الإنترنت مغلق حاليًا. يمكنك تصفح القائمة.')}</p>
      )}
      <div className="sticky top-[61px] z-30 -mx-4 mt-4 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search dishes', 'ابحث عن طبق')} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections?.map(({ cat }) => (
            <button key={cat.id} onClick={() => jump(cat.id)} className={cn('shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-sm', active === cat.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary')}>
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
        sections.map(({ cat, items: list }) => {
          const withPhoto = list.filter((i) => i.image_url);
          const plain = list.filter((i) => !i.image_url);
          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-40 pt-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{lang === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en}</h2>
                {cat.time_label && <Badge variant="secondary">{cat.time_label}</Badge>}
              </div>
              {withPhoto.length > 0 && (
                <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {withPhoto.map((i) => <MenuItemCard key={i.id} item={i} orderMode={orderMode} />)}
                </div>
              )}
              {plain.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {plain.map((i) => <MenuItemCard key={i.id} item={i} orderMode={orderMode} />)}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
