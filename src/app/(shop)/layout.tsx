import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { ToastProvider } from "@/lib/toast";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { NewsletterSection } from "@/components/shop/NewsletterSection";
import { WhatsAppFloat } from "@/components/shop/WhatsAppFloat";
import { VisitTracker } from "@/components/shop/VisitTracker";
import { AnnouncementBar, announcementStyles } from "@/components/shop/AnnouncementBar";
import { getShopSettings } from "@/lib/settings";
import { ComingSoon } from "@/components/shop/ComingSoon";
import "@/app/shop.css";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getShopSettings();

  if (settings.isBlocked) {
    return (
      <ComingSoon
        title={settings.title}
        message={settings.comingSoonMessage}
      />
    );
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <style dangerouslySetInnerHTML={{ __html: announcementStyles }} />
            <div className="shop-layout flex flex-col min-h-screen bg-white">
              <a href="#main-content" className="plug-skip-link">
                Saltar al contenido
              </a>
              <AnnouncementBar />
              <Header />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <NewsletterSection />
              <Footer />
              <WhatsAppFloat />
              <VisitTracker />
            </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
