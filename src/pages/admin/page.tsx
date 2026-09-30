import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BellRing, CalendarDays, ClipboardList, ExternalLink, FileText, LayoutDashboard, LogOut, Settings2, UtensilsCrossed, Volume2 } from 'lucide-react';
import { claimAdmin } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';
import type { AdminThemeId } from '@/lib/admin-themes.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { useAdminStatus } from '@/hooks/use-admin.ts';
import { useAdminTheme } from '@/hooks/use-admin-theme.ts';
import { useOrdersLive } from '@/hooks/use-orders-live.ts';
import { useRing } from '@/hooks/use-ring.ts';
import { useStoreStatus } from '@/hooks/use-store-status.ts';
import AdminThemePicker from './_components/admin-theme-picker.tsx';
import BookingsTab from './_components/bookings-tab.tsx';
import ContentTab from './_components/content-tab.tsx';
import ControlCenter from './_components/control-center.tsx';
import MenuTab from './_components/menu-tab.tsx';
import OrdersTab from './_components/orders-tab.tsx';
import SettingsTab from './_components/settings-tab.tsx';
import StatsBar from './_components/stats-bar.tsx';

// Developer logo is shown only on the login / access screens, not inside the panel
const LION_LOGO = 'https://hercules-cdn.com/file_YhLYv39scgdutD2CYKbozlog';

const TABS = [
  { value: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { value: 'orders', label: 'Orders', short: 'Orders', icon: ClipboardList },
  { value: 'bookings', label: 'Bookings', short: 'Bookings', icon: CalendarDays },
  { value: 'menu', label: 'Menu', short: 'Menu', icon: UtensilsCrossed },
  { value: 'settings', label: 'Settings', short: 'Settings', icon: Settings2 },
  { value: 'content', label: 'Content', short: 'Content', icon: FileText },
] as const;
type TabId = (typeof TABS)[number]['value'];

type ThemeProps = { themeId: AdminThemeId; onTheme: (id: AdminThemeId) => void };

const signOut = () => void supabase.auth.signOut();

export default function AdminPage() {
  const [themeId, setThemeId] = useAdminTheme();
  return (
    <div className="min-h-svh bg-background text-foreground">
      <Gate themeId={themeId} onTheme={setThemeId} />
    </div>
  );
}

function Gate(props: ThemeProps) {
  const status = useAdminStatus();

  if (!status) {
    return <div className="flex min-h-svh items-center justify-center"><Spinner className="size-8" /></div>;
  }
  if (status.isAdmin) return <Dashboard {...props} />;
  if (!status.signedIn) return <LoginScreen {...props} />;
  if (status.canClaim) {
    return (
      <CenterCard {...props} title="Set up the owner account" text="No admin exists yet. Claim this account as the restaurant owner.">
        <Button size="lg" className="w-full" onClick={() => void claimAdmin().catch(() => toast.error('Could not claim admin access'))}>Become admin</Button>
      </CenterCard>
    );
  }
  return (
    <CenterCard {...props} title="Not authorized" text="This account has no admin access. Ask the owner to add you.">
      <Button size="lg" variant="secondary" className="w-full" onClick={signOut}><LogOut className="size-4" />Sign out</Button>
    </CenterCard>
  );
}

function CenterCard({ themeId, onTheme, title, text, children }: ThemeProps & { title: string; text?: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-linear-to-b from-primary/10 via-background to-background p-4">
      <div className="absolute right-4 top-4"><AdminThemePicker value={themeId} onChange={onTheme} compact /></div>
      <div className="w-full max-w-sm space-y-6 rounded-[calc(var(--radius)+8px)] border bg-card p-8 text-card-foreground shadow-xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={LION_LOGO} alt="Lion Developer" className="size-28 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
        {children}
        <p className="text-center text-xs text-muted-foreground">Made by Lion Developer</p>
      </div>
    </div>
  );
}

function LoginScreen(props: ThemeProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  return (
    <CenterCard {...props} title="Aaraamam Admin" text="Sign in to manage the restaurant">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void signIn(); }}>
        <div className="space-y-1.5">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <Input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password}>
          {loading ? <><Spinner />Signing in…</> : 'Sign in'}
        </Button>
      </form>
    </CenterCard>
  );
}

const PILL = {
  open: { dot: 'bg-emerald-500', text: 'Store open' },
  closed: { dot: 'bg-destructive', text: 'Store closed' },
  maintenance: { dot: 'bg-amber-500', text: 'Maintenance on' },
} as const;

