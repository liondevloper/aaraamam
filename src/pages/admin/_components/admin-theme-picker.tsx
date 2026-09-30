import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { ADMIN_THEMES, getAdminTheme, type AdminThemeId } from '@/lib/admin-themes.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { ThemeSwatch } from './admin-ui.tsx';

export default function AdminThemePicker({ value, onChange, compact = false }: { value: AdminThemeId; onChange: (id: AdminThemeId) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const current = getAdminTheme(value);

  return (
    <>
      <Button
        size={compact ? 'icon' : 'sm'}
        variant={compact ? 'secondary' : 'ghost'}
        className={cn(!compact && 'w-full justify-start')}
        aria-label="Change admin theme"
        onClick={() => setOpen(true)}
      >
        <Palette className="size-4" />
        {!compact && <span className="truncate">Theme: {current.label}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Admin panel theme</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Changes only how this admin panel looks on this device. Customers keep seeing the website theme from Settings.</p>
          <div className="grid gap-2">
            {ADMIN_THEMES.map((t) => {
              const on = t.id === value;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange(t.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border p-3 text-left transition-colors hover:bg-secondary',
                    on && 'border-primary ring-2 ring-primary/30',
                  )}
                >
                  <ThemeSwatch vars={t.vars} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{t.label}</span>
                    <span className="block text-xs text-muted-foreground">{t.hint}</span>
                  </span>
                  {on && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
