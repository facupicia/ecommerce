"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            nombre: i.nombre,
            precio_ars: i.precio_ars,
            cantidad: i.cantidad,
            imagen: i.imagen,
          })),
          total_ars: total,
          cliente_nombre: form.nombre,
          cliente_email: form.email,
          cliente_telefono: form.telefono,
          cliente_direccion: form.direccion,
          cliente_notas: form.notas,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear el pedido");
      }

      const data = await res.json();

      // Clear cart and redirect to Mercado Pago (or order confirmation)
      clearCart();

      if (data.mp_init_point) {
        // Mercado Pago redirect URL
        window.location.href = data.mp_init_point;
      } else {
        // Fallback: redirect to order confirmation
        router.push(`/checkout/confirmado?order=${data.order_id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No hay nada que pagar
        </h2>
        <p className="text-gray-500 mb-8">
          Agregá productos al carrito antes de iniciar el pago.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
        >
          Ver productos
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
        Finalizar compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">
                Datos de contacto
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow text-gray-900"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow text-gray-900"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    required
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow text-gray-900"
                    placeholder="+54 9 261 123-4567"
                  />
                </div>
                <div>
                  <label
                    htmlFor="direccion"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Dirección de envío *
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    required
                    value={form.direccion}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow text-gray-900"
                    placeholder="Calle, número, ciudad"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notas"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Notas adicionales
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  value={form.notas}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow text-gray-900 resize-none"
                  placeholder="Indicaciones de entrega, horarios, etc."
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                "Confirmar pedido"
              )}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Tu pedido
            </h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-200 overflow-hidden">
                    {item.imagen ? (
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-gray-500">x{item.cantidad}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.precio_ars * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-emerald-600 font-medium">
                  A coordinar
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-base">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
