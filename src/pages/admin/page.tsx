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

export default function AdminPage() {
  useAdminTheme();
  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aaraamam Admin</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link to="/">View site</Link></Button>
        </div>
      </div>
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
      <div className="mx-auto max-w-sm space-y-5 rounded-xl border bg-card p-8">
        <p className="text-center font-semibold">Sign in to manage the restaurant</p>

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

        <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 border-t" />or<div className="flex-1 border-t" />
        </div>

        {/* Google login */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => void supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })}
        >
          Sign in with Google
        </Button>
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
  );
}
