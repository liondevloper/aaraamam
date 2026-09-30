import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useLang } from "@/components/providers/lang.tsx";
import type { NavItem } from "./use-nav-links.ts";

const TAB_PATHS = ["/", "/menu", "/order", "/book"];

function MoreSheet({ open, onClose, links }: { open: boolean; onClose: () => void; links: NavItem[] }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-black/50" onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 rounded-t-[var(--radius)] border-t bg-background p-4 pb-8"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="grid grid-cols-2 gap-2">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={onClose} className="flex items-center gap-3 rounded-[var(--radius)] border bg-card px-4 py-3 text-sm font-medium hover:bg-secondary">
                  <l.icon className="size-4 text-primary" />{l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mobile-only tab navigation. "bar" = full-width tab bar, "dock" = floating pill that expands the active tab.
export default function MobileTabs({ links, variant }: { links: NavItem[]; variant: "bar" | "dock" }) {
  const { t } = useLang();
  const [more, setMore] = useState(false);
  const tabs = links.filter((l) => TAB_PATHS.includes(l.to));
  const rest = links.filter((l) => !TAB_PATHS.includes(l.to));
  const dock = variant === "dock";

  const itemClass = (active: boolean) =>
    dock
      ? cn("flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all", active ? "bg-primary px-4 text-primary-foreground" : "w-11 text-muted-foreground")
      : cn("relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground");

  return (
    <>
      <nav
        aria-label="Main"
        className={cn(
          "fixed z-40 xl:hidden",
          dock
            ? "inset-x-4 bottom-4 mx-auto flex max-w-sm items-center justify-between rounded-full border bg-card/90 p-1.5 shadow-xl backdrop-blur"
            : "inset-x-0 bottom-0 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur",
        )}
      >
        {tabs.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"} aria-label={l.label} className={({ isActive }) => itemClass(isActive)}>
            {({ isActive }) => (
              <>
                {!dock && isActive && <span className="absolute top-0 h-0.5 w-8 bg-primary" />}
                <l.icon className="size-5" />
                {(!dock || isActive) && <span>{dock ? l.label.split(" ")[0] : l.label.split(" ")[0]}</span>}
              </>
            )}
          </NavLink>
        ))}
        <button type="button" aria-label={t("More", "المزيد")} onClick={() => setMore(true)} className={itemClass(false)}>
          <Ellipsis className="size-5" />
          {!dock && <span>{t("More", "المزيد")}</span>}
        </button>
      </nav>
      <MoreSheet open={more} onClose={() => setMore(false)} links={rest} />
    </>
  );
}
