import type { ReactNode } from "react";
import SectionTitle from "@/components/section-title.tsx";
import { useSettings } from "@/components/providers/settings.tsx";
import { getLook } from "@/lib/theme-look.ts";
import { cn } from "@/lib/utils.ts";

// Page-level heading shared by every inner page so titles follow the theme
export default function PageHeading({ children, className }: { children: ReactNode; className?: string }) {
  const { theme } = useSettings();
  const centered = getLook(theme).head.includes("text-center");
  return (
    <div className={cn("mb-6", centered && "text-center", className)}>
      <SectionTitle className="[&_h2]:text-3xl [&>h2]:text-3xl">{children}</SectionTitle>
    </div>
  );
}
