import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import MenuItemCard from "@/components/menu-item-card.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useSettings } from "@/components/providers/settings.tsx";
import { cn } from "@/lib/utils.ts";

export default function MenuPage({ orderMode = false }: { orderMode?: boolean }) {
  const { t, lang } = useLang();
  const s = useSettings();
  const categories = useQuery(api.menu.listCategories, {});
  const items = useQuery(api.menu.listItems, {});
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const sections = useMemo(() => {
    if (!categories || !items) return undefined;
    const term = q.trim().toLowerCase();
    return categories
      .filter((c) => c.active)
      .map((c) => ({
        cat: c,
        items: items.filter(
          (i) => i.categoryId === c._id && (!term || i.nameEn.toLowerCase().includes(term) || (i.nameAr ?? "").includes(term)),
        ),
      }))
      .filter((x) => x.items.length > 0);
  }, [categories, items, q]);

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-3xl font-bold">{orderMode ? t("Order Online", "اطلب الآن") : t("Our Menu", "قائمتنا")}</h1>
      {orderMode && <p className="mt-1 text-sm text-muted-foreground">{t("Add dishes to your cart, then choose delivery or pickup at checkout.", "أضف الأطباق إلى السلة ثم اختر التوصيل أو الاستلام عند الدفع.")}</p>}
      {orderMode && !s.flags.ordering && (
        <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">
          {t("Online ordering is currently closed. You can browse the menu.", "الطلب عبر الإنترنت مغلق حاليًا. يمكنك تصفح القائمة.")}
        </p>
      )}
      <div className="sticky top-[61px] z-30 -mx-4 mt-4 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search dishes", "ابحث عن طبق")} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections?.map(({ cat }) => (
            <button
              key={cat._id}
              onClick={() => jump(cat._id)}
              className={cn("shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-sm", active === cat._id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}
            >
              {lang === "ar" && cat.nameAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>
      </div>

      {sections === undefined ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : sections.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">{t("No dishes found.", "لا توجد أطباق.")}</p>
      ) : (
        sections.map(({ cat, items: list }) => {
          const withPhoto = list.filter((i) => i.imageUrl);
          const plain = list.filter((i) => !i.imageUrl);
          return (
            <section key={cat._id} id={`cat-${cat._id}`} className="scroll-mt-40 pt-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{lang === "ar" && cat.nameAr ? cat.nameAr : cat.nameEn}</h2>
                {cat.timeLabel && <Badge variant="secondary">{cat.timeLabel}</Badge>}
              </div>
              {withPhoto.length > 0 && (
                <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {withPhoto.map((i) => <MenuItemCard key={i._id} item={i} orderMode={orderMode} />)}
                </div>
              )}
              {plain.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {plain.map((i) => <MenuItemCard key={i._id} item={i} orderMode={orderMode} />)}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
