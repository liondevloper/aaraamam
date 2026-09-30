import { IMAGES } from "./defaults";

type Entry = { n: string; p?: number; h?: number; f?: number; req?: boolean };
type CategorySeed = {
  slug: string;
  name: string;
  nameAr: string;
  from?: string;
  to?: string;
  label?: string;
  items: Entry[];
};

const i = (n: string, p: number): Entry => ({ n, p });
const hf = (n: string, h: number, f: number): Entry => ({ n, h, f });
const req = (n: string): Entry => ({ n, req: true });

export const MENU_SEED: CategorySeed[] = [
  {
    slug: "breakfast-classics", name: "Breakfast Classics", nameAr: "إفطار كلاسيكي",
    from: "07:00", to: "12:00", label: "07:00am – 12:00pm",
    items: [i("Masala Dosa", 12), i("Ghee Roast", 12), i("Set Dosa", 10), i("Set Idly", 10), i("Poori Bhaji", 12), i("Wheat Puttu", 7), i("Uthappam", 10), i("Egg Dosa", 12)],
  },
  {
    slug: "breads", name: "Breads", nameAr: "الخبز",
    items: [i("Porotta", 2), i("Idiyappam", 3), i("Puttu", 5), i("Kalappam", 3), i("Palappam", 3), i("Wheat Porotta", 2.5), i("Dosa", 2), i("Chappati", 2)],
  },
  {
    slug: "breakfast-pairings", name: "Breakfast Pairings", nameAr: "مرافقات الإفطار",
    items: [hf("Kadala Curry", 6, 12), hf("Veg Stew", 8, 16), hf("Chicken Stew", 13, 26), hf("Peas Masala", 7, 14)],
  },
  {
    slug: "egg-specialties", name: "Egg Specialties", nameAr: "أطباق البيض",
    items: [hf("Egg Roast", 8, 16), hf("Egg Curry", 8, 16), i("Egg Bhurji", 14), hf("Bullseye", 3, 6), i("Omelette Porotta", 8), hf("Omelette", 4, 8)],
  },
  {
    slug: "kerala-meals", name: "Kerala Meals", nameAr: "وجبات كيرالا",
    from: "12:00", to: "16:00", label: "12:00pm – 04:00pm",
    items: [i("Fish Curry Meals", 15), i("Veg Meals", 15), i("Pothi Choru", 18)],
  },
  {
    slug: "biriyani", name: "Biriyani", nameAr: "برياني",
    from: "12:00", to: "16:00", label: "12:00pm – 04:00pm",
    items: [i("Chicken Biriyani", 20), i("Beef Biriyani", 25), i("Mutton Biriyani", 25), i("Fish Biriyani", 25), i("Veg Biriyani", 16), i("Chicken Pothi Biriyani", 22), i("Beef Pothi Biriyani", 27)],
  },
  {
    slug: "kappa-kanji", name: "Kappa & Kanji", nameAr: "كابا وكانجي",
    from: "18:00", to: "23:59", label: "06:00pm – 12:00am",
    items: [i("Kappa Kanji Set", 23), i("Kappa Biriyani (Beef)", 25), i("Kappa Biriyani (Chicken)", 25), i("Kappa Mathi Curry", 22)],
  },
  {
    slug: "chicken-specialties", name: "Chicken Specialties", nameAr: "أطباق الدجاج",
    items: [hf("Naadan Chicken Curry", 12, 24), hf("Chicken Roast", 12, 24), i("Butter Chicken", 28), hf("Chicken Varatharachathu", 12, 24), i("Kadai Chicken", 28), i("Chicken Chatti Curry", 35), hf("Chicken Fry", 12, 24), i("Chicken 65", 24), i("Kunji Kozhi", 35), i("Chicken Lollipop", 24), i("Garlic Chicken", 26), i("Chilli Chicken", 26)],
  },
  {
    slug: "beef-specialties", name: "Beef Specialties", nameAr: "أطباق اللحم البقري",
    items: [hf("Beef Fry", 13, 26), hf("Beef Curry", 13, 26), hf("Beef Roast", 13, 26), i("Beef Chatti Curry", 35)],
  },
  {
    slug: "seafood-specialties", name: "Seafood Specialties", nameAr: "المأكولات البحرية",
    items: [i("King Fish Mango Curry", 27), req("Sea Bream Pollichathu (as per size)"), i("Prawns Roast", 26), i("Fish Mulakittathu", 26)],
  },
  {
    slug: "coastal-fish-fry", name: "Coastal Fish Fry", nameAr: "سمك مقلي ساحلي",
    items: ["Hamour", "King Fish", "Avoli", "Manthal", "Sheri", "Mathi", "Kilimeen", "Ayala"].map(req),
  },
  {
    slug: "vegetarian-specialties", name: "Vegetarian Specialties", nameAr: "أطباق نباتية",
    items: [hf("Veg Kurma", 6, 12), i("Dal Fry", 14), i("Channa Masala", 15), i("Mushroom Masala", 20), i("Gobi Manchurian", 20), i("Paneer Butter Masala", 20), i("Tomato Fry", 15), i("Kadai Paneer", 20), i("Chilli Paneer", 20)],
  },
  {
    slug: "signature-rice", name: "Signature Rice Dishes", nameAr: "أطباق الأرز",
    from: "18:00", to: "23:59", label: "06:00pm – 12:00am",
    items: [i("Schezwan Fried Rice (Chicken)", 22), i("Schezwan Fried Rice (Veg)", 18), i("Mixed Meat Fried Rice", 20), i("Chicken Fried Rice", 20), i("Egg Fried Rice", 16), i("Veg Fried Rice", 16), i("Ghee Rice", 15), i("Plain Rice", 8)],
  },
  {
    slug: "soups", name: "Soups", nameAr: "شوربات",
    items: [i("Naadan Mutton Soup", 15), i("Mushroom Soup", 15), i("Hot & Sour Chicken Soup", 15), i("Hot & Sour Veg Soup", 15), i("Sweet Corn Chicken Soup", 15), i("Sweet Corn Soup", 15)],
  },
  {
    slug: "snacks-savouries", name: "Snacks & Savouries", nameAr: "وجبات خفيفة",
    from: "16:00", to: "18:00", label: "04:00pm – 06:00pm",
    items: [i("Pazhampori", 3), i("Unniyappam", 1), i("Kozhukatta", 3), i("Kumbilappam", 5), i("Dip Vada", 7), i("Uzhunuvada Set", 3), i("Sugiyan", 3), i("Bonda", 3), i("Vattayappam", 4), i("Ottada", 4), i("Parippu Vada", 2.5), i("Banana Ball", 4), i("Beef Cutlet", 4), i("Chicken Cutlet", 4), i("Chicken Samosa", 4), i("Veg Samosa", 3), i("Chicken Wings", 4), i("Egg Bhaji", 3), i("Egg Puff", 4), i("Ela Ada", 4), i("Elanji", 5), i("Meat Roll", 5), i("Mulaku Bhaji", 3), i("Neyyappam", 3), i("Onion Pakkavada", 2), i("Ulli Vada", 2.5), i("Unnakkaya", 5), i("Achappam", 2.5), i("Murukku", 8), i("Madakku", 3), i("Pakkavada", 6), i("Roasted Peanuts", 10), i("Pappada Boli", 3), i("Madhura Seva", 8), i("Laddu", 3), i("Burfi", 2)],
  },
  {
    slug: "comfort-drinks", name: "Comfort Drinks", nameAr: "مشروبات ساخنة",
    items: [i("Tea", 3), i("Coffee", 4), i("Horlicks", 6), i("Boost", 6), i("Milk", 5), i("Chukku Kappi", 4), i("Black Coffee", 3), i("Black Tea", 2), i("Ginger Tea", 2.5), i("Lemon Tea", 2.5)],
  },
  {
    slug: "beverages-desserts", name: "Beverages & Desserts", nameAr: "مشروبات وحلويات",
    items: [i("Bottled Water 500ml", 2), i("Bottled Water 1.5L", 3), i("Pepsi", 3), i("7Up", 3), i("Oreo Cheese Cake", 10), i("Red Velvet Cheese Cake", 10)],
  },
];

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Only a few dishes have photos, to keep the image count small.
export const ITEM_IMAGES: Record<string, string> = {
  "masala-dosa": IMAGES.masalaDosa,
  "chicken-biriyani": IMAGES.chickenBiriyani,
  "naadan-chicken-curry": IMAGES.chickenCurry,
  "beef-fry": IMAGES.beefFry,
  "kappa-kanji-set": IMAGES.kappaKanji,
  "fish-curry-meals": IMAGES.fishMeals,
};

export const POPULAR = new Set(Object.keys(ITEM_IMAGES));
