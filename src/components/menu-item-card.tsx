import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { MenuItem } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import type { Channel } from '@/components/providers/cart.tsx';
import { useCart } from '@/components/providers/cart.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { money } from '@/lib/format.ts';
import { getTheme } from '@/lib/themes.ts';
import { cn } from '@/lib/utils.ts';

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
  const card = getTheme(s.theme).card;
  const dineOnly = !orderMode && item.channels?.length === 1 && item.channels[0] === 'dine_in';

  const add = () => {
    if (price === undefined || !channel) return;
    const switching = cart.channel !== channel && cart.lines.length > 0;
    cart.add({ slug: item.slug, name: item.name_en, variantLabel: variants.length > 0 ? variant : undefined, price }, channel);
    toast.success(switching ? t('New cart started for this menu', 'بدأت سلة جديدة لهذه القائمة') : `${name} ${t('added', 'أضيف')}`);
  };

  const priceBlock = (
    <>
      {variants.length > 0 && (
        <div className="flex gap-1">
          {variants.map((v) => (
            <button key={v.label} onClick={() => setVariant(v.label)} className={cn('cursor-pointer rounded-full border px-2 py-0.5 text-xs', variant === v.label ? 'border-primary bg-primary text-primary-foreground' : 'bg-background')}>
              {v.label === 'Half' ? t('Half', 'نصف') : v.label === 'Full' ? t('Full', 'كامل') : v.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-primary">
          {item.on_request ? t('Price on request', 'السعر عند الطلب') : price !== undefined ? money(price) : ''}
        </span>
        {!item.available && orderMode ? (
          <span className="text-xs font-medium text-destructive">{t('Sold out', 'نفدت الكمية')}</span>
        ) : canAdd ? (
          <Button size="sm" onClick={add} className="h-8 gap-1"><Plus className="size-4" />{t('Add', 'أضف')}</Button>
        ) : dineOnly ? (
          <span className="text-xs text-muted-foreground">{t('Dine-in only', 'داخل المطعم فقط')}</span>
        ) : null}
      </div>
    </>
  );

  if (item.image_url) {
    return (
      <Card className={cn('gap-0 overflow-hidden py-0', card === 'outlined' && 'border-2', card === 'flat' && 'border-0')}>
        <img src={item.image_url} alt={name} loading="lazy" className={cn('aspect-[4/3] w-full object-cover', !item.available && 'grayscale')} />
        <div className="space-y-2 p-4">
          <p className="font-semibold">{name}</p>
          {priceBlock}
        </div>
      </Card>
    );
  }
  return (
    <div className="space-y-2 rounded-lg border bg-card p-3">
      <p className="font-medium">{name}</p>
      {priceBlock}
    </div>
  );
}
