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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mb-8">
          Explorá nuestros productos y agregá lo que te guste.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Carrito
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
            >
              {/* Image */}
              <Link
                href={`/producto/${item.slug}`}
                className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden"
              >
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/producto/${item.slug}`}
                  className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1"
                >
                  {item.nombre}
                </Link>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatPrice(item.precio_ars)}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.cantidad - 1)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    aria-label="Reducir cantidad"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-gray-900">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.cantidad + 1)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Subtotal + Remove */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar producto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.precio_ars * item.cantidad)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Resumen del pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Productos ({items.reduce((s, i) => s + i.cantidad, 0)})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-emerald-600 font-medium">
                  A calcular
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-base">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex items-center justify-center w-full py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
            >
              Ir a pagar
            </Link>

            <Link
              href="/"
              className="mt-3 flex items-center justify-center w-full py-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
