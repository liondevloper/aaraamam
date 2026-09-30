import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { CalendarDays, Clock, MapPin, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import MenuItemCard from "@/components/menu-item-card.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useSettings } from "@/components/providers/settings.tsx";
import { getTheme } from "@/lib/themes.ts";
import { inWindow } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

export default function Home() {
  const { t, lang } = useLang();
  const s = useSettings();
  const c = s.content;
  const cats = useQuery(api.menu.listCategories, {});
  const items = useQuery(api.menu.listItems, {});
  const layout = getTheme(s.theme).hero;

  const serving = cats?.filter((x) => x.active && x.availableFrom && inWindow(x.availableFrom, x.availableTo)) ?? [];
  const popular = items?.filter((i) => i.popular).slice(0, 6) ?? [];
  const banner = lang === "ar" && c.offerBannerAr ? c.offerBannerAr : c.offerBannerEn;

  const title = t(c.heroTitleEn, c.heroTitleAr);
  const subtitle = t(c.heroSubtitleEn, c.heroSubtitleAr);
  const buttons = (
    <div className={cn("flex flex-wrap gap-3", layout === "centered" && "justify-center")}>
      {s.flags.ordering && (
        <Button asChild size="lg"><Link to="/order"><ShoppingBag className="size-4" />{t("Order Online", "اطلب الآن")}</Link></Button>
      )}
      {s.flags.booking && (
        <Button asChild size="lg" variant="secondary"><Link to="/book"><CalendarDays className="size-4" />{t("Book a Table", "احجز طاولة")}</Link></Button>
      )}
    </div>
  );

  return (
    <div>
      {layout === "full" && (
        <section className="relative flex min-h-[70vh] items-center">
          <img src={c.heroImage} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative mx-auto w-full max-w-6xl space-y-5 px-4 text-white">
            <h1 className="max-w-2xl text-balance text-4xl font-bold sm:text-6xl">{title}</h1>
            <p className="max-w-xl text-lg text-white/85">{subtitle}</p>
            {buttons}
          </motion.div>
        </section>
      )}
      {layout === "split" && (
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="space-y-5">
            <h1 className="text-balance text-4xl font-bold sm:text-5xl">{title}</h1>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
            {buttons}
          </motion.div>
          <img src={c.heroImage} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
        </section>
      )}
      {layout === "centered" && (
        <section className="mx-auto max-w-4xl space-y-6 px-4 py-12 text-center">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="text-balance text-4xl font-bold sm:text-6xl">{title}</motion.h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">{subtitle}</p>
          {buttons}
          <img src={c.heroImage} alt="" className="aspect-[16/9] w-full rounded-[var(--radius)] object-cover" />
        </section>
      )}

      {banner && (
        <div className="bg-accent px-4 py-3 text-center font-medium text-accent-foreground">{banner}</div>
      )}

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        {serving.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">{t("Serving now", "متوفر الآن")}</h2>
            <div className="flex flex-wrap gap-2">
              {serving.map((cat) => (
                <Link key={cat._id} to="/menu" className="rounded-full border bg-card px-4 py-2 text-sm hover:bg-secondary">
                  <span className="font-medium">{lang === "ar" && cat.nameAr ? cat.nameAr : cat.nameEn}</span>
                  {cat.timeLabel && <span className="ml-2 text-muted-foreground">{cat.timeLabel}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {popular.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">{t("Popular dishes", "أطباق مشهورة")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((i) => <MenuItemCard key={i._id} item={i} />)}
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3 rounded-[var(--radius)] border bg-card p-5">
            <Clock className="mt-1 size-5 text-primary" />
            <div>
              <h3 className="font-semibold">{t("Opening hours", "ساعات العمل")}</h3>
              <p className="text-sm text-muted-foreground">{c.openingHours || t("Please contact us for hours.", "يرجى الاتصال بنا لمعرفة الأوقات.")}</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-[var(--radius)] border bg-card p-5">
            <MapPin className="mt-1 size-5 text-primary" />
            <div>
              <h3 className="font-semibold">{t("Location", "الموقع")}</h3>
              <p className="text-sm text-muted-foreground">{c.address || t("Karama, Dubai", "الكرامة، دبي")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
