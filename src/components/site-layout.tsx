import { Link, Outlet } from 'react-router-dom';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';
import { ClassicHeader, DrawerHeader, EditorialHeader, SlimHeader } from '@/components/nav/headers.tsx';
import MobileTabs from '@/components/nav/mobile-tabs.tsx';
import { useNavLinks } from '@/components/nav/use-nav-links.ts';
import { THEME_NAV, hasTabBar } from '@/lib/theme-nav.ts';
import { cn } from '@/lib/utils.ts';

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

// Each theme has its own navigation pattern (see lib/theme-nav.ts)
export default function SiteLayout() {
  const { t } = useLang();
  const s = useSettings();
  const links = useNavLinks();
  const style = THEME_NAV[s.theme as keyof typeof THEME_NAV] ?? THEME_NAV['theme-1'];
  const tabs = hasTabBar(style.nav);
  const { phone, whatsapp, address, openingHours } = s.content;

  return (
    <div className={cn('flex min-h-svh flex-col', tabs && 'pb-24 xl:pb-0')}>
      {style.nav === 'classic' && <ClassicHeader links={links} />}
      {style.nav === 'editorial' && <EditorialHeader links={links} />}
      {style.nav === 'drawer' && <DrawerHeader links={links} />}
      {tabs && <SlimHeader links={links} />}

      <main className="flex-1"><Outlet /></main>

      <footer className={cn('mt-12', style.footer)}>
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

      {tabs && <MobileTabs links={links} variant={style.nav === 'dock' ? 'dock' : 'bar'} />}
    </div>
  );
}
