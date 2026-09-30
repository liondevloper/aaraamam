// Per-theme page design: how cards, section titles, chips and info boxes look.
// Colors and fonts live in themes.ts, navigation in theme-nav.ts.
export type CardStyle = "photo" | "row" | "arch" | "menu" | "tile";
export type TitleStyle = "plain" | "bar" | "rules" | "gold" | "pill";

export type Look = {
  card: CardStyle;
  title: TitleStyle;
  grid: string;
  chip: string;
  chipActive: string;
  info: string;
  head: string;
  // Where the sticky category bar sits under the (differently tall) header
  stickyTop: string;
  // Boxes on order, booking, tracking and contact pages
  panel: string;
  // Photos on about and gallery pages
  photo: string;
  // Gallery layout
  gallery: string;
};

const CHIP_IDLE = "bg-card hover:bg-secondary";
const CHIP_ON = "border-primary bg-primary text-primary-foreground";

export const LOOKS: Record<string, Look> = {
  "theme-1": {
    card: "photo",
    title: "plain",
    grid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
    chip: `rounded-full border px-3 py-1.5 text-sm ${CHIP_IDLE}`,
    chipActive: CHIP_ON,
    info: "flex gap-3 rounded-[var(--radius)] border bg-card p-5",
    head: "",
    stickyTop: "top-[61px]",
    panel: "rounded-[var(--radius)] border bg-card p-4",
    photo: "rounded-[var(--radius)]",
    gallery: "columns-2 gap-3 md:columns-3 [&>img]:mb-3",
  },
  // Dark app-style: compact horizontal rows, square chips, bold left bars
  "theme-2": {
    card: "row",
    title: "bar",
    grid: "grid gap-3 md:grid-cols-2",
    chip: `rounded-md border-2 px-3 py-1.5 text-sm font-semibold ${CHIP_IDLE}`,
    chipActive: CHIP_ON,
    info: "flex gap-3 border-l-4 border-primary bg-card p-5",
    head: "",
    stickyTop: "top-[61px]",
    panel: "border-l-4 border-primary bg-card p-4",
    photo: "rounded-sm border-4 border-primary",
    gallery: "grid grid-cols-2 gap-2 md:grid-cols-4 [&>img]:aspect-square",
  },
  // Editorial magazine: arched photos, centered text, double rules
  "theme-3": {
    card: "arch",
    title: "rules",
    grid: "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
    chip: `rounded-none border-b-2 border-transparent px-2 py-1.5 text-sm uppercase tracking-widest hover:text-primary`,
    chipActive: "border-primary text-primary",
    info: "flex flex-col items-center gap-2 border-2 border-double border-primary/40 p-6 text-center",
    head: "text-center",
    stickyTop: "top-[82px] xl:top-[130px]",
    panel: "border-2 border-double border-primary/40 bg-card p-5",
    photo: "rounded-t-full",
    gallery: "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 [&>img]:aspect-[3/4] [&>img]:rounded-t-full",
  },
  // Fine dining: restaurant-style menu list with dotted price leaders
  "theme-4": {
    card: "menu",
    title: "gold",
    grid: "grid gap-x-12 md:grid-cols-2",
    chip: `rounded-none border border-primary/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] ${CHIP_IDLE}`,
    chipActive: CHIP_ON,
    info: "flex flex-col items-center gap-2 border border-primary/40 p-6 text-center",
    head: "text-center",
    stickyTop: "top-[61px]",
    panel: "border border-primary/40 bg-card p-5",
    photo: "rounded-none border border-primary/60 p-1.5",
    gallery: "grid grid-cols-2 gap-4 md:grid-cols-3 [&>img]:aspect-[4/5] [&>img]:border [&>img]:border-primary/40 [&>img]:p-1",
  },
  // Modern tiles: big rounded photos in a two-column grid with price chips
  "theme-5": {
    card: "tile",
    title: "pill",
    grid: "grid grid-cols-2 gap-3 lg:grid-cols-3",
    chip: `rounded-2xl border-0 bg-secondary px-4 py-2 text-sm font-medium`,
    chipActive: "bg-primary text-primary-foreground",
    info: "flex gap-3 rounded-[var(--radius)] bg-secondary p-5",
    head: "",
    stickyTop: "top-[61px]",
    panel: "rounded-[var(--radius)] bg-secondary p-4",
    photo: "rounded-[calc(var(--radius)+12px)] shadow-xl",
    gallery: "grid grid-cols-2 gap-3 md:grid-cols-3 [&>img]:aspect-square [&>img]:rounded-[calc(var(--radius)+8px)]",
  },
};

export const getLook = (themeId: string): Look => LOOKS[themeId] ?? LOOKS["theme-1"];
