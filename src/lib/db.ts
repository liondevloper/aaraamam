/**
 * Typed helpers that map 1-to-1 with the old Convex api calls.
 * All components import from here so swapping the backend is one file.
 */
import { supabase } from './supabase.ts';
import type { StoreConfig } from './store.ts';

// ── Types ────────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  created_at: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  time_label: string | null;
  available_from: string | null;
  available_to: string | null;
  sort: number;
  active: boolean;
};

export type MenuChannel = 'dine_in' | 'delivery';

export type MenuItem = {
  id: string;
  created_at: string;
  category_id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  price: number | null;
  variants: { label: string; price: number }[] | null;
  on_request: boolean;
  image_url: string | null;
  available: boolean;
  popular: boolean;
  sort: number;
  /** Which menus show this dish: table (dine_in) and/or home (delivery + pickup). */
  channels: MenuChannel[];
};

export type OrderItem = { name: string; variantLabel?: string; qty: number; unitPrice: number };

export type OrderType = 'delivery' | 'pickup' | 'dine_in';

export type Order = {
  id: string;
  created_at: string;
  updated_at: string;
  order_no: string;
  order_type: OrderType;
  status: 'new' | 'accepted' | 'preparing' | 'out_for_delivery' | 'ready' | 'delivered' | 'rejected' | 'cancelled';
  customer_name: string | null;
  customer_phone: string;
  address_text: string | null;
  address_extra: Record<string, string> | null;
  lat: number | null;
  lng: number | null;
  items: OrderItem[];
  total: number;
  promo_code: string | null;
  discount: number;
  notes: string | null;
  tracking_token: string;
  rider_token: string | null;
  rider_name: string | null;
  rider_phone: string | null;
  rider_lat: number | null;
  rider_lng: number | null;
  table_no: string | null;
  booking_no: string | null;
};

export type Booking = {
  id: string;
  created_at: string;
  booking_no: string;
  booking_date: string;
  slot: string;
  guests: number;
  name: string;
  phone: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type Promo = {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  active: boolean;
};

export type Settings = {
  id: number;
  restaurant_name: string;
  theme: string;
  primary_color: string | null;
  vat_percent: number;
  flags: {
    ordering: boolean;
    booking: boolean;
    delivery: boolean;
    pickup: boolean;
    cod: boolean;
    mapPin: boolean;
    autofill: boolean;
    tracking: boolean;
  };
  delivery: {
    lat: number;
    lng: number;
    radiusKm: number;
    fee: number;
    minOrder: number;
  };
  address_fields: Record<string, { on: boolean; required: boolean; labelEn: string; labelAr: string }>;
  booking_config: {
    open: string;
    close: string;
    slotMinutes: number;
    capacityPerSlot: number;
    maxDaysAhead: number;
    closedWeekdays: number[];
    holidays: string[];
  };
  content: {
    heroTitleEn: string;
    heroTitleAr: string;
    heroSubtitleEn: string;
    heroSubtitleAr: string;
    offerBannerEn: string;
    offerBannerAr: string;
    aboutEn: string;
    aboutAr: string;
    phone: string;
    whatsapp: string;
    address: string;
    openingHours: string;
    heroImage: string;
    aboutImage: string;
    gallery: string[];
  };
  /** Live shift / timetable / maintenance state. Only change it through updateStore(). */
  store: StoreConfig;
};

export type SettingsPrivate = {
  id: number;
  telegram_enabled: boolean;
  bot_token: string;
  chat_id: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function randomToken(len = 24): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, len);
}

