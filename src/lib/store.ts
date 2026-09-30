import type { Settings } from './db.ts';

// Live store state lives in settings.store (Supabase). The same rules run in the
// `store_closed_reason` SQL function, so customers can never order while closed.

export type StoreHours = { open: string; close: string; closedWeekdays: number[] };

export type StoreConfig = {
  shiftOpen: boolean;
  /** ISO time. While shiftOpen is false the store reopens by itself at this time. null = stays closed. */
  closedUntil: string | null;
  closedNoteEn: string;
  closedNoteAr: string;
  autoHours: boolean;
  hours: StoreHours;
  maintenance: boolean;
  maintenanceEn: string;
  maintenanceAr: string;
};

export const DEFAULT_STORE: StoreConfig = {
  shiftOpen: true,
  closedUntil: null,
  closedNoteEn: '',
  closedNoteAr: '',
  autoHours: false,
  hours: { open: '10:00', close: '23:00', closedWeekdays: [] },
  maintenance: false,
  maintenanceEn: 'We are making a few improvements. Please check back soon.',
  maintenanceAr: 'نقوم ببعض التحسينات. يرجى العودة قريبًا.',
};

export type ClosedReason = 'ordering_off' | 'shift' | 'hours';

export type StoreStatus =
  | { kind: 'open'; closesAt: Date | null }
  | { kind: 'maintenance' }
  | { kind: 'closed'; reason: ClosedReason; reopensAt: Date | null };

// Dubai has no daylight saving, so a fixed +4h offset is exact
const DUBAI_OFFSET_MS = 4 * 3600 * 1000;
const DAY_MS = 86400000;

const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

function dubaiParts(now: Date) {
  const d = new Date(now.getTime() + DUBAI_OFFSET_MS);
  return {
    mins: d.getUTCHours() * 60 + d.getUTCMinutes(),
    dow: d.getUTCDay(),
    dayStartUtc: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - DUBAI_OFFSET_MS,
  };
}

export const dubaiDayKey = (d: Date): string => new Date(d.getTime() + DUBAI_OFFSET_MS).toISOString().slice(0, 10);

export function normalizeStore(raw: Partial<StoreConfig> | null | undefined): StoreConfig {
  const r = raw ?? {};
  return { ...DEFAULT_STORE, ...r, hours: { ...DEFAULT_STORE.hours, ...(r.hours ?? {}) } };
}

export function isWithinHours(h: StoreHours, now: Date): boolean {
  const { mins, dow } = dubaiParts(now);
  const om = toMin(h.open);
  const cm = toMin(h.close);
  const openDay = (d: number) => !h.closedWeekdays.includes(d);
  if (om === cm) return openDay(dow);
  if (cm > om) return openDay(dow) && mins >= om && mins < cm;
  // Overnight hours, e.g. 18:00 to 02:00
  return (openDay(dow) && mins >= om) || (openDay((dow + 6) % 7) && mins < cm);
}

function nextOpening(h: StoreHours, now: Date): Date | null {
  const { dayStartUtc, dow } = dubaiParts(now);
  const om = toMin(h.open);
  for (let i = 0; i < 8; i++) {
    if (h.closedWeekdays.includes((dow + i) % 7)) continue;
    const at = new Date(dayStartUtc + i * DAY_MS + om * 60000);
    if (at > now) return at;
  }
  return null;
}

function nextClosing(h: StoreHours, now: Date): Date | null {
  const { dayStartUtc, mins } = dubaiParts(now);
  const om = toMin(h.open);
  const cm = toMin(h.close);
  if (om === cm) return null;
  const addDay = cm < om && mins >= om ? DAY_MS : 0;
  return new Date(dayStartUtc + addDay + cm * 60000);
}

/** Next time the Dubai clock shows hh:mm (today if still ahead, otherwise tomorrow). */
export function dubaiTimeToDate(hhmm: string, now: Date): Date {
  const { dayStartUtc } = dubaiParts(now);
  const at = dayStartUtc + toMin(hhmm) * 60000;
  return new Date(at > now.getTime() ? at : at + DAY_MS);
}

export function getStoreStatus(s: Pick<Settings, 'flags' | 'store'>, now: Date): StoreStatus {
  const st = s.store;
  if (st.maintenance) return { kind: 'maintenance' };
  if (!s.flags.ordering) return { kind: 'closed', reason: 'ordering_off', reopensAt: null };
  const until = st.closedUntil ? new Date(st.closedUntil) : null;
  if (!st.shiftOpen && (!until || now < until)) return { kind: 'closed', reason: 'shift', reopensAt: until };
  if (st.autoHours && !isWithinHours(st.hours, now)) {
    return { kind: 'closed', reason: 'hours', reopensAt: nextOpening(st.hours, now) };
  }
  return { kind: 'open', closesAt: st.autoHours ? nextClosing(st.hours, now) : null };
}

/** "today at 7:00 PM", "tomorrow at 10:00 AM" or "Friday at 10:00 AM" in Dubai time. */
export function formatDubai(date: Date, lang: 'en' | 'ar', now: Date = new Date()): string {
  const locale = lang === 'ar' ? 'ar-AE' : 'en-US';
  const time = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Dubai', hour: 'numeric', minute: '2-digit' }).format(date);
  const key = dubaiDayKey(date);
  if (key === dubaiDayKey(now)) return lang === 'ar' ? `اليوم ${time}` : `today at ${time}`;
  if (key === dubaiDayKey(new Date(now.getTime() + DAY_MS))) return lang === 'ar' ? `غدًا ${time}` : `tomorrow at ${time}`;
  const weekday = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Dubai', weekday: 'long' }).format(date);
  return lang === 'ar' ? `${weekday} ${time}` : `${weekday} at ${time}`;
}
