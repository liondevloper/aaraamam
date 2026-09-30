import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query("categories").take(100);
    return cats.sort((a, b) => a.sort - b.sort);
  },
});

export const listItems = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").take(1000);
    return items.sort((a, b) => a.sort - b.sort);
  },
});

const variantsV = v.optional(
  v.array(v.object({ label: v.string(), price: v.number() })),
);

export const saveCategory = mutation({
  args: {
    id: v.optional(v.id("categories")),
    slug: v.string(),
    nameEn: v.string(),
    nameAr: v.optional(v.string()),
    timeLabel: v.optional(v.string()),
    availableFrom: v.optional(v.string()),
    availableTo: v.optional(v.string()),
    sort: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireAdmin(ctx);
    if (id) await ctx.db.replace("categories", id, data);
    else await ctx.db.insert("categories", data);
    return null;
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .take(500);
    for (const item of items) await ctx.db.delete("menuItems", item._id);
    await ctx.db.delete("categories", args.id);
    return null;
  },
});

export const saveItem = mutation({
  args: {
    id: v.optional(v.id("menuItems")),
    slug: v.string(),
    categoryId: v.id("categories"),
    nameEn: v.string(),
    nameAr: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    price: v.optional(v.number()),
    variants: variantsV,
    onRequest: v.boolean(),
    imageUrl: v.optional(v.string()),
    available: v.boolean(),
    popular: v.boolean(),
    sort: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireAdmin(ctx);
    if (id) await ctx.db.replace("menuItems", id, data);
    else await ctx.db.insert("menuItems", data);
    return null;
  },
});

export const deleteItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete("menuItems", args.id);
    return null;
  },
});

export const setAvailable = mutation({
  args: { id: v.id("menuItems"), available: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("menuItems", args.id, { available: args.available });
    return null;
  },
});
