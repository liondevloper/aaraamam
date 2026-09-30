import { ConvexError } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/auth";

export const getConfig = internalQuery({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("privateSettings").first();
    return {
      telegramEnabled: doc?.telegramEnabled ?? false,
      botToken: doc?.botToken ?? "",
      chatId: doc?.chatId ?? "",
    };
  },
});

export const sendTest = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const cfg = await ctx.db.query("privateSettings").first();
    if (!cfg?.telegramEnabled || !cfg.botToken || !cfg.chatId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Enable Telegram and save the bot token and chat ID first",
      });
    }
    await ctx.scheduler.runAfter(0, internal.telegram.send, {
      text: "Test message from Aaraamam admin",
    });
    return null;
  },
});
