import Link from "next/link";
import { CartProvider } from "@/lib/cart";
import { CartIcon } from "@/components/CartIcon";
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
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="text-xl font-bold tracking-tight text-gray-900 hover:text-emerald-600 transition-colors"
              >
                TIENDA
              </Link>

              {/* Nav */}
              <nav className="hidden sm:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  href="/categorias"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Categorías
                </Link>
              </nav>

              {/* Cart */}
              <CartIcon />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  TIENDA
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Productos importados seleccionados. Calidad garantizada y envío
                  a todo el país.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Navegación
                </h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>
                    <Link href="/" className="hover:text-emerald-600 transition-colors">
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/carrito"
                      className="hover:text-emerald-600 transition-colors"
                    >
                      Carrito
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Contacto
                </h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>WhatsApp: +54 9 261 123-4567</li>
                  <li>Email: hola@tienda.com</li>
                  <li>Mendoza, Argentina</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                © {new Date().getFullYear()} TIENDA. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
