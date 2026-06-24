import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { WhatsAppFloat } from "@/components/shop/WhatsAppFloat";
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
    <CartProvider>
      <div className="shop-layout flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </CartProvider>
  );
}
