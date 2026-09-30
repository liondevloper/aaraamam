import type { MenuItem, Settings } from "@/lib/db.ts";

// Default photos, used only where the admin has not uploaded one yet.
const u = (id: string) => `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`;

const HERO = u("photo-1788619378696-c77352c43a88");
const ABOUT = u("photo-1622021142947-da7dedc7c39a");

const DISHES = {
  thali: [u("photo-1789993494863-437bee68f8e6"), u("photo-1789993496277-33397db03554"), u("photo-1789993494855-1f89bb27fecb"), u("photo-1789993494828-735441249a30")],
  biryani: [u("photo-1625485617425-4eb8ed7d82d4")],
  fish: [u("photo-1620894580123-466ad3a0ca06")],
  rice: [u("photo-1722698030083-75d1d50cabe4"), u("photo-1620894592665-c68bdefed3fd")],
  snack: [u("photo-1632104667384-06f58cb7ad44"), u("photo-1575526854473-e85fdba07b7a")],
};

const GALLERY = [
  u("photo-1789993494863-437bee68f8e6"),
  u("photo-1651987442172-252621e0bd4a"),
  u("photo-1625485617425-4eb8ed7d82d4"),
  u("photo-1715148815485-a90444f6b68e"),
  u("photo-1620894580123-466ad3a0ca06"),
  u("photo-1789993496277-33397db03554"),
  u("photo-1670784770382-318de73ad331"),
  u("photo-1722698030083-75d1d50cabe4"),
  u("photo-1788619378696-c77352c43a88"),
];

const hash = (text: string): number => [...text].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);

// Picks a fitting photo from the dish name; other dishes cycle through the pool
export function dishImage(item: Pick<MenuItem, "name_en" | "slug" | "image_url">): string {
  if (item.image_url) return item.image_url;
  const name = item.name_en.toLowerCase();
  const pool =
    /biryani|biriyani|pulao|fried rice/.test(name) ? DISHES.biryani
    : /fish|meen|prawn|shrimp|crab|seafood/.test(name) ? DISHES.fish
    : /appam|puttu|dosa|idli|paratta|parotta|roti|chapati|snack|cutlet|samosa|vada/.test(name) ? DISHES.snack
    : /rice|meals|sadya|curry|masala|thali/.test(name) ? [...DISHES.rice, ...DISHES.thali]
    : [...DISHES.thali, ...DISHES.rice, ...DISHES.snack];
  return pool[hash(item.slug || name) % pool.length];
}

// Fills empty hero, about and gallery images so the site never looks bare
export function withDefaultImages(s: Settings): Settings {
  const c = s.content;
  return {
    ...s,
    content: {
      ...c,
      heroImage: c.heroImage || HERO,
      aboutImage: c.aboutImage || ABOUT,
      gallery: c.gallery && c.gallery.length > 0 ? c.gallery : GALLERY,
    },
  };
}
