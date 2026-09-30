/**
 * Typed helpers that map 1-to-1 with the old Convex api calls.
 * All components import from here so swapping the backend is one file.
 */
import { supabase } from './supabase.ts';

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
};

export type OrderItem = { name: string; variantLabel?: string; qty: number; unitPrice: number };

export type Order = {
  id: string;
  created_at: string;
  order_no: string;
  order_type: 'delivery' | 'pickup';
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

function orderNo(): string {
  return 'ORD-' + Date.now().toString(36).toUpperCase();
}

function bookingNo(): string {
  return 'BK-' + Date.now().toString(36).toUpperCase();
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

export async function placeOrder(params: {
  orderType: 'delivery' | 'pickup';
  items: { slug: string; variantLabel?: string; qty: number }[];
  customerName?: string;
  customerPhone: string;
  addressText?: string;
  addressExtra?: Record<string, string>;
  lat?: number;
  lng?: number;
  promoCode?: string;
  notes?: string;
  menuItems: MenuItem[];
  settings: Settings;
}): Promise<{ orderNo: string; trackingToken: string }> {
  const { orderType, items: cartLines, menuItems, settings, promoCode } = params;

  // Resolve prices
  const resolved = cartLines.map((line) => {
    const mi = menuItems.find((m) => m.slug === line.slug);
    if (!mi) throw new Error('Item not found: ' + line.slug);
    const price = line.variantLabel
      ? (mi.variants?.find((v) => v.label === line.variantLabel)?.price ?? 0)
      : (mi.price ?? 0);
    return { name: mi.name_en, variantLabel: line.variantLabel, qty: line.qty, unitPrice: price };
  });

  const subtotal = resolved.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  // Promo
  let discount = 0;
  if (promoCode) {
    const { data: promo } = await supabase.from('promos').select('*').eq('code', promoCode).eq('active', true).single();
    if (promo && subtotal >= promo.min_order) {
      discount = promo.type === 'percent' ? Math.round(subtotal * promo.value) / 100 : promo.value;
    }
  }

  const fee = orderType === 'delivery' ? settings.delivery.fee : 0;
  const total = Math.round((subtotal - discount + fee) * 100) / 100;

  const trackingToken = randomToken();
  const no = orderNo();

  const { error } = await supabase.from('orders').insert({
    order_no: no,
    order_type: orderType,
    customer_name: params.customerName ?? null,
    customer_phone: params.customerPhone,
    address_text: params.addressText ?? null,
    address_extra: params.addressExtra ?? null,
    lat: params.lat ?? null,
    lng: params.lng ?? null,
    items: resolved,
    total,
    promo_code: promoCode ?? null,
    discount,
    notes: params.notes ?? null,
    tracking_token: trackingToken,
  });
  if (error) throw error;

  // Telegram notification (fire and forget)
  void sendTelegramOrderAlert(no, params.customerPhone, total);

  return { orderNo: no, trackingToken };
}

export async function getOrderByToken(orderNo: string, token: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_no', orderNo)
    .eq('tracking_token', token)
    .single();
  if (error) return null;
  return data;
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
  const { data, error } = await supabase.from('orders').select('*').eq('rider_token', token).single();
  if (error) return null;
  return data;
}

export async function updateRiderLocation(token: string, action: string, lat?: number, lng?: number): Promise<void> {
  const order = await getOrderByRiderToken(token);
  if (!order) throw new Error('Order not found');
  if (action === 'picked_up') {
    await supabase.from('orders').update({ status: 'out_for_delivery' }).eq('rider_token', token);
  } else if (action === 'location' && lat !== undefined && lng !== undefined) {
    await supabase.from('orders').update({ rider_lat: lat, rider_lng: lng }).eq('rider_token', token);
  } else if (action === 'on_the_way') {
    await supabase.from('orders').update({ status: 'out_for_delivery' }).eq('rider_token', token);
  } else if (action === 'delivered') {
    await supabase.from('orders').update({ status: 'delivered' }).eq('rider_token', token);
  }
}

export async function quotePromo(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message?: string }> {
  const { data: promo } = await supabase.from('promos').select('*').eq('code', code).eq('active', true).single();
  if (!promo) return { valid: false, discount: 0, message: 'Invalid promo code' };
  if (subtotal < promo.min_order) return { valid: false, discount: 0, message: `Min order AED ${promo.min_order}` };
  const discount = promo.type === 'percent' ? Math.round(subtotal * promo.value) / 100 : promo.value;
  return { valid: true, discount };
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookingSlots(date: string, config: Settings['booking_config']): Promise<{ slot: string; remaining: number }[]> {
  const { open, close, slotMinutes, capacityPerSlot, closedWeekdays, holidays } = config;
  const d = new Date(date + 'T00:00:00');
  if (closedWeekdays.includes(d.getDay())) return [];
  if (holidays.includes(date)) return [];

  const slots: string[] = [];
  let [h, m] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  while (h * 60 + m < ch * 60 + cm) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += slotMinutes;
    if (m >= 60) { h += Math.floor(m / 60); m %= 60; }
  }

  const { data: existing } = await supabase
    .from('bookings')
    .select('slot, guests')
    .eq('booking_date', date)
    .neq('status', 'cancelled');

  const used: Record<string, number> = {};
  for (const b of existing ?? []) {
    used[b.slot] = (used[b.slot] ?? 0) + b.guests;
  }

  return slots.map((slot) => ({ slot, remaining: capacityPerSlot - (used[slot] ?? 0) })).filter((s) => s.remaining > 0);
}

export async function createBooking(params: { name: string; phone: string; date: string; slot: string; guests: number; notes?: string; config: Settings['booking_config'] }): Promise<{ bookingNo: string }> {
  const slots = await getBookingSlots(params.date, params.config);
  const s = slots.find((x) => x.slot === params.slot);
  if (!s || s.remaining < params.guests) throw new Error('Slot not available');
  const no = bookingNo();
  const { error } = await supabase.from('bookings').insert({
    booking_no: no,
    booking_date: params.date,
    slot: params.slot,
    guests: params.guests,
    name: params.name,
    phone: params.phone,
    notes: params.notes ?? null,
  });
  if (error) throw error;
  return { bookingNo: no };
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

export async function updateSettings(values: Partial<Settings>): Promise<void> {
  const { error } = await supabase.from('settings').update(values).eq('id', 1);
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { signedIn: false, isAdmin: false, canClaim: false };
  const { data: adminRow } = await supabase.from('admins').select('id').eq('user_id', user.id).single();
  if (adminRow) return { signedIn: true, isAdmin: true, canClaim: false };
  const { count } = await supabase.from('admins').select('id', { count: 'exact', head: true });
  return { signedIn: true, isAdmin: false, canClaim: (count ?? 0) === 0 };
}

export async function claimAdmin(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { count } = await supabase.from('admins').select('id', { count: 'exact', head: true });
  if ((count ?? 0) > 0) throw new Error('Admin already exists');
  const { error } = await supabase.from('admins').insert({ user_id: user.id });
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

// ── Telegram (best-effort) ────────────────────────────────────────────────────

async function sendTelegramOrderAlert(orderNo: string, phone: string, total: number): Promise<void> {
  try {
    const priv = await getSettingsPrivate();
    if (!priv.telegram_enabled || !priv.bot_token || !priv.chat_id) return;
    const text = `🔔 New order ${orderNo}\nPhone: ${phone}\nTotal: AED ${total.toFixed(2)}`;
    await fetch(`https://api.telegram.org/bot${priv.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: priv.chat_id, text }),
    });
  } catch {
    // silent
  }
}

export async function sendTelegramTest(): Promise<void> {
  const priv = await getSettingsPrivate();
  if (!priv.telegram_enabled || !priv.bot_token || !priv.chat_id) throw new Error('Telegram not configured');
  const res = await fetch(`https://api.telegram.org/bot${priv.bot_token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: priv.chat_id, text: '✅ Aaraamam test message' }),
  });
  if (!res.ok) throw new Error('Failed to send');
}
