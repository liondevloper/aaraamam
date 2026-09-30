import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("promoCodes").take(200);
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrder: v.number(),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const code = args.code.trim().toUpperCase();
    if (!code || args.value <= 0) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Invalid promo" });
    }
    const exists = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (exists) {
      throw new ConvexError({ code: "CONFLICT", message: "Code already exists" });
    }
    await ctx.db.insert("promoCodes", { ...args, code, active: true });
    return null;
  },
});

export const setActive = mutation({
  args: { id: v.id("promoCodes"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("promoCodes", args.id, { active: args.active });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("promoCodes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete("promoCodes", args.id);
    return null;
  },
});
