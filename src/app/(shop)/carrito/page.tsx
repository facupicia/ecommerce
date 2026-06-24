"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <h2 className="plug-font-serif text-3xl text-[#1a1a1a] mb-3">
          Tu carrito está vacío
        </h2>
        <p className="text-[14px] text-[#777777] mb-8">
          Explorá nuestros productos y agregá lo que te guste.
        </p>
        <Link href="/" className="kith-btn">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      <div className="flex items-center justify-between mb-10 lg:mb-12">
        <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a]">
          Carrito
        </h1>
        <button
          onClick={clearCart}
          className="text-[12px] uppercase tracking-[0.1em] text-[#777777] hover:text-[#1a1a1a] transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 pb-6 border-b border-[#d9d9d9]"
            >
              <Link
                href={`/producto/${item.slug}`}
                className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-[#f5f5f5] overflow-hidden"
              >
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#d9d9d9]">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <Link
                    href={`/producto/${item.slug}`}
                    className="plug-font-serif text-[15px] sm:text-[16px] text-[#1a1a1a] hover:text-[#777777] transition-colors line-clamp-1"
                  >
                    {item.nombre}
                  </Link>
                  <p className="text-[13px] font-medium text-[#1a1a1a] mt-1">
                    {formatPrice(item.precio_ars)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.cantidad - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-[#d9d9d9] text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
                      aria-label="Reducir cantidad"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="w-8 text-center text-[13px] font-medium text-[#1a1a1a]">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.cantidad + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-[#d9d9d9] text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-medium text-[#1a1a1a]">
                      {formatPrice(item.precio_ars * item.cantidad)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-[#777777] hover:text-[#1a1a1a] transition-colors"
                      aria-label="Eliminar producto"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="plug-bg-footer p-6 lg:p-8 sticky top-24">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-6">
              Resumen del pedido
            </h2>

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between text-[#777777]">
                <span>Productos ({items.reduce((s, i) => s + i.cantidad, 0)})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[#777777]">
                <span>Envío</span>
                <span className="text-[#1a1a1a] font-medium">A calcular</span>
              </div>
              <div className="pt-3 border-t border-[#d9d9d9] flex justify-between text-[15px]">
                <span className="font-medium text-[#1a1a1a]">Total</span>
                <span className="font-medium text-[#1a1a1a]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="kith-btn-dark kith-btn w-full mt-8"
            >
              Ir a pagar
            </Link>

            <Link
              href="/"
              className="block text-center mt-4 text-[12px] uppercase tracking-[0.1em] text-[#777777] hover:text-[#1a1a1a] transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
