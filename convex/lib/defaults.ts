import type { SettingsValues } from "./validators";

const CDN = "https://hercules-cdn.com/";
export const IMAGES = {
  hero: `${CDN}file_Nf1O0pgnI7WHGRdMkA4lIbBr`,
  about: `${CDN}file_8V5k8kTXRA72VDfNnZw8iWyB`,
  masalaDosa: `${CDN}file_UFJnZphQQQpqQ06UbFaVFFF2`,
  chickenBiriyani: `${CDN}file_KoEldZyuuQOwRkB7tNjFhI4u`,
  chickenCurry: `${CDN}file_yI110PTmApb82QuQkOYDmnIO`,
  beefFry: `${CDN}file_7Fi43ApSGgQ53Vv07ZksVM31`,
  kappaKanji: `${CDN}file_w4uqwKa6vphhRVDN5j9UrKFS`,
  fishMeals: `${CDN}file_yFM07WmtVVqtYhYjDrXmV7Av`,
};

const field = (labelEn: string, labelAr: string) => ({
  on: true,
  required: false,
  labelEn,
  labelAr,
});

export const DEFAULT_SETTINGS: SettingsValues = {
  restaurantName: "Aaraamam Restaurant",
  theme: "theme-1",
  flags: {
    ordering: true,
    booking: true,
    delivery: true,
    pickup: true,
    cod: true,
    mapPin: true,
    autofill: true,
    tracking: true,
  },
  vatPercent: 5,
  delivery: { radiusKm: 5, fee: 5, minOrder: 20, lat: 25.247, lng: 55.304 },
  addressFields: {
    building: field("Building / Villa", "المبنى / الفيلا"),
    floor: field("Floor", "الطابق"),
    landmark: field("Landmark", "معلم قريب"),
    notes: field("Delivery notes", "ملاحظات التوصيل"),
  },
  bookingConfig: {
    open: "12:00",
    close: "23:00",
    slotMinutes: 30,
    capacityPerSlot: 40,
    closedWeekdays: [],
    holidays: [],
    maxDaysAhead: 30,
  },
  content: {
    heroTitleEn: "Authentic Kerala Flavours in Karama",
    heroTitleAr: "نكهات كيرالا الأصيلة في الكرامة",
    heroSubtitleEn:
      "Home-style Kerala breakfast, meals, biriyani and seafood, served fresh or delivered hot.",
    heroSubtitleAr:
      "إفطار ووجبات وبرياني ومأكولات بحرية من مطبخ كيرالا، طازجة أو توصيل ساخن.",
    aboutEn:
      "Aaraamam brings the taste of Kerala to Karama, Dubai. From flaky porotta and appam at breakfast to banana leaf meals, biriyani and coastal fish fry, every dish is cooked the way it is at home.",
    aboutAr:
      "يقدّم أرامم طعم كيرالا في الكرامة، دبي. من البروتا والأبام في الإفطار إلى الوجبات على ورق الموز والبرياني والسمك المقلي، كل طبق يُطهى كما في البيت.",
    phone: "",
    whatsapp: "",
    address: "",
    openingHours: "",
    offerBannerEn: "",
    offerBannerAr: "",
    heroImage: IMAGES.hero,
    aboutImage: IMAGES.about,
    gallery: [
      IMAGES.hero,
      IMAGES.masalaDosa,
      IMAGES.chickenBiriyani,
      IMAGES.chickenCurry,
      IMAGES.beefFry,
      IMAGES.kappaKanji,
      IMAGES.fishMeals,
      IMAGES.about,
    ],
  },
};
