"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import Link from "next/link";

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
      clearCart();

      if (data.mp_init_point) {
        window.location.href = data.mp_init_point;
      } else {
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
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <h2 className="plug-font-serif text-3xl text-[#1a1a1a] mb-3">
          No hay nada que pagar
        </h2>
        <p className="text-[14px] text-[var(--plug-gray)] mb-8">
          Agregá productos al carrito antes de iniciar el pago.
        </p>
        <Link href="/" className="plug-btn">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-10 lg:mb-12">
        Finalizar compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-[#d9d9d9] p-6 lg:p-8 space-y-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]">
                Datos de contacto
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2"
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
                    className="w-full px-3 py-3 border border-[#d9d9d9] bg-white text-[14px] text-[#1a1a1a] placeholder:text-[var(--plug-gray)] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2"
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
                    className="w-full px-3 py-3 border border-[#d9d9d9] bg-white text-[14px] text-[#1a1a1a] placeholder:text-[var(--plug-gray)] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2"
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
                    className="w-full px-3 py-3 border border-[#d9d9d9] bg-white text-[14px] text-[#1a1a1a] placeholder:text-[var(--plug-gray)] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="+54 9 261 123-4567"
                  />
                </div>
                <div>
                  <label
                    htmlFor="direccion"
                    className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2"
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
                    className="w-full px-3 py-3 border border-[#d9d9d9] bg-white text-[14px] text-[#1a1a1a] placeholder:text-[var(--plug-gray)] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="Calle, número, ciudad"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notas"
                  className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2"
                >
                  Notas adicionales
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  value={form.notas}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-[#d9d9d9] bg-white text-[14px] text-[#1a1a1a] placeholder:text-[var(--plug-gray)] focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none"
                  placeholder="Indicaciones de entrega, horarios, etc."
                />
              </div>
            </div>

            {error && (
              <div className="p-4 border border-red-200 bg-red-50 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="plug-btn-dark plug-btn w-full"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={4}
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
          <div className="plug-bg-footer p-6 lg:p-8 sticky top-24">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-6">
              Tu pedido
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-[#d9d9d9] overflow-hidden">
                    {item.imagen ? (
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
                      {item.nombre}
                    </p>
                    <p className="text-[11px] text-[var(--plug-gray)]">x{item.cantidad}</p>
                  </div>
                  <span className="text-[13px] font-medium text-[#1a1a1a]">
                    {formatPrice(item.precio_ars * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#d9d9d9] space-y-2 text-[13px]">
              <div className="flex justify-between text-[var(--plug-gray)]">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[var(--plug-gray)]">
                <span>Envío</span>
                <span className="text-[#1a1a1a] font-medium">A coordinar</span>
              </div>
              <div className="pt-3 border-t border-[#d9d9d9] flex justify-between text-[15px]">
                <span className="font-medium text-[#1a1a1a]">Total</span>
                <span className="font-medium text-[#1a1a1a]">
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
