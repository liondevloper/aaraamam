import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { useSetTheme, useSettings } from "@/components/providers/settings.tsx";
import { updateSettings } from "@/lib/db.ts";
import { THEMES, type ThemeId } from "@/lib/themes.ts";
import { THEME_NAV } from "@/lib/theme-nav.ts";
import { useAdminStatus } from "@/hooks/use-admin.ts";
import { cn } from "@/lib/utils.ts";

// Floating theme button, always in the same corner in every theme.
// Sits above the mobile tab bar / dock, and in the corner on desktop.
export default function ThemePicker() {
  const s = useSettings();
  const setTheme = useSetTheme();
  const status = useAdminStatus();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when tapping anywhere outside
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
    <div ref={ref} className="fixed bottom-24 right-4 z-40 xl:bottom-6">
      <button
        type="button"
        aria-label="Change theme"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-12 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <Palette className="size-5" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-60 rounded-[var(--radius)] border bg-popover p-1.5 text-popover-foreground shadow-xl">
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
