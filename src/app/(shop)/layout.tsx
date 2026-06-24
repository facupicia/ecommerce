import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import "@/app/shop.css";

export const metadata = {
  title: "TIENDA — Productos importados",
  description: "Comprá productos importados con envío a todo el país.",
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
      </div>
    </CartProvider>
  );
}
