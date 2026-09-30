import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/auth";
import { haversineKm } from "./lib/geo";
import { nextNumber, randomToken } from "./lib/tokens";
import { cartInputV, orderStatusV, orderTypeV } from "./lib/validators";

const fail = (code: string, message: string): never => {
  throw new ConvexError({ code, message });
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export const place = mutation({
  args: {
    orderType: orderTypeV,
    items: cartInputV,
    customerName: v.optional(v.string()),
    customerPhone: v.string(),
    addressText: v.optional(v.string()),
    addressExtra: v.optional(v.record(v.string(), v.string())),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    promoCode: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ orderNo: string; trackingToken: string }> => {
    const s = await ctx.db.query("settings").first();
    if (!s) return fail("BAD_REQUEST", "Restaurant not set up yet");
    if (!s.flags.ordering) return fail("BAD_REQUEST", "Online ordering is switched off");
    if (args.orderType === "delivery" && !s.flags.delivery) return fail("BAD_REQUEST", "Delivery is unavailable");
    if (args.orderType === "pickup" && !s.flags.pickup) return fail("BAD_REQUEST", "Pickup is unavailable");
    if (!s.flags.cod) return fail("BAD_REQUEST", "Cash on delivery is unavailable");

    const phone = args.customerPhone.replace(/[^\d+]/g, "");
    if (phone.length < 7 || phone.length > 16) return fail("BAD_REQUEST", "Enter a valid phone number");
    if (args.items.length === 0 || args.items.length > 60) return fail("BAD_REQUEST", "Your cart is empty");

    // Rate limit: 3 orders per phone in 10 minutes
    const recent = await ctx.db
      .query("orders")
      .withIndex("by_customerPhone", (q) =>
        q.eq("customerPhone", phone).gt("_creationTime", Date.now() - 10 * 60 * 1000),
      )
      .take(3);
    if (recent.length >= 3) return fail("RATE_LIMITED", "Too many orders. Please try again in a few minutes.");

    // Prices are always recomputed from the database.
    const lines: Doc<"orders">["items"] = [];
    let subtotal = 0;
    for (const line of args.items) {
      if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 50) return fail("BAD_REQUEST", "Invalid quantity");
      const item = await ctx.db
        .query("menuItems")
        .withIndex("by_slug", (q) => q.eq("slug", line.slug))
        .unique();
      if (!item || !item.available || item.onRequest) return fail("BAD_REQUEST", `An item is not available: ${line.slug}`);
      let unitPrice = item.price;
      if (item.variants && item.variants.length > 0) {
        const variant = item.variants.find((x) => x.label === line.variantLabel);
        if (!variant) return fail("BAD_REQUEST", `Choose a size for ${item.nameEn}`);
        unitPrice = variant.price;
      }
      if (unitPrice === undefined) return fail("BAD_REQUEST", "Item has no price");
      subtotal += unitPrice * line.qty;
      lines.push({
        slug: item.slug,
        name: item.nameEn,
        variantLabel: line.variantLabel,
        qty: line.qty,
        unitPrice,
      });
    }
    subtotal = round2(subtotal);

    let deliveryFee = 0;
    if (args.orderType === "delivery") {
      const d = s.delivery;
      if (!args.addressText?.trim()) return fail("BAD_REQUEST", "Please enter your delivery address");
      if (s.flags.mapPin) {
        if (args.lat === undefined || args.lng === undefined) return fail("BAD_REQUEST", "Please place the pin on the map");
        if (haversineKm(d.lat, d.lng, args.lat, args.lng) > d.radiusKm) {
          return fail("OUT_OF_AREA", `Sorry, you are outside our ${d.radiusKm} km delivery area`);
        }
      }
      for (const [key, f] of Object.entries(s.addressFields)) {
        if (f.on && f.required && !args.addressExtra?.[key]?.trim()) {
          return fail("BAD_REQUEST", `${f.labelEn} is required`);
        }
      }
      if (subtotal < d.minOrder) return fail("BAD_REQUEST", `Minimum delivery order is AED ${d.minOrder}`);
      deliveryFee = d.fee;
    }

    let discount = 0;
    let promoCode: string | undefined;
    if (args.promoCode?.trim()) {
      const code = args.promoCode.trim().toUpperCase();
      const promo = await ctx.db.query("promoCodes").withIndex("by_code", (q) => q.eq("code", code)).unique();
      if (!promo || !promo.active) return fail("BAD_REQUEST", "Invalid promo code");
      if (promo.expiresAt && promo.expiresAt < new Date().toISOString()) return fail("BAD_REQUEST", "Promo code expired");
      if (subtotal < promo.minOrder) return fail("BAD_REQUEST", `Promo needs a minimum of AED ${promo.minOrder}`);
      discount = promo.type === "percent" ? (subtotal * promo.value) / 100 : promo.value;
      discount = round2(Math.min(discount, subtotal));
      promoCode = promo.code;
    }

    const total = round2(subtotal - discount + deliveryFee);
    const vatIncluded = round2((total * s.vatPercent) / (100 + s.vatPercent));
    const orderNo = `AR-${await nextNumber(ctx, "order")}`;
    const trackingToken = randomToken();

    await ctx.db.insert("orders", {
      orderNo,
      trackingToken,
      orderType: args.orderType,
      status: "new",
      paymentMethod: "cod",
      customerName: args.customerName?.trim().slice(0, 80) || undefined,
      customerPhone: phone,
      addressText: args.orderType === "delivery" ? args.addressText?.trim().slice(0, 400) : undefined,
      addressExtra: args.orderType === "delivery" ? args.addressExtra : undefined,
      lat: args.orderType === "delivery" ? args.lat : undefined,
      lng: args.orderType === "delivery" ? args.lng : undefined,
      items: lines,
      subtotal,
      deliveryFee,
      discount,
      vatIncluded,
      total,
      promoCode,
      notes: args.notes?.trim().slice(0, 400) || undefined,
    });

    const maps = args.lat !== undefined && args.lng !== undefined ? `\nhttps://maps.google.com/?q=${args.lat},${args.lng}` : "";
    const text =
      `New order ${orderNo} (${args.orderType})\n` +
      lines.map((l) => `${l.qty} x ${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ""}`).join("\n") +
      `\nTotal: AED ${total.toFixed(2)} (Cash on delivery)\n` +
      `${args.customerName ?? ""} ${phone}\n${args.addressText ?? "Pickup"}${maps}`;
    await ctx.scheduler.runAfter(0, internal.telegram.send, { text });

    return { orderNo, trackingToken };
  },
});

