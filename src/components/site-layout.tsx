import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Languages, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import CartDrawer from '@/components/cart-drawer.tsx';
import Logo from '@/components/logo.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSetTheme, useSettings } from '@/components/providers/settings.tsx';
import { updateSettings } from '@/lib/db.ts';
import { THEMES } from '@/lib/themes.ts';
import { cn } from '@/lib/utils.ts';
import { useAdminStatus } from '@/hooks/use-admin.ts';

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

export default function SiteLayout() {
  const { t, lang, setLang } = useLang();
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const status = useAdminStatus();
  const setTheme = useSetTheme();

  const switchTheme = (id: string) => {
    setTheme(id);
    if (status?.isAdmin) void updateSettings({ theme: id });
  };

  const links = [
    { to: '/', label: t('Home', 'الرئيسية') },
    { to: '/menu', label: t('Menu', 'القائمة') },
    { to: '/order', label: t('Order Online', 'اطلب الآن') },
    { to: '/book', label: t('Book a Table', 'حجز طاولة') },
    { to: '/gallery', label: t('Gallery', 'المعرض') },
    { to: '/about', label: t('About', 'من نحن') },
    { to: '/contact', label: t('Contact', 'اتصل بنا') },
  ];
  const { phone, whatsapp, address, openingHours } = s.content;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold leading-tight">{s.restaurant_name}</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => cn('rounded-md px-3 py-2 text-sm hover:bg-secondary', isActive && 'bg-secondary font-semibold text-primary')}>{l.label}</NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <Button size="sm" variant="secondary" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
              <Languages className="size-4" />{lang === 'en' ? 'العربية' : 'EN'}
            </Button>
            <CartDrawer />
            <Button size="icon" variant="secondary" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="size-4" /> : <MenuIcon className="size-4" />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t px-4 py-2 lg:hidden">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm hover:bg-secondary">{l.label}</NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="mt-12 border-t bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold">{s.restaurant_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('Kerala cuisine · Karama, Dubai', 'مطبخ كيرالا · الكرامة، دبي')}</p>
          </div>
          <div className="space-y-1 text-sm">
            {address && <p>{address}</p>}
            {phone && <p>{phone}</p>}
            {openingHours && <p className="text-muted-foreground">{openingHours}</p>}
          </div>
          <div className="space-y-1 text-sm">
            {links.slice(1).map((l) => (<Link key={l.to} to={l.to} className="block hover:underline">{l.label}</Link>))}
            <Link to="/admin" className="block text-muted-foreground hover:underline">{t('Staff login', 'دخول الموظفين')}</Link>
            {whatsapp && <a className="block hover:underline" href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}>WhatsApp</a>}
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {s.restaurant_name}
          {DEMO && <span> · Preview with demo data</span>}
        </div>
      </footer>

      <div className="fixed bottom-4 left-4 z-50 flex gap-1 rounded-full border bg-card p-1 shadow-lg">
        {THEMES.map((th) => (
          <button key={th.id} onClick={() => switchTheme(th.id)} className={cn('cursor-pointer rounded-full px-3 py-1 text-xs', s.theme === th.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}>{th.label}</button>
        ))}
      </div>
    </div>
  );
}
