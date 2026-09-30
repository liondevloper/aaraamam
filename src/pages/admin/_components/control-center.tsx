import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, Power, Wrench } from 'lucide-react';
import { updateSettings, updateStore } from '@/lib/db.ts';
import type { StoreConfig, StoreStatus } from '@/lib/store.ts';
import { DEFAULT_STORE, dubaiTimeToDate, formatDubai } from '@/lib/store.ts';
import { errMsg } from '@/lib/errors.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useRefreshSettings, useSettings } from '@/components/providers/settings.tsx';
import { useStoreStatus } from '@/hooks/use-store-status.ts';
import { Chip, Panel } from './admin-ui.tsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
type Until = 'manual' | '30' | '60' | '120' | 'time';
const UNTIL_LABEL: Record<Until, string> = { manual: 'Until I reopen', '30': '30 min', '60': '1 hour', '120': '2 hours', time: 'Until a time' };

function useStorePatch() {
  const refresh = useRefreshSettings();
  const [busy, setBusy] = useState(false);
  const patch = async (p: Partial<StoreConfig>, msg: string): Promise<boolean> => {
    setBusy(true);
    try {
      await updateStore(p);
      await refresh();
      toast.success(msg);
      return true;
    } catch (e) {
      toast.error(errMsg(e, 'Could not save'));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { patch, busy };
}

function statusText(status: StoreStatus, now: Date): { title: string; sub: string } {
  if (status.kind === 'maintenance') return { title: 'Maintenance mode is ON', sub: 'Customers see the maintenance page. Nobody can order or book.' };
  if (status.kind === 'open') {
    return { title: 'Open · taking orders', sub: status.closesAt ? `Closes automatically ${formatDubai(status.closesAt, 'en', now)}` : 'Customers can order right now' };
  }
  if (status.reason === 'ordering_off') return { title: 'Closed · online ordering is off', sub: 'The online ordering switch is turned off.' };
  if (status.reason === 'hours') {
    return { title: 'Closed · outside opening hours', sub: status.reopensAt ? `Opens automatically ${formatDubai(status.reopensAt, 'en', now)}` : 'No open days in the timetable' };
  }
  return { title: 'Closed · shift is off', sub: status.reopensAt ? `Reopens automatically ${formatDubai(status.reopensAt, 'en', now)}` : 'Stays closed until you reopen' };
}

const TONE = {
  open: { box: 'border-emerald-500/40 bg-emerald-500/10', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  closed: { box: 'border-destructive/40 bg-destructive/10', dot: 'bg-destructive', text: 'text-destructive' },
  maintenance: { box: 'border-amber-500/50 bg-amber-500/10', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
} as const;

export default function ControlCenter() {
  const { status, now } = useStoreStatus();
  const tone = TONE[status.kind];
  const { title, sub } = statusText(status, now);

  return (
    <section className="space-y-4">
      <div className={cn('flex items-center gap-4 rounded-[calc(var(--radius)+4px)] border p-5', tone.box)}>
        <span className="relative flex size-4 shrink-0">
          <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-60', tone.dot)} />
          <span className={cn('relative inline-flex size-4 rounded-full', tone.dot)} />
        </span>
        <div className="min-w-0">
          <p className={cn('text-lg font-bold sm:text-xl', tone.text)}>{title}</p>
          <p className="text-sm text-muted-foreground">{sub}</p>
        </div>
        <span className="ml-auto hidden text-xs text-muted-foreground lg:block">Live · changes reach customers instantly</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ShiftCard status={status} />
        <HoursCard />
        <MaintenanceCard />
      </div>
    </section>
  );
}

function ShiftCard({ status }: { status: StoreStatus }) {
  const s = useSettings();
  const refresh = useRefreshSettings();
  const { patch, busy } = useStorePatch();
  const [open, setOpen] = useState(false);
  const [until, setUntil] = useState<Until>('manual');
  const [at, setAt] = useState('18:00');
  const [note, setNote] = useState('');

  const closedByShift = status.kind === 'closed' && status.reason === 'shift';
  const closedByHours = status.kind === 'closed' && status.reason === 'hours';
  const orderingOff = status.kind === 'closed' && status.reason === 'ordering_off';

  const reopenAt = (): string | null => {
    if (until === 'manual') return null;
    if (until === 'time') return dubaiTimeToDate(at, new Date()).toISOString();
    return new Date(Date.now() + Number(until) * 60000).toISOString();
  };

  const closeShift = async () => {
    const ok = await patch({ shiftOpen: false, closedUntil: reopenAt(), closedNoteEn: note.trim(), closedNoteAr: '' }, 'Shift closed. New orders are stopped.');
    if (ok) setOpen(false);
  };

  const orderingOn = async () => {
    try {
      await updateSettings({ flags: { ...s.flags, ordering: true } });
      await refresh();
      toast.success('Online ordering turned on');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <Panel icon={Power} title="Order shift" description="Stop new orders for a break or at closing time." className="flex flex-col [&>div:last-child]:flex-1">
      <div className="flex h-full flex-col justify-end">
        {orderingOff ? (
          <Button className="w-full" size="lg" disabled={busy} onClick={() => void orderingOn()}>Turn online ordering on</Button>
        ) : closedByShift ? (
          <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-600/90" size="lg" disabled={busy} onClick={() => void patch({ shiftOpen: true, closedUntil: null }, 'Shift open. Customers can order now.')}>
            <Power className="size-4" />Open now
          </Button>
        ) : closedByHours ? (
          <Button className="w-full" size="lg" variant="secondary" disabled={busy} onClick={() => void patch({ autoHours: false, shiftOpen: true, closedUntil: null }, 'Timetable turned off. Open now.')}>
            Open now (turn off timetable)
          </Button>
        ) : (
          <Button className="w-full" size="lg" variant="destructive" disabled={busy || status.kind === 'maintenance'} onClick={() => setOpen(true)}>
            <Power className="size-4" />Close shift
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Close the shift</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reopen</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(UNTIL_LABEL) as Until[]).map((k) => (
                  <Chip key={k} active={until === k} onClick={() => setUntil(k)}>{UNTIL_LABEL[k]}</Chip>
                ))}
              </div>
              {until === 'time' && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input type="time" value={at} onChange={(e) => setAt(e.target.value)} className="w-36" />
                  <span className="text-sm text-muted-foreground">Dubai time · opens {formatDubai(dubaiTimeToDate(at, new Date()), 'en')}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Message for customers (optional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Back after prayer break" />
            </div>
            <Button className="w-full" variant="destructive" size="lg" disabled={busy} onClick={() => void closeShift()}>Stop taking orders</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function HoursCard() {
  const s = useSettings();
  const { patch, busy } = useStorePatch();
  const [hours, setHours] = useState(s.store.hours);
  const dirty = JSON.stringify(hours) !== JSON.stringify(s.store.hours);

  const toggleDay = (i: number) => setHours({
    ...hours,
    closedWeekdays: hours.closedWeekdays.includes(i) ? hours.closedWeekdays.filter((d) => d !== i) : [...hours.closedWeekdays, i],
  });

  return (
    <Panel
      icon={CalendarClock}
      title="Opening timetable"
      description="Dubai time. Red days stay closed."
      action={<Switch checked={s.store.autoHours} disabled={busy} aria-label="Open and close automatically" onCheckedChange={(c) => void patch({ autoHours: c, hours }, c ? 'Timetable on' : 'Timetable off')} />}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1"><Label className="text-xs">Opens</Label><Input type="time" value={hours.open} onChange={(e) => setHours({ ...hours, open: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">Closes</Label><Input type="time" value={hours.close} onChange={(e) => setHours({ ...hours, close: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d, i) => {
          const off = hours.closedWeekdays.includes(i);
          return (
            <button key={d} type="button" onClick={() => toggleDay(i)} className={cn('cursor-pointer rounded-md border py-1.5 text-xs font-medium', off ? 'border-destructive bg-destructive text-white' : 'bg-background hover:bg-secondary')}>
              {d}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{s.store.autoHours ? 'Automatic opening is on.' : 'Automatic opening is off.'} Late closing (e.g. 18:00 to 02:00) works too.</p>
      {dirty && <Button className="w-full" disabled={busy} onClick={() => void patch({ hours }, 'Timetable saved')}>Save timetable</Button>}
    </Panel>
  );
}

function MaintenanceCard() {
  const s = useSettings();
  const { patch, busy } = useStorePatch();
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState(s.store.maintenanceEn);
  const on = s.store.maintenance;

  const turnOn = async () => {
    const text = msg.trim();
    const ok = await patch({ maintenance: true, maintenanceEn: text, maintenanceAr: text === DEFAULT_STORE.maintenanceEn ? DEFAULT_STORE.maintenanceAr : '' }, 'Maintenance mode is on');
    if (ok) setConfirm(false);
  };

  return (
    <Panel icon={Wrench} title="Maintenance mode" description={'Hide the website behind a "back soon" page. Order tracking keeps working.'}>
      <label className={cn('flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border p-3 text-sm font-medium', on && 'border-amber-500/50 bg-amber-500/10')}>
        <span>{on ? 'Maintenance is ON' : 'Website is live'}</span>
        <Switch checked={on} disabled={busy} onCheckedChange={(c) => (c ? setConfirm(true) : void patch({ maintenance: false }, 'Website is live again'))} />
      </label>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Turn on maintenance mode?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Every customer will instantly see the maintenance page. Ordering and booking stop until you turn it off.</p>
          <div className="space-y-2">
            <Label>Message for customers</Label>
            <Textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} />
          </div>
          <Button variant="destructive" size="lg" disabled={busy} onClick={() => void turnOn()}>Turn on maintenance</Button>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
