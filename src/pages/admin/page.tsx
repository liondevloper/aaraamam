import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BellRing, CalendarDays, ClipboardList, ExternalLink, FileText, LayoutDashboard, LogOut, Moon, Settings2, Sun, UtensilsCrossed, Volume2 } from 'lucide-react';
import { claimAdmin } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useAdminStatus } from '@/hooks/use-admin.ts';
import { useAdminTheme } from '@/hooks/use-admin-theme.ts';
import { useOrdersLive } from '@/hooks/use-orders-live.ts';
import { useRing } from '@/hooks/use-ring.ts';
import { ADMIN_THEMES, type AdminLayoutId } from '@/lib/themes.ts';
import { cn } from '@/lib/utils.ts';
import BookingsTab from './_components/bookings-tab.tsx';
import ContentTab from './_components/content-tab.tsx';
import ControlCenter from './_components/control-center.tsx';
import MenuTab from './_components/menu-tab.tsx';
import OrdersTab from './_components/orders-tab.tsx';
import SettingsTab from './_components/settings-tab.tsx';
import StatsBar from './_components/stats-bar.tsx';

const LION_LOGO = 'https://hercules-cdn.com/file_YhLYv39scgdutD2CYKbozlog';

export default function AdminPage() {
  const { layout, setLayout } = useAdminTheme();
  return (
    <div className={cn(layout === 'classic' ? 'mx-auto min-h-svh max-w-6xl px-4 py-6' : 'min-h-svh')}>
      <Gate layout={layout} setLayout={setLayout} />
    </div>
  );
}

function Gate({ layout, setLayout }: { layout: AdminLayoutId; setLayout: (id: AdminLayoutId) => void }) {
  const status = useAdminStatus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signInEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  if (!status) return <div className="mx-auto max-w-6xl px-4 py-6"><Skeleton className="h-40" /></div>;
  if (status.isAdmin) return <Dashboard layout={layout} setLayout={setLayout} />;
  if (!status.signedIn) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-5 rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <img src={LION_LOGO} alt="Lion Developer" className="h-64 w-64 object-contain" />
            <h1 className="text-2xl font-bold tracking-wide">Aaraamam</h1>
          </div>
          <p className="text-center text-sm text-muted-foreground">Sign in to manage the restaurant</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && void signInEmail()} />
            </div>
            <Button className="w-full" disabled={loading || !email || !password} onClick={() => void signInEmail()}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Made by Lion Developer</p>
        </div>
      </div>
    );
  }
  if (status.canClaim) {
    return (
      <div className="mx-auto max-w-sm space-y-4 rounded-xl border bg-card p-8 text-center">
        <p>No admin exists yet. Claim this account as the restaurant owner.</p>
        <Button onClick={() => void claimAdmin().catch(() => toast.error('Could not claim'))}>Become admin</Button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-xl border bg-card p-8 text-center">
      <p>Not authorized. Ask the owner to add your account.</p>
      <Button variant="secondary" onClick={() => void supabase.auth.signOut()}><LogOut className="size-4" />Sign out</Button>
    </div>
  );
}

const TABS = [
  { value: 'orders', label: 'Orders', icon: ClipboardList },
  { value: 'bookings', label: 'Bookings', icon: CalendarDays },
  { value: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { value: 'settings', label: 'Settings', icon: Settings2 },
  { value: 'content', label: 'Content', icon: FileText },
] as const;

// Compact control to flip between the two premium admin looks. Choice is saved per browser.
function LayoutSwitcher({ layout, setLayout, compact }: { layout: AdminLayoutId; setLayout: (id: AdminLayoutId) => void; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-1 rounded-lg border bg-secondary/60 p-1', compact && 'w-full')}>
      {ADMIN_THEMES.map((t) => (
        <button
          key={t.id}
          title={t.description}
          onClick={() => setLayout(t.id)}
          className={cn(
            'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
            layout === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.id === 'midnight' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Dashboard({ layout, setLayout }: { layout: AdminLayoutId; setLayout: (id: AdminLayoutId) => void }) {
  const [tab, setTab] = useState('orders');
  const orders = useOrdersLive();
  const [sound, setSound] = useState(false);
  const newCount = orders?.filter((o) => o.status === 'new').length ?? 0;
  // Lives here (not in the Orders tab) so the alarm keeps ringing on every tab
  const unlock = useRing(newCount > 0, sound);

  useEffect(() => {
    if (!sound || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    (navigator as Navigator & { wakeLock: { request: (t: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen').then((l) => { lock = l; }).catch(() => undefined);
    return () => { void lock?.release(); };
  }, [sound]);

  const soundButton = sound ? (
    <Button size="sm" variant="secondary" onClick={() => setSound(false)}><Volume2 className="size-4" />Sound on</Button>
  ) : (
    <Button size="sm" onClick={() => { unlock(); setSound(true); }}><BellRing className="size-4" />Enable order sound</Button>
  );

  const alertBanner = newCount > 0 && !sound && (
    <button onClick={() => { unlock(); setSound(true); setTab('orders'); }} className="w-full cursor-pointer rounded-xl bg-destructive p-3 text-center text-sm font-semibold text-white">
      {newCount} new order{newCount > 1 ? 's' : ''} waiting. Tap to turn on the alert sound.
    </button>
  );

  const tabsBlock = (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <TabsList className="h-11">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 px-3 py-1.5">
              <Icon className="size-4" />{label}
              {value === 'orders' && newCount > 0 && <span className="rounded-full bg-destructive px-1.5 text-xs text-white">{newCount}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="pt-4">
        <TabsContent value="orders"><OrdersTab orders={orders} /></TabsContent>
        <TabsContent value="bookings"><BookingsTab /></TabsContent>
        <TabsContent value="menu"><MenuTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="content"><ContentTab /></TabsContent>
      </div>
    </Tabs>
  );

  if (layout === 'midnight') {
    return (
      <div className="flex min-h-svh flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col gap-6 border-b border-border p-5 lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary"><LayoutDashboard className="size-5" /></span>
            <div>
              <p className="text-sm font-bold leading-tight">Aaraamam Admin</p>
              <p className="text-xs text-muted-foreground">Control panel</p>
            </div>
          </div>
          <LayoutSwitcher layout={layout} setLayout={setLayout} compact />
          <div className="flex flex-col gap-2">
            {soundButton}
            <Button asChild size="sm" variant="secondary"><Link to="/"><ExternalLink className="size-4" />View site</Link></Button>
            <Button size="sm" variant="ghost" onClick={() => void supabase.auth.signOut()}><LogOut className="size-4" />Sign out</Button>
          </div>
        </aside>
        <main className="flex-1 space-y-6 p-5">
          {alertBanner}
          <ControlCenter />
          <StatsBar orders={orders} />
          {tabsBlock}
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-xl font-bold leading-tight">Aaraamam Admin</h1>
          <p className="text-xs text-muted-foreground">Restaurant control panel</p>
        </div>
        <LayoutSwitcher layout={layout} setLayout={setLayout} />
        {soundButton}
        <Button asChild size="sm" variant="secondary"><Link to="/"><ExternalLink className="size-4" />View site</Link></Button>
        <Button size="sm" variant="ghost" onClick={() => void supabase.auth.signOut()}><LogOut className="size-4" /><span className="hidden sm:inline">Sign out</span></Button>
      </header>

      {alertBanner}

      <ControlCenter />
      <StatsBar orders={orders} />
      {tabsBlock}
    </div>
  );
}
