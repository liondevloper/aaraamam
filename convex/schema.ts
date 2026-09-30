import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  orderLineV,
  orderStatusV,
  orderTypeV,
  settingsFields,
} from "./lib/validators";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  admins: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  // Single public settings document (theme, switches, content)
  settings: defineTable(settingsFields),

  // Admin-only settings (never sent to the public)
  privateSettings: defineTable({
    telegramEnabled: v.boolean(),
    botToken: v.string(),
    chatId: v.string(),
  }),

  counters: defineTable({ name: v.string(), value: v.number() }).index(
    "by_name",
    ["name"],
  ),

  categories: defineTable({
    slug: v.string(),
    nameEn: v.string(),
    nameAr: v.optional(v.string()),
    timeLabel: v.optional(v.string()),
    availableFrom: v.optional(v.string()),
    availableTo: v.optional(v.string()),
    sort: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"]),

  menuItems: defineTable({
    slug: v.string(),
    categoryId: v.id("categories"),
    nameEn: v.string(),
    nameAr: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    price: v.optional(v.number()),
    variants: v.optional(
      v.array(v.object({ label: v.string(), price: v.number() })),
    ),
    onRequest: v.boolean(),
    imageUrl: v.optional(v.string()),
    available: v.boolean(),
    popular: v.boolean(),
    sort: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"]),

  promoCodes: defineTable({
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrder: v.number(),
    expiresAt: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_code", ["code"]),

  orders: defineTable({
    orderNo: v.string(),
    trackingToken: v.string(),
    orderType: orderTypeV,
    status: orderStatusV,
    paymentMethod: v.string(),
    customerName: v.optional(v.string()),
    customerPhone: v.string(),
    addressText: v.optional(v.string()),
    addressExtra: v.optional(v.record(v.string(), v.string())),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    items: v.array(orderLineV),
    subtotal: v.number(),
    deliveryFee: v.number(),
    discount: v.number(),
    vatIncluded: v.number(),
    total: v.number(),
    promoCode: v.optional(v.string()),
    notes: v.optional(v.string()),
    riderName: v.optional(v.string()),
    riderPhone: v.optional(v.string()),
    riderToken: v.optional(v.string()),
    riderLat: v.optional(v.number()),
    riderLng: v.optional(v.number()),
    riderUpdatedAt: v.optional(v.number()),
  })
    .index("by_orderNo", ["orderNo"])
    .index("by_riderToken", ["riderToken"])
    .index("by_customerPhone", ["customerPhone"]),

  bookings: defineTable({
    bookingNo: v.string(),
    name: v.string(),
    phone: v.string(),
    bookingDate: v.string(),
    slot: v.string(),
    guests: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
    ),
  })
    .index("by_date_and_slot", ["bookingDate", "slot"])
    .index("by_phone", ["phone"])
    .index("by_date", ["bookingDate"]),
});
