import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, CalendarDays, Clock, MapPin, UtensilsCrossed } from 'lucide-react';
import { motion } from 'motion/react';
import type { Category, MenuItem } from '@/lib/db.ts';
import { listCategories, listItems } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import MenuItemCard from '@/components/menu-item-card.tsx';
import SectionTitle from '@/components/section-title.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { getTheme } from '@/lib/themes.ts';
import { getLook } from '@/lib/theme-look.ts';
import { inWindow } from '@/lib/format.ts';
import { cn } from '@/lib/utils.ts';

export default function Home() {
  const { t, lang } = useLang();
  const s = useSettings();
  const c = s.content;
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const layout = getTheme(s.theme).hero;
  const look = getLook(s.theme);
  const centered = look.head.includes('text-center');
  const luxe = s.theme === 'theme-4';
  const tile = s.theme === 'theme-5';

  useEffect(() => {
    listCategories().then(setCats).catch(console.error);
    listItems().then(setItems).catch(console.error);
  }, []);

  const serving = cats.filter((x) => x.active && x.available_from && inWindow(x.available_from, x.available_to ?? undefined));
  const popular = items.filter((i) => i.popular && i.available).slice(0, 6);
  const banner = lang === 'ar' && c.offerBannerAr ? c.offerBannerAr : c.offerBannerEn;

  const title = t(c.heroTitleEn, c.heroTitleAr);
  const subtitle = t(c.heroSubtitleEn, c.heroSubtitleAr);
  const buttons = (
    <div className={cn('flex flex-wrap gap-3', (layout === 'centered' || luxe) && 'justify-center')}>
      {s.flags.ordering && (
        <>
          <Button asChild size="lg"><Link to="/order"><Bike className="size-4" />{t('Order', 'اطلب')}</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link to="/table"><UtensilsCrossed className="size-4" />{t('Order at Table', 'اطلب على الطاولة')}</Link></Button>
        </>
      )}
      {s.flags.booking && (
        <Button asChild size="lg" variant="secondary"><Link to="/book"><CalendarDays className="size-4" />{t('Book a Table', 'احجز طاولة')}</Link></Button>
      )}
    </div>
  );

  return (
    <div>
      {/* Theme 1: full-bleed photo, left text. Theme 4: same photo but centered inside a gold frame. */}
      {layout === 'full' && (
        <section className="relative flex min-h-[70vh] items-center">
          <img src={c.heroImage} alt="" className="absolute inset-0 size-full object-cover" />
          <div className={cn('absolute inset-0', luxe ? 'bg-black/65' : 'bg-black/55')} />
          {luxe && <div className="absolute inset-4 border border-primary/60 sm:inset-8" />}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className={cn('relative mx-auto w-full max-w-6xl space-y-5 px-8 text-white', luxe && 'text-center')}>
            {luxe && <p className="text-xs uppercase tracking-[0.5em] text-primary">Est. Karama · Dubai</p>}
            <h1 className={cn('text-balance text-4xl font-bold sm:text-6xl', luxe ? 'mx-auto max-w-3xl font-medium uppercase tracking-wider' : 'max-w-2xl')}>{title}</h1>
            <p className={cn('text-lg text-white/85', luxe ? 'mx-auto max-w-xl' : 'max-w-xl')}>{subtitle}</p>
            {buttons}
          </motion.div>
        </section>
      )}
      {/* Theme 2: bold app-style split. Theme 5: soft rounded card on a tinted panel. */}
      {layout === 'split' && (
        <section className={cn('mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2', tile && 'my-6 rounded-[calc(var(--radius)+8px)] bg-secondary py-10 md:px-10')}>
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="space-y-5">
            {!tile && <span className="inline-block bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">{t('Now open', 'مفتوح الآن')}</span>}
            <h1 className={cn('text-balance text-4xl sm:text-5xl', tile ? 'font-semibold' : 'font-extrabold uppercase')}>{title}</h1>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
            {buttons}
          </motion.div>
          <img src={c.heroImage} alt="" className={cn('aspect-[4/3] w-full object-cover', tile ? 'rounded-[var(--radius)] shadow-xl' : 'rounded-sm border-4 border-primary')} />
        </section>
      )}
      {/* Theme 3: magazine cover, centered headline over an arched photo */}
      {layout === 'centered' && (
        <section className="mx-auto max-w-4xl space-y-6 px-4 py-12 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t('The kitchen of Kerala', 'مطبخ كيرالا')}</p>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="text-balance text-4xl font-semibold italic sm:text-6xl">{title}</motion.h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">{subtitle}</p>
          {buttons}
          <img src={c.heroImage} alt="" className="aspect-[16/9] w-full rounded-t-[999px] object-cover" />
        </section>
      )}

      {banner && (
        <div className={cn('px-4 py-3 text-center font-medium', luxe ? 'border-y border-primary/40 bg-background uppercase tracking-[0.3em] text-primary' : 'bg-accent text-accent-foreground')}>{banner}</div>
      )}

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        {serving.length > 0 && (
          <section>
            <SectionTitle className="mb-4">{t('Serving now', 'متوفر الآن')}</SectionTitle>
            <div className={cn('flex flex-wrap gap-2', centered && 'justify-center')}>
              {serving.map((cat) => (
                <Link key={cat.id} to="/menu" className={cn('px-4 py-2 text-sm', look.chip)}>
                  <span className="font-medium">{lang === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en}</span>
                  {cat.time_label && <span className="ml-2 text-muted-foreground">{cat.time_label}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {popular.length > 0 && (
          <section>
            <SectionTitle className="mb-6">{t('Popular dishes', 'أطباق مشهورة')}</SectionTitle>
            <div className={look.grid}>
              {popular.map((i) => <MenuItemCard key={i.id} item={i} />)}
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className={look.info}>
            <Clock className="mt-1 size-5 text-primary" />
            <div>
              <h3 className="font-semibold">{t('Opening hours', 'ساعات العمل')}</h3>
              <p className="text-sm text-muted-foreground">{c.openingHours || t('Please contact us for hours.', 'يرجى الاتصال بنا لمعرفة الأوقات.')}</p>
            </div>
          </div>
          <div className={look.info}>
            <MapPin className="mt-1 size-5 text-primary" />
            <div>
              <h3 className="font-semibold">{t('Location', 'الموقع')}</h3>
              <p className="text-sm text-muted-foreground">{c.address || t('Karama, Dubai', 'الكرامة، دبي')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