function StorePill({ onClick }: { onClick: () => void }) {
  const { status } = useStoreStatus();
  const p = PILL[status.kind];
  return (
    <button type="button" onClick={onClick} className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
      <span className={cn('size-2 rounded-full', p.dot)} />{p.text}
    </button>
  );
}

function CountBadge({ n, active }: { n: number; active: boolean }) {
  return <span className={cn('min-w-5 rounded-full px-1.5 text-center text-xs font-bold', active ? 'bg-primary-foreground text-primary' : 'bg-destructive text-white')}>{n}</span>;
}

function Dashboard({ themeId, onTheme }: ThemeProps) {
  const [tab, setTab] = useState<TabId>('dashboard');
  const orders = useOrdersLive();
  const [sound, setSound] = useState(false);
  const newCount = orders?.filter((o) => o.status === 'new').length ?? 0;
  // Lives here (not in the Orders tab) so the alarm keeps ringing on every tab
  const unlock = useRing(newCount > 0, sound);
  const current = TABS.find((t) => t.value === tab) ?? TABS[0];

  useEffect(() => {
    if (!sound || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    (navigator as Navigator & { wakeLock: { request: (t: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen').then((l) => { lock = l; }).catch(() => undefined);
    return () => { void lock?.release(); };
  }, [sound]);

  const go = (t: TabId) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };
  const enableSound = () => { unlock(); setSound(true); };

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-6 border-r bg-card p-4 text-card-foreground md:flex">
        <div className="px-2">
          <p className="truncate text-lg font-bold leading-tight">Aaraamam</p>
          <p className="text-xs text-muted-foreground">Restaurant control panel</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {TABS.map(({ value, label, icon: Icon }) => {
            const on = tab === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => go(value)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium transition-colors',
                  on ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1 text-left">{label}</span>
                {value === 'orders' && newCount > 0 && <CountBadge n={newCount} active={on} />}
              </button>
            );
          })}
        </nav>
        <div className="space-y-1 border-t pt-4">
          <AdminThemePicker value={themeId} onChange={onTheme} />
          <Button asChild size="sm" variant="ghost" className="w-full justify-start"><Link to="/"><ExternalLink className="size-4" />View website</Link></Button>
          <Button size="sm" variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={signOut}><LogOut className="size-4" />Sign out</Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight">{current.label}</h1>
            <StorePill onClick={() => go('dashboard')} />
          </div>
          {sound ? (
            <Button size="sm" variant="secondary" onClick={() => setSound(false)}><Volume2 className="size-4" /><span className="hidden sm:inline">Sound on</span></Button>
          ) : (
            <Button size="sm" onClick={enableSound}><BellRing className="size-4" /><span className="hidden sm:inline">Enable order sound</span></Button>
          )}
          <div className="flex gap-2 md:hidden">
            <AdminThemePicker value={themeId} onChange={onTheme} compact />
            <Button asChild size="icon" variant="secondary" aria-label="View website"><Link to="/"><ExternalLink className="size-4" /></Link></Button>
            <Button size="icon" variant="secondary" aria-label="Sign out" onClick={signOut}><LogOut className="size-4" /></Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-28 pt-6 md:px-8 md:pb-12">
          {newCount > 0 && !sound && (
            <button
              type="button"
              onClick={() => { enableSound(); go('orders'); }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--radius)+4px)] bg-destructive p-3 text-center text-sm font-semibold text-white shadow-lg"
            >
              <BellRing className="size-4" />
              {newCount} new order{newCount > 1 ? 's' : ''} waiting. Tap to open and turn on the alert sound.
            </button>
          )}

          {tab === 'dashboard' && (
            <>
              <StatsBar orders={orders} onOpenOrders={() => go('orders')} />
              <ControlCenter />
            </>
          )}
          {tab === 'orders' && <OrdersTab orders={orders} />}
          {tab === 'bookings' && <BookingsTab />}
          {tab === 'menu' && <MenuTab />}
          {tab === 'settings' && <SettingsTab />}
          {tab === 'content' && <ContentTab />}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {TABS.map(({ value, short, icon: Icon }) => {
          const on = tab === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => go(value)}
              className={cn('relative flex cursor-pointer flex-col items-center gap-1 py-2 text-[10px] font-medium', on ? 'text-primary' : 'text-muted-foreground')}
            >
              {on && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />}
              <Icon className="size-5" />
              {short}
              {value === 'orders' && newCount > 0 && (
                <span className="absolute right-2 top-1 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] font-bold text-white">{newCount}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
