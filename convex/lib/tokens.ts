import type { MutationCtx } from "../_generated/server";

// Opaque, hard-to-guess token for tracking and rider links.
export function randomToken(): string {
  return crypto.randomUUID();
}

// Sequential counter (order and booking numbers), starting at 1001.
export async function nextNumber(
  ctx: MutationCtx,
  name: "order" | "booking",
): Promise<number> {
  const row = await ctx.db
    .query("counters")
    .withIndex("by_name", (q) => q.eq("name", name))
    .unique();
  if (!row) {
    await ctx.db.insert("counters", { name, value: 1001 });
    return 1001;
  }
  await ctx.db.patch("counters", row._id, { value: row.value + 1 });
  return row.value + 1;
}
