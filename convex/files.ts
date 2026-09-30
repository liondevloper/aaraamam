import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new ConvexError({ code: "NOT_FOUND", message: "File not found" });
    return url;
  },
});
