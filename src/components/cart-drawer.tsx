import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet.tsx";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { useCart } from "@/components/providers/cart.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useStoreStatus } from "@/hooks/use-store-status.ts";
import { money } from "@/lib/format.ts";

export default function CartDrawer() {
  const { lines, count, subtotal, setQty, channel } = useCart();
  const { t } = useLang();
  const { canOrder, headline, detail } = useStoreStatus();
  const [open, setOpen] = useState(false);
  const dine = channel === "dine_in";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="relative gap-2" aria-label="Cart">
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">{t("Cart", "السلة")}</span>
          {count > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{count}</span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{dine ? t("Table order", "طلب الطاولة") : t("Home order", "طلب المنزل")}</SheetTitle>
        </SheetHeader>
        {lines.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><ShoppingBag /></EmptyMedia>
              <EmptyTitle>{t("Your cart is empty", "السلة فارغة")}</EmptyTitle>
              <EmptyDescription>{t("Add dishes from the Home Delivery or Table Order menu.", "أضف أطباقًا من قائمة التوصيل أو الطاولة.")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-auto px-4">
              {lines.map((l) => (
                <div key={l.key} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.variantLabel ? `${l.variantLabel} · ` : ""}{money(l.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="secondary" className="size-7" onClick={() => setQty(l.key, l.qty - 1)}>
                      {l.qty === 1 ? <Trash2 className="size-3" /> : <Minus className="size-3" />}
                    </Button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <Button size="icon" variant="secondary" className="size-7" onClick={() => setQty(l.key, l.qty + 1)}>
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t p-4">
              <div className="flex justify-between font-semibold">
                <span>{t("Subtotal", "المجموع الفرعي")}</span>
                <span>{money(subtotal)}</span>
              </div>
              {canOrder ? (
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link to="/checkout">{dine ? t("Send to kitchen", "أرسل للمطبخ") : t("Checkout", "إتمام الطلب")}</Link>
                </Button>
              ) : (
                <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm">
                  <p className="font-semibold text-destructive">{headline}</p>
                  {detail && <p className="text-muted-foreground">{detail}</p>}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
