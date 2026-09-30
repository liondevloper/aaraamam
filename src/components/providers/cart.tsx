import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** Which menu the cart belongs to. Dine-in and delivery menus are separate, so the cart never mixes them. */
export type Channel = "delivery" | "dine_in";

export type CartLine = {
  key: string;
  slug: string;
  name: string;
  variantLabel?: string;
  price: number;
  qty: number;
};

export type TableInfo = { tableNo: string; bookingNo: string };

type Ctx = {
  lines: CartLine[];
  channel: Channel;
  table: TableInfo;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "key" | "qty">, channel: Channel) => void;
  setQty: (key: string, qty: number) => void;
  setTable: (t: Partial<TableInfo>) => void;
  clear: () => void;
};

type Stored = { lines: CartLine[]; channel: Channel; table: TableInfo };

const CartContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "aaraamam-cart-v2";
const EMPTY: Stored = { lines: [], channel: "delivery", table: { tableNo: "", bookingNo: "" } };

function load(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Stored) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Stable identity: used inside effects, and skips no-op updates to avoid render loops
  const setTable = useCallback((t: Partial<TableInfo>) => {
    setState((prev) => {
      const next = { ...prev.table, ...t };
      if (next.tableNo === prev.table.tableNo && next.bookingNo === prev.table.bookingNo) return prev;
      return { ...prev, table: next };
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const { lines } = state;
    return {
      lines,
      channel: state.channel,
      table: state.table,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: Math.round(lines.reduce((n, l) => n + l.price * l.qty, 0) * 100) / 100,
      add: (line, channel) =>
        setState((prev) => {
          // Switching menus starts a fresh cart
          const base = prev.channel === channel ? prev.lines : [];
          const key = `${line.slug}|${line.variantLabel ?? ""}`;
          const found = base.find((l) => l.key === key);
          const next = found
            ? base.map((l) => (l.key === key ? { ...l, qty: Math.min(50, l.qty + 1) } : l))
            : [...base, { ...line, key, qty: 1 }];
          return { ...prev, channel, lines: next };
        }),
      setQty: (key, qty) =>
        setState((prev) => ({
          ...prev,
          lines:
            qty <= 0
              ? prev.lines.filter((l) => l.key !== key)
              : prev.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(50, qty) } : l)),
        })),
      setTable,
      clear: () => setState((prev) => ({ ...prev, lines: [] })),
    };
  }, [state, setTable]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Ctx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}
