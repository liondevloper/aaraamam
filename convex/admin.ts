import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isAdmin, OPEN_ADMIN_DEMO, requireAdmin } from "./lib/auth";

export const status = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (OPEN_ADMIN_DEMO) return { signedIn: identity !== null, isAdmin: true, canClaim: false };
    if (!identity) return { signedIn: false, isAdmin: false, canClaim: false };
    const admin = await isAdmin(ctx);
    const anyAdmin = await ctx.db.query("admins").first();
    return {
      signedIn: true,
      isAdmin: admin,
      canClaim: !admin && anyAdmin === null,
    };
  },
});

// The first signed-in person to claim becomes the owner/admin.
export const claim = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in first" });
    }
    if (await ctx.db.query("admins").first()) {
      throw new ConvexError({ code: "FORBIDDEN", message: "An admin already exists" });
    }
    await ctx.db.insert("admins", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name,
      email: identity.email,
    });
    return null;
  },
});

export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("admins").take(50);
  },
});

export const removeAdmin = mutation({
  args: { id: v.id("admins") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("admins").take(2);
    if (all.length <= 1) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Cannot remove the last admin" });
    }
    await ctx.db.delete("admins", args.id);
    return null;
  },
});