export const quote = query({
  args: { code: v.string(), subtotal: v.number() },
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    const promo = await ctx.db.query("promoCodes").withIndex("by_code", (q) => q.eq("code", code)).unique();
    if (!promo || !promo.active) return { valid: false as const, message: "Invalid promo code" };
    if (promo.expiresAt && promo.expiresAt < new Date().toISOString()) return { valid: false as const, message: "Promo code expired" };
    if (args.subtotal < promo.minOrder) return { valid: false as const, message: `Minimum order AED ${promo.minOrder}` };
    const raw = promo.type === "percent" ? (args.subtotal * promo.value) / 100 : promo.value;
    return { valid: true as const, discount: round2(Math.min(raw, args.subtotal)) };
  },
});

// Public, token protected. Rider position only while out for delivery.
export const tracking = query({
  args: { orderNo: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const o = await ctx.db.query("orders").withIndex("by_orderNo", (q) => q.eq("orderNo", args.orderNo)).unique();
    if (!o || o.trackingToken !== args.token) return null;
    const s = await ctx.db.query("settings").first();
    const live = o.status === "out_for_delivery";
    const showPos = live && (s?.flags.tracking ?? true);
    return {
      orderNo: o.orderNo,
      status: o.status,
      orderType: o.orderType,
      items: o.items,
      total: o.total,
      destLat: o.lat,
      destLng: o.lng,
      riderName: live ? o.riderName : undefined,
      riderPhone: live ? o.riderPhone : undefined,
      riderLat: showPos ? o.riderLat : undefined,
      riderLng: showPos ? o.riderLng : undefined,
    };
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").take(200);
  },
});

export const setStatus = mutation({
  args: { id: v.id("orders"), status: orderStatusV },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const o = await ctx.db.get("orders", args.id);
    if (!o) return fail("NOT_FOUND", "Order not found");
    const finished = ["delivered", "cancelled", "rejected"].includes(args.status);
    await ctx.db.patch("orders", args.id, {
      status: args.status,
      ...(finished
        ? { riderToken: undefined, riderLat: undefined, riderLng: undefined, riderUpdatedAt: undefined }
        : {}),
    });
    return null;
  },
});

export const assignRider = mutation({
  args: { id: v.id("orders"), riderName: v.string(), riderPhone: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const token = randomToken();
    await ctx.db.patch("orders", args.id, {
      riderName: args.riderName.trim(),
      riderPhone: args.riderPhone.trim(),
      riderToken: token,
    });
    return token;
  },
});
