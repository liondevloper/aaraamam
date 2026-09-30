import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Trash2 } from "lucide-react";
import { useSettings, type Settings } from "@/components/providers/settings.tsx";
import { THEMES } from "@/lib/themes.ts";
import { cn } from "@/lib/utils.ts";

const FLAG_LABELS: Record<keyof Settings["flags"], string> = {
  ordering: "Online ordering", booking: "Table booking", delivery: "Delivery", pickup: "Pickup",
  cod: "Cash on delivery", mapPin: "Map pin at checkout", autofill: "Address auto-fill", tracking: "Rider live tracking",
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SettingsTab() {
  const current = useSettings();
  const save = useMutation(api.settings.update);
  const [s, setS] = useState<Settings>(current);
  const num = (v: string) => Number(v) || 0;

  const submit = async () => {
    await save({ values: s });
    toast.success("Settings saved");
  };

  return (
    <div className="max-w-3xl space-y-8">
      <Block title="Brand and theme">
        <Field label="Restaurant name"><Input value={s.restaurantName} onChange={(e) => setS({ ...s, restaurantName: e.target.value })} /></Field>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setS({ ...s, theme: t.id })} className={cn("cursor-pointer rounded-lg border px-4 py-2 text-sm", s.theme === t.id ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>{t.label}</button>
          ))}
        </div>
        <Field label="Primary color (optional, e.g. oklch(0.5 0.15 150) or #1a7f37)"><Input value={s.primaryColor ?? ""} onChange={(e) => setS({ ...s, primaryColor: e.target.value || undefined })} /></Field>
      </Block>

      <Block title="Switches">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(FLAG_LABELS) as (keyof Settings["flags"])[]).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm"><Switch checked={s.flags[k]} onCheckedChange={(c) => setS({ ...s, flags: { ...s.flags, [k]: c } })} />{FLAG_LABELS[k]}</label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Card payments are not available yet.</p>
      </Block>

      <Block title="Delivery and VAT">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Radius (km)"><Input type="number" value={s.delivery.radiusKm} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, radiusKm: num(e.target.value) } })} /></Field>
          <Field label="Delivery fee (AED)"><Input type="number" value={s.delivery.fee} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, fee: num(e.target.value) } })} /></Field>
          <Field label="Min order (AED)"><Input type="number" value={s.delivery.minOrder} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, minOrder: num(e.target.value) } })} /></Field>
          <Field label="Restaurant latitude"><Input type="number" step="0.0001" value={s.delivery.lat} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, lat: num(e.target.value) } })} /></Field>
          <Field label="Restaurant longitude"><Input type="number" step="0.0001" value={s.delivery.lng} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, lng: num(e.target.value) } })} /></Field>
          <Field label="VAT %"><Input type="number" value={s.vatPercent} onChange={(e) => setS({ ...s, vatPercent: num(e.target.value) })} /></Field>
        </div>
      </Block>

      <Block title="Address fields">
        {(Object.keys(s.addressFields) as (keyof Settings["addressFields"])[]).map((k) => {
          const f = s.addressFields[k];
          const set = (p: Partial<typeof f>) => setS({ ...s, addressFields: { ...s.addressFields, [k]: { ...f, ...p } } });
          return (
            <div key={k} className="grid items-center gap-2 sm:grid-cols-[auto_auto_1fr_1fr]">
              <label className="flex items-center gap-2 text-sm"><Switch checked={f.on} onCheckedChange={(c) => set({ on: c })} />On</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={f.required} onCheckedChange={(c) => set({ required: c })} />Required</label>
              <Input value={f.labelEn} onChange={(e) => set({ labelEn: e.target.value })} />
              <Input dir="rtl" value={f.labelAr} onChange={(e) => set({ labelAr: e.target.value })} />
            </div>
          );
        })}
      </Block>

      <Block title="Table booking">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Opens"><Input type="time" value={s.bookingConfig.open} onChange={(e) => setS({ ...s, bookingConfig: { ...s.bookingConfig, open: e.target.value } })} /></Field>
          <Field label="Closes"><Input type="time" value={s.bookingConfig.close} onChange={(e) => setS({ ...s, bookingConfig: { ...s.bookingConfig, close: e.target.value } })} /></Field>
          <Field label="Slot length (min)"><Input type="number" value={s.bookingConfig.slotMinutes} onChange={(e) => setS({ ...s, bookingConfig: { ...s.bookingConfig, slotMinutes: Math.max(5, num(e.target.value)) } })} /></Field>
          <Field label="Guests per slot"><Input type="number" value={s.bookingConfig.capacityPerSlot} onChange={(e) => setS({ ...s, bookingConfig: { ...s.bookingConfig, capacityPerSlot: num(e.target.value) } })} /></Field>
          <Field label="Days ahead"><Input type="number" value={s.bookingConfig.maxDaysAhead} onChange={(e) => setS({ ...s, bookingConfig: { ...s.bookingConfig, maxDaysAhead: num(e.target.value) } })} /></Field>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d, i) => {
            const closed = s.bookingConfig.closedWeekdays.includes(i);
            return <button key={d} onClick={() => setS({ ...s, bookingConfig: { ...s.bookingConfig, closedWeekdays: closed ? s.bookingConfig.closedWeekdays.filter((x) => x !== i) : [...s.bookingConfig.closedWeekdays, i] } })} className={cn("cursor-pointer rounded-md border px-3 py-1 text-sm", closed ? "bg-destructive text-white" : "bg-card")}>{d}{closed && " (closed)"}</button>;
          })}
        </div>
        <Field label="Holidays (YYYY-MM-DD, comma separated)"><Input value={s.bookingConfig.holidays.join(", ")} onChange={(e) => setS({ ...s, bookingConfig: { ...s.bookingConfig, holidays: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } })} /></Field>
      </Block>

      <Button size="lg" onClick={() => void submit()}>Save settings</Button>
      <TelegramBlock />
      <PromoBlock />
    </div>
  );
}

