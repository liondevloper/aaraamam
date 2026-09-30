import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { DEFAULT_SETTINGS } from "./lib/defaults";
import { settingsObjV } from "./lib/validators";

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("settings").first();
    if (!doc) return DEFAULT_SETTINGS;
    const { _id, _creationTime, ...rest } = doc;
    void _id;
    void _creationTime;
    return rest;
  },
});

export const update = mutation({
  args: { values: settingsObjV },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.query("settings").first();
    if (doc) await ctx.db.replace("settings", doc._id, args.values);
    else await ctx.db.insert("settings", args.values);
    return null;
  },
});

export const getPrivate = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.query("privateSettings").first();
    return {
      telegramEnabled: doc?.telegramEnabled ?? false,
      botToken: doc?.botToken ?? "",
      chatId: doc?.chatId ?? "",
    };
  },
});

export const updatePrivate = mutation({
  args: {
    telegramEnabled: v.boolean(),
    botToken: v.string(),
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.botToken.length > 200 || args.chatId.length > 100) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Value too long" });
    }
    const doc = await ctx.db.query("privateSettings").first();
    if (doc) await ctx.db.replace("privateSettings", doc._id, args);
    else await ctx.db.insert("privateSettings", args);
    return null;
  },
});
