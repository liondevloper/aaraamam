import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  key: string;
  slug: string;
  name: string;
  variantLabel?: string;
  price: number;
  qty: number;
};

type Ctx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "key" | "qty">) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "aaraamam-cart";

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: Math.round(lines.reduce((n, l) => n + l.price * l.qty, 0) * 100) / 100,
      add: (line) =>
        setLines((prev) => {
          const key = `${line.slug}|${line.variantLabel ?? ""}`;
          const found = prev.find((l) => l.key === key);
          if (found) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(50, l.qty + 1) } : l));
          return [...prev, { ...line, key, qty: 1 }];
        }),
      setQty: (key, qty) =>
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(50, qty) } : l)),
        ),
      clear: () => setLines([]),
    }),
    [lines],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Ctx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}