function TelegramBlock() {
  const priv = useQuery(api.settings.getPrivate, {});
  const save = useMutation(api.settings.updatePrivate);
  const test = useMutation(api.telegramData.sendTest);
  const [f, setF] = useState<{ telegramEnabled: boolean; botToken: string; chatId: string } | null>(null);
  const v = f ?? priv;
  if (!v) return null;
  return (
    <Block title="Telegram alerts">
      <label className="flex items-center gap-2 text-sm"><Switch checked={v.telegramEnabled} onCheckedChange={(c) => setF({ ...v, telegramEnabled: c })} />Enabled</label>
      <Field label="Bot token"><Input type="password" value={v.botToken} onChange={(e) => setF({ ...v, botToken: e.target.value })} /></Field>
      <Field label="Chat ID"><Input value={v.chatId} onChange={(e) => setF({ ...v, chatId: e.target.value })} /></Field>
      <div className="flex gap-2">
        <Button onClick={async () => { await save(v); toast.success("Saved"); }}>Save</Button>
        <Button variant="secondary" onClick={async () => { try { await save(v); await test(); toast.success("Test message sent"); } catch { toast.error("Enable Telegram and fill in both fields"); } }}>Send test message</Button>
      </div>
    </Block>
  );
}

function PromoBlock() {
  const promos = useQuery(api.promos.list, {});
  const create = useMutation(api.promos.create);
  const setActive = useMutation(api.promos.setActive);
  const remove = useMutation(api.promos.remove);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);
  const [min, setMin] = useState(0);
  const add = async () => {
    try { await create({ code, type, value, minOrder: min }); setCode(""); } catch { toast.error("Could not create code"); }
  };
  return (
    <Block title="Promo codes">
      <div className="grid gap-2 sm:grid-cols-5">
        <Input placeholder="WELCOME10" value={code} onChange={(e) => setCode(e.target.value)} />
        <select className="rounded-md border bg-background px-2 text-sm" value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")}><option value="percent">Percent</option><option value="fixed">Fixed AED</option></select>
        <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
        <Input type="number" placeholder="Min order" value={min} onChange={(e) => setMin(Number(e.target.value))} />
        <Button onClick={() => void add()}>Add</Button>
      </div>
      {promos?.map((p) => (
        <div key={p._id} className="flex items-center gap-3 rounded-lg border bg-card p-2 text-sm">
          <span className="flex-1 font-mono">{p.code} · {p.type === "percent" ? `${p.value}%` : `AED ${p.value}`} · min {p.minOrder}</span>
          <Switch checked={p.active} onCheckedChange={(a) => void setActive({ id: p._id, active: a })} />
          <Button size="icon" variant="destructive" className="size-8" onClick={() => void remove({ id: p._id })}><Trash2 className="size-4" /></Button>
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
