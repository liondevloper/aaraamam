import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import type { Settings, SettingsPrivate, Promo } from '@/lib/db.ts';
import { createPromo, deletePromo, getSettingsPrivate, listPromos, sendTelegramTest, setPromoActive, updateSettings, updateSettingsPrivate } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { THEMES } from '@/lib/themes.ts';
import { cn } from '@/lib/utils.ts';

const FLAG_LABELS: Record<keyof Settings['flags'], string> = {
  ordering: 'Online ordering', booking: 'Table booking', delivery: 'Delivery', pickup: 'Pickup',
  cod: 'Cash on delivery', mapPin: 'Map pin at checkout', autofill: 'Address auto-fill', tracking: 'Rider live tracking',
};
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SettingsTab() {
  const current = useSettings();
  const [s, setS] = useState<Settings>(current);
  const num = (v: string) => Number(v) || 0;

  const submit = async () => {
    await updateSettings(s);
    toast.success('Settings saved');
  };

  return (
    <div className="max-w-3xl space-y-8">
      <Block title="Brand and theme">
        <Field label="Restaurant name"><Input value={s.restaurant_name} onChange={(e) => setS({ ...s, restaurant_name: e.target.value })} /></Field>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setS({ ...s, theme: t.id })} className={cn('cursor-pointer rounded-lg border px-4 py-2 text-sm', s.theme === t.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card')}>{t.label}</button>
          ))}
        </div>
        <Field label="Primary color"><Input value={s.primary_color ?? ''} onChange={(e) => setS({ ...s, primary_color: e.target.value || null })} /></Field>
      </Block>

      <Block title="Switches">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(FLAG_LABELS) as (keyof Settings['flags'])[]).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm"><Switch checked={s.flags[k]} onCheckedChange={(c) => setS({ ...s, flags: { ...s.flags, [k]: c } })} />{FLAG_LABELS[k]}</label>
          ))}
        </div>
      </Block>

      <Block title="Delivery and VAT">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Radius (km)"><Input type="number" value={s.delivery.radiusKm} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, radiusKm: num(e.target.value) } })} /></Field>
          <Field label="Delivery fee (AED)"><Input type="number" value={s.delivery.fee} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, fee: num(e.target.value) } })} /></Field>
          <Field label="Min order (AED)"><Input type="number" value={s.delivery.minOrder} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, minOrder: num(e.target.value) } })} /></Field>
          <Field label="Restaurant latitude"><Input type="number" step="0.0001" value={s.delivery.lat} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, lat: num(e.target.value) } })} /></Field>
          <Field label="Restaurant longitude"><Input type="number" step="0.0001" value={s.delivery.lng} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, lng: num(e.target.value) } })} /></Field>
          <Field label="VAT %"><Input type="number" value={s.vat_percent} onChange={(e) => setS({ ...s, vat_percent: num(e.target.value) })} /></Field>
        </div>
      </Block>

      <Block title="Table booking">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Opens"><Input type="time" value={s.booking_config.open} onChange={(e) => setS({ ...s, booking_config: { ...s.booking_config, open: e.target.value } })} /></Field>
          <Field label="Closes"><Input type="time" value={s.booking_config.close} onChange={(e) => setS({ ...s, booking_config: { ...s.booking_config, close: e.target.value } })} /></Field>
          <Field label="Slot length (min)"><Input type="number" value={s.booking_config.slotMinutes} onChange={(e) => setS({ ...s, booking_config: { ...s.booking_config, slotMinutes: Math.max(5, num(e.target.value)) } })} /></Field>
          <Field label="Guests per slot"><Input type="number" value={s.booking_config.capacityPerSlot} onChange={(e) => setS({ ...s, booking_config: { ...s.booking_config, capacityPerSlot: num(e.target.value) } })} /></Field>
          <Field label="Days ahead"><Input type="number" value={s.booking_config.maxDaysAhead} onChange={(e) => setS({ ...s, booking_config: { ...s.booking_config, maxDaysAhead: num(e.target.value) } })} /></Field>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d, i) => {
            const closed = s.booking_config.closedWeekdays.includes(i);
            return <button key={d} onClick={() => setS({ ...s, booking_config: { ...s.booking_config, closedWeekdays: closed ? s.booking_config.closedWeekdays.filter((x) => x !== i) : [...s.booking_config.closedWeekdays, i] } })} className={cn('cursor-pointer rounded-md border px-3 py-1 text-sm', closed ? 'bg-destructive text-white' : 'bg-card')}>{d}{closed && ' (closed)'}</button>;
          })}
        </div>
      </Block>

      <Button size="lg" onClick={() => void submit()}>Save settings</Button>
      <TelegramBlock />
      <PromoBlock />
    </div>
  );
}

function TelegramBlock() {
  const [priv, setPriv] = useState<SettingsPrivate | null>(null);
  useEffect(() => { getSettingsPrivate().then(setPriv).catch(console.error); }, []);
  if (!priv) return null;
  return (
    <Block title="Telegram alerts">
      <label className="flex items-center gap-2 text-sm"><Switch checked={priv.telegram_enabled} onCheckedChange={(c) => setPriv({ ...priv, telegram_enabled: c })} />Enabled</label>
      <Field label="Bot token"><Input type="password" value={priv.bot_token} onChange={(e) => setPriv({ ...priv, bot_token: e.target.value })} /></Field>
      <Field label="Chat ID"><Input value={priv.chat_id} onChange={(e) => setPriv({ ...priv, chat_id: e.target.value })} /></Field>
      <div className="flex gap-2">
        <Button onClick={async () => { await updateSettingsPrivate(priv); toast.success('Saved'); }}>Save</Button>
        <Button variant="secondary" onClick={async () => { try { await updateSettingsPrivate(priv); await sendTelegramTest(); toast.success('Test message sent'); } catch { toast.error('Enable Telegram and fill in both fields'); } }}>Send test message</Button>
      </div>
    </Block>
  );
}

function PromoBlock() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState(10);
  const [min, setMin] = useState(0);

  useEffect(() => { listPromos().then(setPromos).catch(console.error); }, []);

  const add = async () => {
    try { await createPromo({ code, type, value, minOrder: min }); setCode(''); await listPromos().then(setPromos); } catch { toast.error('Could not create code'); }
  };

  return (
    <Block title="Promo codes">
      <div className="grid gap-2 sm:grid-cols-5">
        <Input placeholder="WELCOME10" value={code} onChange={(e) => setCode(e.target.value)} />
        <select className="rounded-md border bg-background px-2 text-sm" value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}><option value="percent">Percent</option><option value="fixed">Fixed AED</option></select>
        <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
        <Input type="number" placeholder="Min order" value={min} onChange={(e) => setMin(Number(e.target.value))} />
        <Button onClick={() => void add()}>Add</Button>
      </div>
      {promos.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-card p-2 text-sm">
          <span className="flex-1 font-mono">{p.code} · {p.type === 'percent' ? `${p.value}%` : `AED ${p.value}`} · min {p.min_order}</span>
          <Switch checked={p.active} onCheckedChange={(a) => void setPromoActive(p.id, a).then(() => listPromos().then(setPromos))} />
          <Button size="icon" variant="destructive" className="size-8" onClick={() => void deletePromo(p.id).then(() => listPromos().then(setPromos))}><Trash2 className="size-4" /></Button>
        </div>
      ))}
    </Block>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-xl border bg-card p-5"><h3 className="text-lg font-bold">{title}</h3>{children}</section>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
