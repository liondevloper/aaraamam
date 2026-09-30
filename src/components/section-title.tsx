import type { ReactNode } from "react";
import { useSettings } from "@/components/providers/settings.tsx";
import { getLook } from "@/lib/theme-look.ts";
import { cn } from "@/lib/utils.ts";

// Section heading that changes shape with the theme
export default function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  const { theme } = useSettings();
  const style = getLook(theme).title;

  if (style === "bar") {
    return <h2 className={cn("border-l-4 border-primary pl-3 text-xl font-extrabold uppercase tracking-wide", className)}>{children}</h2>;
  }
  if (style === "rules") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <span className="h-px flex-1 bg-primary/40" />
        <h2 className="text-3xl font-semibold italic">{children}</h2>
        <span className="h-px flex-1 bg-primary/40" />
      </div>
    );
  }
  if (style === "gold") {
    return (
      <div className={cn("text-center", className)}>
        <h2 className="text-2xl uppercase tracking-[0.3em] text-primary">{children}</h2>
        <div className="mx-auto mt-2 flex w-40 items-center gap-2">
          <span className="h-px flex-1 bg-primary/50" />
          <span className="size-1.5 rotate-45 bg-primary" />
          <span className="h-px flex-1 bg-primary/50" />
        </div>
      </div>
    );
  }
  if (style === "pill") {
    return (
      <h2 className={cn("inline-block rounded-full bg-accent px-4 py-1 text-lg font-semibold text-accent-foreground", className)}>{children}</h2>
    );
  }
  return <h2 className={cn("text-2xl font-bold", className)}>{children}</h2>;
}
