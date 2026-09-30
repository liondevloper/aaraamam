import { useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { MenuItem } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import type { Channel } from '@/components/providers/cart.tsx';
import { useCart } from '@/components/providers/cart.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { dishImage } from '@/lib/fallback-images.ts';
import { money } from '@/lib/format.ts';
import { getLook, type CardStyle } from '@/lib/theme-look.ts';
import { cn } from '@/lib/utils.ts';

type Parts = { name: string; description: string | null; image: string | null; available: boolean; variants: ReactNode; price: ReactNode; action: ReactNode };

// Each card style lays the same parts out differently
function CardBody({ style, p }: { style: CardStyle; p: Parts }) {
  const img = (cls: string) => p.image && <img src={p.image} alt={p.name} loading="lazy" className={cn('object-cover', !p.available && 'grayscale', cls)} />;

  if (style === 'row') {
    return (
      <div className="flex gap-3 rounded-[var(--radius)] border bg-card p-3">
        {img('size-24 shrink-0 rounded-[var(--radius)]')}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
          <p className="font-bold">{p.name}</p>
          {p.variants}
          <div className="flex items-center justify-between gap-2">{p.price}{p.action}</div>
        </div>
      </div>
    );
  }
  if (style === 'arch') {
    return (
      <div className="space-y-3 text-center">
        {img('mx-auto aspect-[3/4] w-full rounded-t-full')}
        <p className="text-xl font-semibold italic">{p.name}</p>
        {p.variants && <div className="flex justify-center">{p.variants}</div>}
        <div className="flex flex-col items-center gap-2">{p.price}{p.action}</div>
      </div>
    );
  }
  if (style === 'menu') {
    return (
      <div className="flex gap-4 border-b border-primary/20 py-4">
        {img('size-20 shrink-0 rounded-full border border-primary/40')}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline gap-2">
            <p className="text-lg uppercase tracking-wider">{p.name}</p>
            <span className="min-w-4 flex-1 border-b border-dotted border-primary/50" />
            {p.price}
          </div>
          {p.variants}
          <div className="flex justify-end">{p.action}</div>
        </div>
      </div>
    );
  }
  if (style === 'tile') {
    return (
      <div className="relative overflow-hidden rounded-[var(--radius)] bg-card shadow-sm">
        {img('aspect-square w-full')}
        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-sm font-bold text-primary backdrop-blur">{p.price}</span>
        <div className="space-y-2 p-3">
          <p className="font-semibold leading-tight">{p.name}</p>
          {p.variants}
          <div className="flex justify-end">{p.action}</div>
        </div>
      </div>
    );
  }
  return (
    <Card className="gap-0 overflow-hidden py-0">
      {img('aspect-[4/3] w-full')}
      <div className="space-y-2 p-4">
        <p className="font-semibold">{p.name}</p>
        {p.variants}
        <div className="flex items-center justify-between gap-2">{p.price}{p.action}</div>
      </div>
    </Card>
  );
}

/** `channel` set = ordering enabled for that menu (delivery or dine-in). */
export default function MenuItemCard({ item, channel }: { item: MenuItem; channel?: Channel }) {
  const { t, lang } = useLang();
  const s = useSettings();
  const cart = useCart();
  const variants = item.variants ?? [];
  const [variant, setVariant] = useState(variants[0]?.label);
  const name = lang === 'ar' && item.name_ar ? item.name_ar : item.name_en;
  const price = variants.length > 0 ? variants.find((v) => v.label === variant)?.price : (item.price ?? undefined);
  const orderMode = channel !== undefined;
  const canAdd = orderMode && s.flags.ordering && item.available && !item.on_request && price !== undefined;
  const look = getLook(s.theme);
  const dineOnly = !orderMode && item.channels?.length === 1 && item.channels[0] === 'dine_in';

  const add = () => {
    if (price === undefined || !channel) return;
    const switching = cart.channel !== channel && cart.lines.length > 0;
    cart.add({ slug: item.slug, name: item.name_en, variantLabel: variants.length > 0 ? variant : undefined, price }, channel);
    toast.success(switching ? t('New cart started for this menu', 'بدأت سلة جديدة لهذه القائمة') : `${name} ${t('added', 'أضيف')}`);
  };

  const variantChips = variants.length > 0 && (
    <div className="flex gap-1">
      {variants.map((v) => (
        <button key={v.label} onClick={() => setVariant(v.label)} className={cn('cursor-pointer rounded-full border px-2 py-0.5 text-xs', variant === v.label ? 'border-primary bg-primary text-primary-foreground' : 'bg-background')}>
          {v.label === 'Half' ? t('Half', 'نصف') : v.label === 'Full' ? t('Full', 'كامل') : v.label}
        </button>
      ))}
    </div>
  );

  const priceText = (
    <span className="font-semibold text-primary">
      {item.on_request ? t('Price on request', 'السعر عند الطلب') : price !== undefined ? money(price) : ''}
    </span>
  );

  const action = !item.available && orderMode ? (
    <span className="text-xs font-medium text-destructive">{t('Sold out', 'نفدت الكمية')}</span>
  ) : canAdd ? (
    <Button size="sm" onClick={add} className="h-8 gap-1"><Plus className="size-4" />{t('Add', 'أضف')}</Button>
  ) : dineOnly ? (
    <span className="text-xs text-muted-foreground">{t('Dine-in only', 'داخل المطعم فقط')}</span>
  ) : null;

  // Dishes without an uploaded photo get a matching default one, so no card looks empty
  const parts: Parts = { name, description: item.description_en, image: dishImage(item), available: item.available, variants: variantChips, price: priceText, action };

  return <CardBody style={look.card} p={parts} />;
}
