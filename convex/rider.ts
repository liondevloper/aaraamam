import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";

const getByToken = async (ctx: QueryCtx, token: string) => {
  const o = await ctx.db.query("orders").withIndex("by_riderToken", (q) => q.eq("riderToken", token)).unique();
  return o;
};

export const get = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const o = await getByToken(ctx, args.token);
    if (!o) return null;
    return {
      orderNo: o.orderNo,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      addressText: o.addressText,
      destLat: o.lat,
      destLng: o.lng,
      total: o.total,
      paymentMethod: o.paymentMethod,
    };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    action: v.union(
      v.literal("location"),
      v.literal("picked_up"),
      v.literal("on_the_way"),
      v.literal("delivered"),
    ),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const o = await ctx.db.query("orders").withIndex("by_riderToken", (q) => q.eq("riderToken", args.token)).unique();
    if (!o) throw new ConvexError({ code: "NOT_FOUND", message: "Link expired" });

    if (args.action === "picked_up" || args.action === "on_the_way") {
      await ctx.db.patch("orders", o._id, { status: "out_for_delivery" });
    } else if (args.action === "delivered") {
      await ctx.db.patch("orders", o._id, {
        status: "delivered",
        riderToken: undefined,
        riderLat: undefined,
        riderLng: undefined,
        riderUpdatedAt: undefined,
      });
    } else {
      const s = await ctx.db.query("settings").first();
      if (o.status !== "out_for_delivery" || !(s?.flags.tracking ?? true)) return null;
      if (args.lat === undefined || args.lng === undefined) return null;
      // Ignore updates arriving less than 5 seconds apart
      if (o.riderUpdatedAt && Date.now() - o.riderUpdatedAt < 5000) return null;
      await ctx.db.patch("orders", o._id, { riderLat: args.lat, riderLng: args.lng, riderUpdatedAt: Date.now() });
    }
    return null;
  },
});
