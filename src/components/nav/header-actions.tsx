import { Link } from "react-router-dom";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import CartDrawer from "@/components/cart-drawer.tsx";
import Logo from "@/components/logo.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useSettings } from "@/components/providers/settings.tsx";
import { cn } from "@/lib/utils.ts";

export function Brand({ className, nameClassName }: { className?: string; nameClassName?: string }) {
  const s = useSettings();
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <Logo />
      <span className={cn("text-lg font-bold leading-tight", nameClassName)}>{s.restaurant_name}</span>
    </Link>
  );
}

// Language and cart buttons shared by every navigation style (the theme button floats separately)
export function HeaderActions() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
        <Languages className="size-4" />{lang === "en" ? "العربية" : "EN"}
      </Button>
      <CartDrawer />
    </div>
  );
}
