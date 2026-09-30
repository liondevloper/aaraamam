import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { DefaultProviders } from "./components/providers/default.tsx";
import { CartProvider } from "./components/providers/cart.tsx";
import { LangProvider } from "./components/providers/lang.tsx";
import { SettingsProvider } from "./components/providers/settings.tsx";
import SiteLayout from "./components/site-layout.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import AdminPage from "./pages/admin/page.tsx";
import BookPage from "./pages/book/page.tsx";
import CheckoutPage from "./pages/checkout/page.tsx";
import { AboutPage, ContactPage, GalleryPage } from "./pages/info/page.tsx";
import Index from "./pages/Index.tsx";
import MenuPage from "./pages/menu/page.tsx";
import NotFound from "./pages/NotFound.tsx";
import RiderPage from "./pages/rider/page.tsx";
import TrackPage from "./pages/track/page.tsx";

// Fills the menu and default settings on first run.
function SeedOnce({ children }: { children: React.ReactNode }) {
  const cats = useQuery(api.menu.listCategories, {});
  const seed = useMutation(api.seed.run);
  useEffect(() => {
    if (cats && cats.length === 0) void seed();
  }, [cats, seed]);
  return <>{children}</>;
}

export default function App() {
  return (
    <DefaultProviders>
      <LangProvider>
        <SettingsProvider>
          <CartProvider>
            <SeedOnce>
              <BrowserRouter>
                <Routes>
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/rider/:token" element={<RiderPage />} />
                  <Route element={<SiteLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/order" element={<MenuPage orderMode />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/track/:orderNo" element={<TrackPage />} />
                    <Route path="/book" element={<BookPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SeedOnce>
          </CartProvider>
        </SettingsProvider>
      </LangProvider>
    </DefaultProviders>
  );
}
