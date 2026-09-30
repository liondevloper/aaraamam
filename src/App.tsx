import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DefaultProviders } from './components/providers/default.tsx';
import { CartProvider } from './components/providers/cart.tsx';
import { LangProvider } from './components/providers/lang.tsx';
import { SettingsProvider } from './components/providers/settings.tsx';
import SiteLayout from './components/site-layout.tsx';
import AdminPage from './pages/admin/page.tsx';
import BookPage from './pages/book/page.tsx';
import CheckoutPage from './pages/checkout/page.tsx';
import { AboutPage, ContactPage, GalleryPage } from './pages/info/page.tsx';
import Index from './pages/Index.tsx';
import MenuPage from './pages/menu/page.tsx';
import NotFound from './pages/NotFound.tsx';
import RiderPage from './pages/rider/page.tsx';
import TrackPage from './pages/track/page.tsx';

export default function App() {
  return (
    <DefaultProviders>
      <LangProvider>
        <SettingsProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/rider/:token" element={<RiderPage />} />
                <Route element={<SiteLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/order" element={<MenuPage channel="delivery" />} />
                  <Route path="/table" element={<MenuPage channel="dine_in" />} />
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
          </CartProvider>
        </SettingsProvider>
      </LangProvider>
    </DefaultProviders>
  );
}
