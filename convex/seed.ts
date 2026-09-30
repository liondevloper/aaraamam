import { mutation } from "./_generated/server";
import { DEFAULT_SETTINGS } from "./lib/defaults";
import { ITEM_IMAGES, MENU_SEED, POPULAR, slugify } from "./lib/menuData";

// Idempotent: fills settings and the menu only when they are empty.
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    if (!(await ctx.db.query("settings").first())) {
      await ctx.db.insert("settings", DEFAULT_SETTINGS);
    }
    if (await ctx.db.query("categories").first()) return null;

    let catSort = 0;
    for (const cat of MENU_SEED) {
      const categoryId = await ctx.db.insert("categories", {
        slug: cat.slug,
        nameEn: cat.name,
        nameAr: cat.nameAr,
        timeLabel: cat.label,
        availableFrom: cat.from,
        availableTo: cat.to,
        sort: catSort++,
        active: true,
      });
      let sort = 0;
      for (const it of cat.items) {
        const slug = slugify(it.n);
        await ctx.db.insert("menuItems", {
          slug,
          categoryId,
          nameEn: it.n,
          price: it.p,
          variants:
            it.h !== undefined && it.f !== undefined
              ? [
                  { label: "Half", price: it.h },
                  { label: "Full", price: it.f },
                ]
              : undefined,
          onRequest: it.req === true,
          imageUrl: ITEM_IMAGES[slug],
          available: true,
          popular: POPULAR.has(slug),
          sort: sort++,
        });
      }
    }
    return null;
  },
});
