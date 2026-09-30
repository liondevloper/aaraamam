import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useSetTheme, useSettings } from "@/components/providers/settings.tsx";
import { updateSettings } from "@/lib/db.ts";
import { THEMES, type ThemeId } from "@/lib/themes.ts";
import { THEME_NAV } from "@/lib/theme-nav.ts";
import { useAdminStatus } from "@/hooks/use-admin.ts";
import { cn } from "@/lib/utils.ts";

// Palette button that opens a small theme list. Every theme also changes the navigation layout.
export default function ThemePicker() {
  const s = useSettings();
  const setTheme = useSetTheme();
  const status = useAdminStatus();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when tapping anywhere outside (no full-screen backdrop: sticky headers trap fixed children)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (id: ThemeId) => {
    setTheme(id);
    if (status?.isAdmin) void updateSettings({ theme: id });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <Button size="icon" variant="secondary" aria-label="Change theme" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Palette className="size-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-[var(--radius)] border bg-popover p-1.5 text-popover-foreground shadow-xl">
          {THEMES.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => pick(th.id)}
              className={cn("flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-secondary", s.theme === th.id && "font-semibold text-primary")}
            >
              <span className="flex-1">
                {th.label}
                <span className="block text-xs font-normal text-muted-foreground">{THEME_NAV[th.id].name}</span>
              </span>
              {s.theme === th.id && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
