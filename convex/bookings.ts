import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/auth";
import { dubaiNow, fromMinutes, toMinutes } from "./lib/time";
import { nextNumber } from "./lib/tokens";

async function slotsFor(ctx: QueryCtx, date: string) {
  const s = await ctx.db.query("settings").first();
  if (!s || !s.flags.booking) return [];
  const c = s.bookingConfig;
  const now = dubaiNow();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < now.date) return [];
  const maxDate = dubaiNow(Date.now() + c.maxDaysAhead * 86400000).date;
  if (date > maxDate || c.holidays.includes(date)) return [];
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (c.closedWeekdays.includes(weekday)) return [];

  const booked = await ctx.db.query("bookings").withIndex("by_date", (q) => q.eq("bookingDate", date)).take(1000);
  const used = new Map<string, number>();
  for (const b of booked) {
    if (b.status !== "cancelled") used.set(b.slot, (used.get(b.slot) ?? 0) + b.guests);
  }
  const out: { slot: string; remaining: number }[] = [];
  for (let m = toMinutes(c.open); m <= toMinutes(c.close); m += c.slotMinutes) {
    if (date === now.date && m <= now.minutes) continue;
    const slot = fromMinutes(m);
    out.push({ slot, remaining: c.capacityPerSlot - (used.get(slot) ?? 0) });
  }
  return out;
}

export const slots = query({
  args: { date: v.string() },
  handler: async (ctx, args) => slotsFor(ctx, args.date),
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    date: v.string(),
    slot: v.string(),
    guests: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ bookingNo: string }> => {
    const phone = args.phone.replace(/[^\d+]/g, "");
    if (!args.name.trim() || phone.length < 7 || phone.length > 16) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Enter your name and a valid phone" });
    }
    if (!Number.isInteger(args.guests) || args.guests < 1 || args.guests > 50) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Guests must be 1 to 50" });
    }
    const recent = await ctx.db
      .query("bookings")
      .withIndex("by_phone", (q) => q.eq("phone", phone).gt("_creationTime", Date.now() - 3600000))
      .take(3);
    if (recent.length >= 3) {
      throw new ConvexError({ code: "RATE_LIMITED", message: "Too many bookings. Try again later." });
    }
    const slot = (await slotsFor(ctx, args.date)).find((x) => x.slot === args.slot);
    if (!slot || slot.remaining < args.guests) {
      throw new ConvexError({ code: "CONFLICT", message: "That time is no longer available" });
    }
    const bookingNo = `BK-${await nextNumber(ctx, "booking")}`;
    await ctx.db.insert("bookings", {
      bookingNo,
      name: args.name.trim().slice(0, 80),
      phone,
      bookingDate: args.date,
      slot: args.slot,
      guests: args.guests,
      notes: args.notes?.trim().slice(0, 400) || undefined,
      status: "pending",
    });
    await ctx.scheduler.runAfter(0, internal.telegram.send, {
      text: `New booking ${bookingNo}\n${args.name} ${phone}\n${args.date} ${args.slot}, ${args.guests} guests\n${args.notes ?? ""}`,
    });
    return { bookingNo };
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("bookings").order("desc").take(300);
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("bookings", args.id, { status: args.status });
    return null;
  },
});
