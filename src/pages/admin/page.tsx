import { useState } from "react";
import { Link } from "react-router-dom";
import { Authenticated, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useAdminStatus } from "@/hooks/use-admin.ts";
import BookingsTab from "./_components/bookings-tab.tsx";
import ContentTab from "./_components/content-tab.tsx";
import MenuTab from "./_components/menu-tab.tsx";
import OrdersTab from "./_components/orders-tab.tsx";
import SettingsTab from "./_components/settings-tab.tsx";

export default function AdminPage() {
  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aaraamam Admin</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link to="/">View site</Link></Button>
          <Authenticated><SignInButton variant="secondary" /></Authenticated>
        </div>
      </div>
      <Gate />
    </div>
  );
}

function Gate() {
  const status = useAdminStatus();
  const claim = useMutation(api.admin.claim);
  if (!status) return <Skeleton className="h-40" />;
  if (status.isAdmin) return <Dashboard />;
  if (!status.signedIn) {
    return (
      <div className="mx-auto max-w-sm space-y-4 rounded-xl border bg-card p-8 text-center">
        <p>Sign in to manage the restaurant.</p>
        <SignInButton />
      </div>
    );
  }
  if (status.canClaim) {
    return (
      <div className="mx-auto max-w-sm space-y-4 rounded-xl border bg-card p-8 text-center">
        <p>No admin exists yet. Claim this account as the restaurant owner.</p>
        <Button onClick={() => void claim().catch(() => toast.error("Could not claim"))}>Become admin</Button>
      </div>
    );
  }
  return <p className="rounded-xl border bg-card p-8 text-center">Not authorized. Ask the owner to add your account.</p>;
}

function Dashboard() {
  const [tab, setTab] = useState("orders");
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
