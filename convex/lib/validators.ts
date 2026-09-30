import { v, type Infer } from "convex/values";

export const addressFieldV = v.object({
  on: v.boolean(),
  required: v.boolean(),
  labelEn: v.string(),
  labelAr: v.string(),
});

export const flagsV = v.object({
  ordering: v.boolean(),
  booking: v.boolean(),
  delivery: v.boolean(),
  pickup: v.boolean(),
  cod: v.boolean(),
  mapPin: v.boolean(),
  autofill: v.boolean(),
  tracking: v.boolean(),
});

export const deliveryV = v.object({
  radiusKm: v.number(),
  fee: v.number(),
  minOrder: v.number(),
  lat: v.number(),
  lng: v.number(),
});

export const addressFieldsV = v.object({
  building: addressFieldV,
  floor: addressFieldV,
  landmark: addressFieldV,
  notes: addressFieldV,
});

export const bookingConfigV = v.object({
  open: v.string(),
  close: v.string(),
  slotMinutes: v.number(),
  capacityPerSlot: v.number(),
  closedWeekdays: v.array(v.number()),
  holidays: v.array(v.string()),
  maxDaysAhead: v.number(),
});

export const contentV = v.object({
  heroTitleEn: v.string(),
  heroTitleAr: v.string(),
  heroSubtitleEn: v.string(),
  heroSubtitleAr: v.string(),
  aboutEn: v.string(),
  aboutAr: v.string(),
  phone: v.string(),
  whatsapp: v.string(),
  address: v.string(),
  openingHours: v.string(),
  offerBannerEn: v.string(),
  offerBannerAr: v.string(),
  heroImage: v.string(),
  aboutImage: v.string(),
  gallery: v.array(v.string()),
});

export const settingsFields = {
  restaurantName: v.string(),
  theme: v.string(),
  primaryColor: v.optional(v.string()),
  flags: flagsV,
  vatPercent: v.number(),
  delivery: deliveryV,
  addressFields: addressFieldsV,
  bookingConfig: bookingConfigV,
  content: contentV,
};

export const settingsObjV = v.object(settingsFields);
export type SettingsValues = Infer<typeof settingsObjV>;

export const orderStatusV = v.union(
  v.literal("new"),
  v.literal("accepted"),
  v.literal("preparing"),
  v.literal("out_for_delivery"),
  v.literal("ready"),
  v.literal("delivered"),
  v.literal("rejected"),
  v.literal("cancelled"),
);

export const orderTypeV = v.union(v.literal("delivery"), v.literal("pickup"));

export const orderLineV = v.object({
  slug: v.string(),
  name: v.string(),
  variantLabel: v.optional(v.string()),
  qty: v.number(),
  unitPrice: v.number(),
});

export const cartInputV = v.array(
  v.object({
    slug: v.string(),
    variantLabel: v.optional(v.string()),
    qty: v.number(),
  }),
);
