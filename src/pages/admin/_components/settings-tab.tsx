import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarDays, Check, Palette, Send, Tag, ToggleRight, Trash2, Truck } from 'lucide-react';
import type { Settings, SettingsPrivate, Promo } from '@/lib/db.ts';
import { createPromo, deletePromo, getSettingsPrivate, listPromos, sendTelegramTest, setPromoActive, updateSettings, updateSettingsPrivate } from '@/lib/db.ts';
import { errMsg } from '@/lib/errors.ts';
import { THEMES } from '@/lib/themes.ts';
import { THEME_NAV } from '@/lib/theme-nav.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useRefreshSettings, useSettings } from '@/components/providers/settings.tsx';
import { Chip, Field, Panel, SaveBar, ThemeSwatch } from './admin-ui.tsx';

const FLAG_LABELS: Record<keyof Settings['flags'], string> = {
  ordering: 'Online ordering', booking: 'Table booking', delivery: 'Delivery', pickup: 'Pickup',
  cod: 'Cash on delivery', mapPin: 'Map pin at checkout', autofill: 'Address auto-fill', tracking: 'Rider live tracking',
};
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SettingsTab() {
  const current = useSettings();
  const refresh = useRefreshSettings();
  const [s, setS] = useState<Settings>(current);
  const [saving, setSaving] = useState(false);
  const num = (v: string) => Number(v) || 0;
  const setDelivery = (p: Partial<Settings['delivery']>) => setS({ ...s, delivery: { ...s.delivery, ...p } });
  const setBooking = (p: Partial<Settings['booking_config']>) => setS({ ...s, booking_config: { ...s.booking_config, ...p } });

  const submit = async () => {
    setSaving(true);
    try {
      // Never send `store` (shift / maintenance) from here, or an old copy would undo live changes
      const { store: _store, ...rest } = s;
      await updateSettings(rest);
      await refresh();
      toast.success('Settings saved');
    } catch (e) {
      toast.error(errMsg(e, 'Could not save settings'));
    } finally {
      setSaving(false);
    }
  };

  const closedDays = s.booking_config.closedWeekdays;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Panel icon={Palette} title="Brand and website theme" description="The look customers see. The admin panel theme is changed from the palette button.">
        <Field label="Restaurant name"><Input value={s.restaurant_name} onChange={(e) => setS({ ...s, restaurant_name: e.target.value })} /></Field>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => {
            const on = s.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setS({ ...s, theme: t.id })}
                className={cn('flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border p-3 text-left transition-colors hover:bg-secondary', on && 'border-primary ring-2 ring-primary/30')}
              >
                <ThemeSwatch vars={t.vars} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{t.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{THEME_NAV[t.id].name}</span>
                </span>
                {on && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
        <Field label="Custom primary color" hint="Optional. Leave empty to use the theme color. Example: #1f7a4d">
          <div className="flex gap-2">
            <Input value={s.primary_color ?? ''} placeholder="#1f7a4d" onChange={(e) => setS({ ...s, primary_color: e.target.value || null })} />
            {s.primary_color && <span className="size-9 shrink-0 rounded-md border" style={{ background: s.primary_color }} />}
          </div>
        </Field>
      </Panel>

      <Panel icon={ToggleRight} title="Features" description="Shift, timetable and maintenance are on the Dashboard.">
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(FLAG_LABELS) as (keyof Settings['flags'])[]).map((k) => (
            <label key={k} className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius)] border px-3 py-2.5 text-sm">
              {FLAG_LABELS[k]}
              <Switch checked={s.flags[k]} onCheckedChange={(c) => setS({ ...s, flags: { ...s.flags, [k]: c } })} />
            </label>
          ))}
        </div>
      </Panel>

      <Panel icon={Truck} title="Delivery and VAT">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Radius (km)"><Input type="number" value={s.delivery.radiusKm} onChange={(e) => setDelivery({ radiusKm: num(e.target.value) })} /></Field>
          <Field label="Delivery fee (AED)"><Input type="number" value={s.delivery.fee} onChange={(e) => setDelivery({ fee: num(e.target.value) })} /></Field>
          <Field label="Min order (AED)"><Input type="number" value={s.delivery.minOrder} onChange={(e) => setDelivery({ minOrder: num(e.target.value) })} /></Field>
          <Field label="Restaurant latitude"><Input type="number" step="0.0001" value={s.delivery.lat} onChange={(e) => setDelivery({ lat: num(e.target.value) })} /></Field>
          <Field label="Restaurant longitude"><Input type="number" step="0.0001" value={s.delivery.lng} onChange={(e) => setDelivery({ lng: num(e.target.value) })} /></Field>
          <Field label="VAT %"><Input type="number" value={s.vat_percent} onChange={(e) => setS({ ...s, vat_percent: num(e.target.value) })} /></Field>
        </div>
      </Panel>

      <Panel icon={CalendarDays} title="Table booking">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Opens"><Input type="time" value={s.booking_config.open} onChange={(e) => setBooking({ open: e.target.value })} /></Field>
          <Field label="Closes"><Input type="time" value={s.booking_config.close} onChange={(e) => setBooking({ close: e.target.value })} /></Field>
          <Field label="Slot length (min)"><Input type="number" value={s.booking_config.slotMinutes} onChange={(e) => setBooking({ slotMinutes: Math.max(5, num(e.target.value)) })} /></Field>
          <Field label="Guests per slot"><Input type="number" value={s.booking_config.capacityPerSlot} onChange={(e) => setBooking({ capacityPerSlot: num(e.target.value) })} /></Field>
          <Field label="Days ahead"><Input type="number" value={s.booking_config.maxDaysAhead} onChange={(e) => setBooking({ maxDaysAhead: num(e.target.value) })} /></Field>
        </div>
        <Field label="Closed for booking" hint="Tap a day to close it for bookings">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d, i) => {
              const closed = closedDays.includes(i);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setBooking({ closedWeekdays: closed ? closedDays.filter((x) => x !== i) : [...closedDays, i] })}
                  className={cn('cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium', closed ? 'border-destructive bg-destructive text-white' : 'bg-card hover:bg-secondary')}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </Field>
      </Panel>

      <SaveBar busy={saving} label="Save settings" onSave={() => void submit()} />

      <TelegramBlock />
      <PromoBlock />
    </div>
  );
}

