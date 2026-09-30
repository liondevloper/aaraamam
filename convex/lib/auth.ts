import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server";

// DEMO ONLY: lets anyone open the admin panel without signing in.
// Set to false before the real launch.
export const OPEN_ADMIN_DEMO = true;

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
