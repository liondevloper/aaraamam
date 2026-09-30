"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Never throws: a Telegram failure must not affect orders or bookings.
export const send = internalAction({
  args: { text: v.string() },
  handler: async (ctx, args): Promise<null> => {
    try {
      const cfg = await ctx.runQuery(internal.telegramData.getConfig, {});
      if (!cfg.telegramEnabled || !cfg.botToken || !cfg.chatId) return null;
      const res = await fetch(
        `https://api.telegram.org/bot${cfg.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: cfg.chatId, text: args.text }),
        },
      );
      if (!res.ok) console.error("Telegram error", res.status);
    } catch (e) {
      console.error("Telegram failed", e);
    }
    return null;
  },
});
