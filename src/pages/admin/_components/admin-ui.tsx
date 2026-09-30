import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { cn } from '@/lib/utils.ts';

// Shared building blocks so every admin tab looks the same in all 5 admin themes.

export function Panel({ title, description, icon: Icon, action, className, children }: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-[calc(var(--radius)+4px)] border bg-card p-5 text-card-foreground shadow-sm', className)}>
      <div className="mb-4 flex flex-wrap items-start gap-3">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, hint, className, children }: { label: string; htmlFor?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-secondary',
      )}
    >
      {children}
    </button>
  );
}

/** Segmented control used for status filters */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex w-full gap-1 rounded-[var(--radius)] bg-muted p-1 sm:w-auto">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none',
              on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
            {o.count !== undefined && o.count > 0 && (
              <span className={cn('rounded-full px-1.5 text-xs font-semibold', on ? 'bg-primary text-primary-foreground' : 'bg-background')}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyBox({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <Empty className="rounded-[calc(var(--radius)+4px)] border border-dashed bg-card/50">
      <EmptyHeader>
        <EmptyMedia variant="icon"><Icon /></EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}

export function LoadingList({ count = 3, className, grid = false }: { count?: number; className?: string; grid?: boolean }) {
  return (
    <div className={grid ? 'grid gap-4 lg:grid-cols-2' : 'space-y-3'}>
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className={cn('h-20 w-full rounded-[calc(var(--radius)+4px)]', className)} />)}
    </div>
  );
}

/** Sticky bar at the bottom of long forms, sits above the mobile tab bar */
export function SaveBar({ busy, label = 'Save changes', onSave, note = 'Changes go live after saving' }: { busy: boolean; label?: string; onSave: () => void; note?: string }) {
  return (
    <div className="sticky bottom-20 z-20 flex items-center justify-between gap-3 rounded-[calc(var(--radius)+4px)] border bg-card/95 p-3 shadow-lg backdrop-blur md:bottom-4">
      <p className="hidden text-sm text-muted-foreground sm:block">{note}</p>
      <Button size="lg" className="w-full sm:w-auto" disabled={busy} onClick={onSave}>{busy ? 'Saving…' : label}</Button>
    </div>
  );
}

export type ConfirmRequest = {
  title: string;
  description?: string;
  label: string;
  run: () => Promise<unknown> | void;
};

/** Replaces window.confirm with a themed dialog */
export function ConfirmDialog({ request, onClose }: { request: ConfirmRequest | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    if (!request) return;
    setBusy(true);
    try {
      await request.run();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={request !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{request?.title}</DialogTitle></DialogHeader>
        {request?.description && <p className="text-sm text-muted-foreground">{request.description}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Go back</Button>
          <Button variant="destructive" disabled={busy} onClick={() => void confirm()}>{request?.label}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small preview of a theme's colors */
export function ThemeSwatch({ vars }: { vars: Record<string, string> }) {
  // Inline styles: each swatch previews a theme other than the active one
  return (
    <span className="flex h-10 w-16 shrink-0 overflow-hidden rounded-md border" style={{ background: vars['--background'] }}>
      <span className="m-1.5 flex flex-1 items-end gap-1 rounded-sm p-1" style={{ background: vars['--card'] ?? vars['--background'] }}>
        <span className="h-2 flex-1 rounded-full" style={{ background: vars['--primary'] }} />
        <span className="size-2 rounded-full" style={{ background: vars['--accent'] }} />
      </span>
    </span>
  );
}
