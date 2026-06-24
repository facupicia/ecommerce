import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { WhatsAppFloat } from "@/components/shop/WhatsAppFloat";
import "@/app/shop.css";

export const metadata = {
  title: "THEPLUG — Rosario, Argentina",
  description: "Ropa importada. Style desde Rosario al país.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
