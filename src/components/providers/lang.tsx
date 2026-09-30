import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "ar";
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, ar: string) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    localStorage.getItem("lang") === "ar" ? "ar" : "en",
  );

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (en, ar) => (lang === "ar" && ar ? ar : en) }),
    [lang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang outside LangProvider");
  return ctx;
}
