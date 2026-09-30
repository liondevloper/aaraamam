import { BookOpen, CalendarDays, ConciergeBell, Home, Images, Info, Motorbike, Phone, type LucideIcon } from "lucide-react";
import { useLang } from "@/components/providers/lang.tsx";

export type NavItem = { to: string; label: string; icon: LucideIcon };

// Single source for every navigation style
export function useNavLinks(): NavItem[] {
  const { t } = useLang();
  return [
    { to: "/", label: t("Home", "الرئيسية"), icon: Home },
    { to: "/menu", label: t("Menu", "القائمة"), icon: BookOpen },
    { to: "/order", label: t("Order Now", "اطلب الآن"), icon: Motorbike },
    { to: "/table", label: t("Table Order", "طلب الطاولة"), icon: ConciergeBell },
    { to: "/book", label: t("Book a Table", "حجز طاولة"), icon: CalendarDays },
    { to: "/gallery", label: t("Gallery", "المعرض"), icon: Images },
    { to: "/about", label: t("About", "من نحن"), icon: Info },
    { to: "/contact", label: t("Contact", "اتصل بنا"), icon: Phone },
  ];
}
