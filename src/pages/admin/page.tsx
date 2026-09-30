import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { claimAdmin } from '@/lib/db.ts';
import { supabase } from '@/lib/supabase.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useAdminStatus } from '@/hooks/use-admin.ts';
import { useAdminTheme } from '@/hooks/use-admin-theme.ts';
import BookingsTab from './_components/bookings-tab.tsx';
import ContentTab from './_components/content-tab.tsx';
import MenuTab from './_components/menu-tab.tsx';
import OrdersTab from './_components/orders-tab.tsx';
import SettingsTab from './_components/settings-tab.tsx';

const LION_LOGO = 'https://hercules-cdn.com/file_YhLYv39scgdutD2CYKbozlog';

export default function AdminPage() {
  useAdminTheme();
  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-6">
      <Gate />
    </div>
  );
}

function Gate() {
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

  if (!status) return <Skeleton className="h-40" />;
  if (status.isAdmin) return <Dashboard />;
  if (!status.signedIn) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center">
        <div className="w-full max-w-sm space-y-5 rounded-2xl border bg-card p-8 shadow-sm">
          {/* Lion Developer Logo + Aaraamam name */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={LION_LOGO}
              alt="Lion Developer"
              className="h-44 w-44 object-contain"
            />
            <h1 className="text-2xl font-bold tracking-wide">Aaraamam</h1>
          </div>

          <p className="text-center text-sm text-muted-foreground">Sign in to manage the restaurant</p>

          {/* Email / Password login */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && void signInEmail()}
              />
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
  return <p className="rounded-xl border bg-card p-8 text-center">Not authorized. Ask the owner to add your account.</p>;
}

function Dashboard() {
  const [tab, setTab] = useState('orders');
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aaraamam Admin</h1>
        <Button asChild variant="secondary"><Link to="/">View site</Link></Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        <div className="pt-4">
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="menu"><MenuTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
          <TabsContent value="content"><ContentTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