// ── Menu ────────────────────────────────────────────────────────────────────

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveCategory(cat: Partial<Category> & { name_en: string; slug: string }): Promise<void> {
  if (cat.id) {
    const { error } = await supabase.from('categories').update(cat).eq('id', cat.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('categories').insert(cat);
    if (error) throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function saveItem(item: Partial<MenuItem> & { name_en: string; slug: string; category_id: string }): Promise<void> {
  if (item.id) {
    const { error } = await supabase.from('menu_items').update(item).eq('id', item.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('menu_items').insert(item);
    if (error) throw error;
  }
}

export async function setItemAvailable(id: string, available: boolean): Promise<void> {
  const { error } = await supabase.from('menu_items').update({ available }).eq('id', id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

// ── Orders ──────────────────────────────────────────────────────────────────

/** Prices, promo, fee and open/closed state are checked server-side in the `place_order` RPC. */
export async function placeOrder(params: {
  orderType: OrderType;
  items: { slug: string; variantLabel?: string; qty: number }[];
  customerName?: string;
  customerPhone?: string;
  addressText?: string;
  addressExtra?: Record<string, string>;
  lat?: number;
  lng?: number;
  promoCode?: string;
  notes?: string;
  tableNo?: string;
  bookingNo?: string;
}): Promise<{ orderNo: string; trackingToken: string }> {
  const { data, error } = await supabase.rpc('place_order', {
    p_order_type: params.orderType,
    p_items: params.items.map((l) => ({ slug: l.slug, variantLabel: l.variantLabel ?? null, qty: l.qty })),
    p_customer_name: params.customerName ?? null,
    p_customer_phone: params.customerPhone ?? null,
    p_address_text: params.addressText ?? null,
    p_address_extra: params.addressExtra ?? null,
    p_lat: params.lat ?? null,
    p_lng: params.lng ?? null,
    p_promo_code: params.promoCode ?? null,
    p_notes: params.notes ?? null,
    p_table_no: params.tableNo ?? null,
    p_booking_no: params.bookingNo ?? null,
  });
  if (error) throw error;
  return data as { orderNo: string; trackingToken: string };
}

export async function getOrderByToken(orderNo: string, token: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('get_order_by_token', { p_order_no: orderNo, p_token: token });
  if (error) return null;
  return (data as Order[] | null)?.[0] ?? null;
}

export async function listOrdersForAdmin(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function setOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function assignRider(id: string, riderName: string, riderPhone: string): Promise<string> {
  const token = randomToken();
  const { error } = await supabase.from('orders').update({ rider_name: riderName, rider_phone: riderPhone, rider_token: token }).eq('id', id);
  if (error) throw error;
  return token;
}

export async function getOrderByRiderToken(token: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('get_order_by_rider', { p_token: token });
  if (error) return null;
  return (data as Order[] | null)?.[0] ?? null;
}

export async function updateRiderLocation(token: string, action: string, lat?: number, lng?: number): Promise<void> {
  const { error } = await supabase.rpc('rider_update', {
    p_token: token,
    p_action: action,
    p_lat: lat ?? null,
    p_lng: lng ?? null,
  });
  if (error) throw error;
}

export async function quotePromo(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message?: string }> {
  const { data: promo } = await supabase.from('promos').select('*').eq('code', code.toUpperCase()).eq('active', true).maybeSingle();
  if (!promo) return { valid: false, discount: 0, message: 'Invalid promo code' };
  if (subtotal < promo.min_order) return { valid: false, discount: 0, message: `Min order AED ${promo.min_order}` };
  const discount = promo.type === 'percent' ? Math.round(subtotal * promo.value) / 100 : Math.min(promo.value, subtotal);
  return { valid: true, discount };
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookingSlots(date: string, config: Settings['booking_config']): Promise<{ slot: string; remaining: number }[]> {
  const { open, close, slotMinutes, capacityPerSlot, closedWeekdays, holidays } = config;
  const d = new Date(date + 'T00:00:00');
  if (closedWeekdays.includes(d.getDay())) return [];
  if (holidays.includes(date)) return [];

  const slots: string[] = [];
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  for (let t = oh * 60 + om; t < ch * 60 + cm; t += slotMinutes) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  }

  // Bookings are private; the RPC only returns aggregated guest counts per slot.
  const { data: usage } = await supabase.rpc('booking_usage', { p_date: date });
  const used: Record<string, number> = {};
  for (const u of (usage as { slot: string; used: number }[] | null) ?? []) {
    used[u.slot] = Number(u.used);
  }

  return slots.map((slot) => ({ slot, remaining: capacityPerSlot - (used[slot] ?? 0) })).filter((s) => s.remaining > 0);
}

export async function createBooking(params: { name: string; phone: string; date: string; slot: string; guests: number; notes?: string; config: Settings['booking_config'] }): Promise<{ bookingNo: string }> {
  const { data, error } = await supabase.rpc('create_booking', {
    p_name: params.name,
    p_phone: params.phone,
    p_date: params.date,
    p_slot: params.slot,
    p_guests: params.guests,
    p_notes: params.notes ?? null,
  });
  if (error) throw error;
  return { bookingNo: data as string };
}

export async function listBookingsForAdmin(): Promise<Booking[]> {
  const { data, error } = await supabase.from('bookings').select('*').order('booking_date').order('slot');
  if (error) throw error;
  return data ?? [];
}

export async function setBookingStatus(id: string, status: Booking['status']): Promise<void> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
}

// ── Promos ───────────────────────────────────────────────────────────────────

export async function listPromos(): Promise<Promo[]> {
  const { data, error } = await supabase.from('promos').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function createPromo(p: { code: string; type: 'percent' | 'fixed'; value: number; minOrder: number }): Promise<void> {
  const { error } = await supabase.from('promos').insert({ code: p.code.toUpperCase(), type: p.type, value: p.value, min_order: p.minOrder });
  if (error) throw error;
}

export async function setPromoActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('promos').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function deletePromo(id: string): Promise<void> {
  const { error } = await supabase.from('promos').delete().eq('id', id);
  if (error) throw error;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

/** `store` is left out on purpose: it is changed only through updateStore(). */
export async function updateSettings(values: Partial<Omit<Settings, 'store'>>): Promise<void> {
  const { error } = await supabase.from('settings').update(values).eq('id', 1);
  if (error) throw error;
}

/** Merges into settings.store on the server, so two admins never overwrite each other. */
export async function updateStore(patch: Partial<StoreConfig>): Promise<void> {
  const { error } = await supabase.rpc('update_store', { p_patch: patch });
  if (error) throw error;
}

export async function getSettingsPrivate(): Promise<SettingsPrivate> {
  const { data, error } = await supabase.from('settings_private').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function updateSettingsPrivate(values: Partial<SettingsPrivate>): Promise<void> {
  const { error } = await supabase.from('settings_private').update(values).eq('id', 1);
  if (error) throw error;
}

// ── Admin Auth ────────────────────────────────────────────────────────────────

export async function getAdminStatus(): Promise<{ signedIn: boolean; isAdmin: boolean; canClaim: boolean }> {
  const { data, error } = await supabase.rpc('admin_status');
  if (error || !data) return { signedIn: false, isAdmin: false, canClaim: false };
  return data as { signedIn: boolean; isAdmin: boolean; canClaim: boolean };
}

export async function claimAdmin(): Promise<void> {
  const { error } = await supabase.rpc('claim_admin');
  if (error) throw error;
}

// ── Image Upload ──────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('images').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}

// ── Telegram (admin only; bot token is private) ───────────────────────────────

export async function sendTelegramTest(): Promise<void> {
  const priv = await getSettingsPrivate();
  if (!priv.telegram_enabled || !priv.bot_token || !priv.chat_id) throw new Error('Telegram not configured');
  const res = await fetch(`https://api.telegram.org/bot${priv.bot_token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: priv.chat_id, text: 'Aaraamam test message' }),
  });
  if (!res.ok) throw new Error('Failed to send');
}
