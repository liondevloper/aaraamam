// Dubai is UTC+4 all year (no daylight saving), so a fixed offset is safe.
const DUBAI_OFFSET_MS = 4 * 3600 * 1000;

export function dubaiNow(ms: number = Date.now()): {
  date: string;
  minutes: number;
  weekday: number;
} {
  const d = new Date(ms + DUBAI_OFFSET_MS);
  return {
    date: d.toISOString().slice(0, 10),
    minutes: d.getUTCHours() * 60 + d.getUTCMinutes(),
    weekday: d.getUTCDay(),
  };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function isAvailableNow(
  from: string | undefined,
  to: string | undefined,
  minutes: number,
): boolean {
  if (!from || !to) return true;
  return minutes >= toMinutes(from) && minutes <= toMinutes(to);
}