function TelegramBlock() {
  const [priv, setPriv] = useState<SettingsPrivate | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { getSettingsPrivate().then(setPriv).catch(() => setFailed(true)); }, []);

  const save = async () => {
    if (!priv) return;
    try {
      await updateSettingsPrivate(priv);
      toast.success('Telegram settings saved');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const test = async () => {
    if (!priv) return;
    try {
      await updateSettingsPrivate(priv);
      await sendTelegramTest();
      toast.success('Test message sent');
    } catch {
      toast.error('Enable Telegram and fill in both fields');
    }
  };

  return (
    <Panel icon={Send} title="Telegram alerts" description="Get a Telegram message for every new order">
      {failed ? <p className="text-sm text-muted-foreground">Could not load Telegram settings.</p> : !priv ? <Skeleton className="h-24" /> : (
        <>
          <label className="flex items-center gap-2 text-sm"><Switch checked={priv.telegram_enabled} onCheckedChange={(c) => setPriv({ ...priv, telegram_enabled: c })} />Enabled</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bot token"><Input type="password" value={priv.bot_token} onChange={(e) => setPriv({ ...priv, bot_token: e.target.value })} /></Field>
            <Field label="Chat ID"><Input value={priv.chat_id} onChange={(e) => setPriv({ ...priv, chat_id: e.target.value })} /></Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save()}>Save</Button>
            <Button variant="secondary" onClick={() => void test()}>Send test message</Button>
          </div>
        </>
      )}
    </Panel>
  );
}

function PromoBlock() {
  const [promos, setPromos] = useState<Promo[] | null>(null);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState(10);
  const [min, setMin] = useState(0);

  const load = useCallback(() => listPromos().then(setPromos).catch(() => setPromos((p) => p ?? [])), []);
  useEffect(() => { void load(); }, [load]);

  const act = (p: Promise<void>, ok?: string) => p.then(() => { if (ok) toast.success(ok); return load(); }).catch((e: unknown) => { toast.error(errMsg(e)); });

  const add = () => {
    if (!code.trim()) {
      toast.error('Enter a code');
      return;
    }
    void act(createPromo({ code, type, value, minOrder: min }).then(() => setCode('')), 'Promo code added');
  };

  return (
    <Panel icon={Tag} title="Promo codes">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_auto_1fr_1fr_auto] lg:items-end">
        <Field label="Code"><Input placeholder="WELCOME10" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></Field>
        <Field label="Type">
          <div className="flex gap-2">
            <Chip active={type === 'percent'} onClick={() => setType('percent')}>Percent</Chip>
            <Chip active={type === 'fixed'} onClick={() => setType('fixed')}>AED</Chip>
          </div>
        </Field>
        <Field label={type === 'percent' ? 'Discount %' : 'Discount AED'}><Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} /></Field>
        <Field label="Min order (AED)"><Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} /></Field>
        <Button onClick={add}>Add code</Button>
      </div>

      {promos === null ? <Skeleton className="h-12" /> : promos.length === 0 ? (
        <p className="rounded-[var(--radius)] border border-dashed p-4 text-center text-sm text-muted-foreground">No promo codes yet.</p>
      ) : (
        <div className="divide-y rounded-[var(--radius)] border">
          {promos.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="rounded bg-secondary px-2 py-0.5 font-mono font-semibold text-secondary-foreground">{p.code}</span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{p.type === 'percent' ? `${p.value}% off` : `AED ${p.value} off`} · min AED {p.min_order}</span>
              <Switch checked={p.active} aria-label="Active" onCheckedChange={(a) => void act(setPromoActive(p.id, a))} />
              <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive" aria-label="Delete code" onClick={() => void act(deletePromo(p.id), 'Promo code deleted')}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
