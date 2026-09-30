import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server";

// When true, anyone could open the admin panel (and read the Telegram bot token)
// without signing in. Kept off: the owner signs in on /admin and clicks "Become admin".
export const OPEN_ADMIN_DEMO = false;

export async function isAdmin(ctx: QueryCtx): Promise<boolean> {
  if (OPEN_ADMIN_DEMO) return true;
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const admin = await ctx.db
    .query("admins")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  return admin !== null;
}

export async function requireAdmin(ctx: QueryCtx): Promise<void> {
  if (!(await isAdmin(ctx))) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Admin access only" });
  }
}
