export const money = (n: number): string => `AED ${n.toFixed(2).replace(/\.00$/, "")}`;

export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

export function dubaiMinutesNow(): number {
  const d = new Date(Date.now() + 4 * 3600 * 1000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function inWindow(from: string | undefined, to: string | undefined): boolean {
  if (!from || !to) return true;
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const now = dubaiMinutesNow();
  return now >= toMin(from) && now <= toMin(to);
}

// Reverse geocoding lives in one function so the provider can be swapped later.
let lastCall = 0;
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const wait = 1000 - (Date.now() - lastCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

export const mapsLink = (lat: number, lng: number): string =>
  `https://www.google.com/maps?q=${lat},${lng}`;
