import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useCart } from "@/components/providers/cart.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useSettings } from "@/components/providers/settings.tsx";
import { money } from "@/lib/format.ts";
import { getTheme } from "@/lib/themes.ts";
import { cn } from "@/lib/utils.ts";

export default function MenuItemCard({ item, orderMode = false }: { item: Doc<"menuItems">; orderMode?: boolean }) {
  const { t, lang } = useLang();
  const s = useSettings();
  const cart = useCart();
  const variants = item.variants ?? [];
  const [variant, setVariant] = useState(variants[0]?.label);
  const name = lang === "ar" && item.nameAr ? item.nameAr : item.nameEn;
  const price = variants.length > 0 ? variants.find((v) => v.label === variant)?.price : item.price;
  const canAdd = orderMode && s.flags.ordering && item.available && !item.onRequest && price !== undefined;
  const card = getTheme(s.theme).card;

  const add = () => {
    if (price === undefined) return;
    cart.add({ slug: item.slug, name: item.nameEn, variantLabel: variants.length > 0 ? variant : undefined, price });
    toast.success(`${name} ${t("added", "أضيف")}`);
  };

  const priceBlock = (
    <>
      {variants.length > 0 && (
        <div className="flex gap-1">
          {variants.map((v) => (
            <button
              key={v.label}
              onClick={() => setVariant(v.label)}
              className={cn("cursor-pointer rounded-full border px-2 py-0.5 text-xs", variant === v.label ? "border-primary bg-primary text-primary-foreground" : "bg-background")}
            >
              {v.label === "Half" ? t("Half", "نصف") : v.label === "Full" ? t("Full", "كامل") : v.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-primary">
          {item.onRequest ? t("Price on request", "السعر عند الطلب") : price !== undefined ? money(price) : ""}
        </span>
        {!item.available && orderMode ? (
          <span className="text-xs font-medium text-destructive">{t("Sold out", "نفدت الكمية")}</span>
        ) : canAdd ? (
          <Button size="sm" onClick={add} className="h-8 gap-1">
            <Plus className="size-4" />
            {t("Add", "أضف")}
          </Button>
        ) : null}
      </div>
    </>
  );

  if (item.imageUrl) {
    return (
      <Card className={cn("gap-0 overflow-hidden py-0", card === "outlined" && "border-2", card === "flat" && "border-0")}>
        <img src={item.imageUrl} alt={name} loading="lazy" className={cn("aspect-[4/3] w-full object-cover", !item.available && "grayscale")} />
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
