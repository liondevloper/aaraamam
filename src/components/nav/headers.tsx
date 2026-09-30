import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { Brand, HeaderActions } from "./header-actions.tsx";
import type { NavItem } from "./use-nav-links.ts";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn("rounded-md px-3 py-2 text-sm hover:bg-secondary", isActive && "bg-secondary font-semibold text-primary");

// Theme 1: brand left, links inline on desktop, hamburger dropdown on mobile
export function ClassicHeader({ links }: { links: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Brand />
        <nav className="ml-auto hidden items-center gap-1 xl:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>{l.label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          <HeaderActions />
          <Button size="icon" variant="secondary" className="xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="size-4" /> : <MenuIcon className="size-4" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 py-2 xl:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm hover:bg-secondary">{l.label}</NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

// Theme 2 and 5: slim top bar; navigation lives in the bottom tab bar on mobile and inline on desktop
export function SlimHeader({ links }: { links: NavItem[] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Brand />
        <nav className="ml-auto hidden items-center gap-1 xl:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>{l.label}</NavLink>)}
        </nav>
        <div className="ml-auto xl:ml-2"><HeaderActions /></div>
      </div>
    </header>
  );
}

// Theme 3: centered masthead between fine rules, links in a spaced serif row
export function EditorialHeader({ links }: { links: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur">
      <div className="border-b-4 border-double border-primary/50">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4">
          <Button size="icon" variant="secondary" className="xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="size-4" /> : <MenuIcon className="size-4" />}
          </Button>
          <span className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground xl:block">Kerala · Dubai</span>
          <Brand className="col-start-2 justify-center" nameClassName="text-2xl tracking-wide" />
          <div className="flex justify-end"><HeaderActions /></div>
        </div>
      </div>
      <nav className="hidden border-b xl:block">
        <div className="mx-auto flex max-w-6xl justify-center gap-8 px-4 py-2">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => cn("border-b-2 border-transparent py-1 text-sm uppercase tracking-widest hover:text-primary", isActive && "border-primary text-primary")}>{l.label}</NavLink>
          ))}
        </div>
      </nav>
      {open && (
        <nav className="border-b px-4 py-2 xl:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)} className="block border-b border-dashed px-2 py-3 text-center text-sm uppercase tracking-widest last:border-0">{l.label}</NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

// Theme 4: minimal bar with a gold hairline; every link lives in a full-height side drawer
export function DrawerHeader({ links }: { links: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-primary/40 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Button size="icon" variant="secondary" onClick={() => setOpen(true)} aria-label="Menu"><MenuIcon className="size-4" /></Button>
          <Brand className="mx-auto" nameClassName="tracking-[0.15em] uppercase" />
          <HeaderActions />
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-black/60" onClick={() => setOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-primary/40 bg-background p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <Brand nameClassName="tracking-[0.15em] uppercase" />
                <Button size="icon" variant="secondary" onClick={() => setOpen(false)} aria-label="Close"><X className="size-4" /></Button>
              </div>
              <div className="mb-4 h-px bg-gradient-to-r from-primary via-primary/40 to-transparent" />
              <nav className="flex flex-1 flex-col gap-1">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => cn("flex items-center gap-3 border-l-2 border-transparent px-3 py-3 text-lg hover:bg-secondary", isActive && "border-primary text-primary")}>
                    <l.icon className="size-4" />{l.label}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
