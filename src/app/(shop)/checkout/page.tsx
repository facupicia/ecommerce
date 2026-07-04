"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { MercadoPagoBadge } from "@/components/shop/MercadoPagoBadge";
import { getMercadoPagoPrice } from "@/lib/pricing";
import type { ShopSettings } from "@/lib/settings";

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
  const [paymentMethod, setPaymentMethod] = useState<"transferencia" | "mercadopago">("transferencia");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || data))
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const activeTotal = paymentMethod === "mercadopago" ? getMercadoPagoPrice(total) : total;

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
            talle: i.talle || null,
            precio_ars: i.precio_ars,
            cantidad: i.cantidad,
            imagen: i.imagen,
          })),
          total_ars: activeTotal,
          payment_method: paymentMethod,
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

      if (paymentMethod === "mercadopago" && data.mp_init_point) {
        window.location.href = data.mp_init_point;
      } else {
        router.push(`/checkout/confirmado?order=${data.order_id}&method=${paymentMethod}`);
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
            {/* Contacto */}
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
                    autoComplete="name"
                    value={form.nombre}
                    onChange={handleChange}
                    aria-required="true"
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
                    autoComplete="email"
                    inputMode="email"
                    value={form.email}
                    onChange={handleChange}
                    aria-required="true"
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
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.telefono}
                    onChange={handleChange}
                    aria-required="true"
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
                    autoComplete="street-address"
                    value={form.direccion}
                    onChange={handleChange}
                    aria-required="true"
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
                  className="resize-none"
                  placeholder="Indicaciones de entrega, horarios, etc."
                />
              </div>
            </div>

            {/* Método de pago */}
            <div className="border border-[#d9d9d9] p-6 lg:p-8 space-y-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]">
                Método de pago
              </h2>

              {/* Transferencia */}
              <label
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors rounded-sm ${
                  paymentMethod === "transferencia"
                    ? "border-[#1a1a1a] bg-[#fafafa]"
                    : "border-[#ebebeb] hover:border-[#d9d9d9]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transferencia"
                  checked={paymentMethod === "transferencia"}
                  onChange={() => setPaymentMethod("transferencia")}
                  className="mt-0.5 accent-[#1a1a1a]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                    <span className="text-[13px] font-medium text-[#1a1a1a]">
                      Transferencia bancaria
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Sin recargo
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--plug-gray)] mt-1">
                    Pagá directo sin comisiones. Te enviamos los datos por WhatsApp/email al confirmar.
                  </p>

                  {/* Datos bancarios si está seleccionado */}
                  {paymentMethod === "transferencia" && settings && (
                    <div className="mt-3 p-3 bg-white border border-[#ebebeb] rounded-sm space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--plug-gray)] mb-2">
                        Datos para transferir
                      </p>
                      {settings.transferenciaAlias && (
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-[var(--plug-gray)]">Alias</span>
                          <span className="font-mono font-medium text-[#1a1a1a] select-all">
                            {settings.transferenciaAlias}
                          </span>
                        </div>
                      )}
                      {settings.transferenciaCBU && (
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-[var(--plug-gray)]">CBU/CVU</span>
                          <span className="font-mono font-medium text-[#1a1a1a] select-all">
                            {settings.transferenciaCBU}
                          </span>
                        </div>
                      )}
                      {settings.transferenciaTitular && (
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-[var(--plug-gray)]">Titular</span>
                          <span className="font-medium text-[#1a1a1a]">
                            {settings.transferenciaTitular}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* Mercado Pago */}
              <label
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors rounded-sm ${
                  paymentMethod === "mercadopago"
                    ? "border-[#1a1a1a] bg-[#fafafa]"
                    : "border-[#ebebeb] hover:border-[#d9d9d9]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mercadopago"
                  checked={paymentMethod === "mercadopago"}
                  onChange={() => setPaymentMethod("mercadopago")}
                  className="mt-0.5 accent-[#1a1a1a]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    <span className="text-[13px] font-medium text-[#1a1a1a]">
                      Mercado Pago
                    </span>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      +6% recargo
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--plug-gray)] mt-1">
                    Pagá con tarjeta, débito o dinero en cuenta. Serás redirigido a Mercado Pago para completar.
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-4 border border-[var(--destructive)] bg-red-50 text-[13px] text-[var(--destructive)] rounded-sm"
              >
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="plug-btn-dark plug-btn w-full"
                aria-busy={submitting}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </span>
                ) : paymentMethod === "transferencia" ? (
                  "Confirmar pedido con transferencia"
                ) : (
                  "Ir a pagar con Mercado Pago"
                )}
              </button>

              {paymentMethod === "mercadopago" ? (
                <>
                  <MercadoPagoBadge className="w-full justify-center" />
                  <p className="text-[11px] text-center text-[var(--plug-gray)] leading-relaxed">
                    Serás redirigido a Mercado Pago para completar el pago de forma segura.
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-center text-[var(--plug-gray)] leading-relaxed">
                  Recibirás los datos de pago y confirmación por email y WhatsApp.
                </p>
              )}
            </div>
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
                <div key={`${item.product_id}-${item.talle || ""}`} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-[#d9d9d9] overflow-hidden">
                    {item.imagen ? (
                      <CloudinaryImage
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
                      {item.nombre}
                    </p>
                    <p className="text-[11px] text-[var(--plug-gray)] flex items-center gap-1.5">
                      <span>x{item.cantidad}</span>
                      {item.talle && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span>Talle: {item.talle}</span>
                        </>
                      )}
                    </p>
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

              {paymentMethod === "mercadopago" && (
                <div className="flex justify-between text-[12px] text-amber-600">
                  <span>Recargo Mercado Pago (6%)</span>
                  <span>+{formatPrice(getMercadoPagoPrice(total) - total)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#d9d9d9] flex justify-between text-[15px]">
                <span className="font-medium text-[#1a1a1a]">Total</span>
                <span className="font-semibold text-[#1a1a1a]">
                  {formatPrice(activeTotal)}
                </span>
              </div>

              <div className="flex justify-between text-[12px]">
                <span className="text-[var(--plug-gray)]">
                  {paymentMethod === "transferencia" ? "Transferencia" : "Mercado Pago"}
                </span>
                <span className="text-[var(--plug-gray)]">
                  {paymentMethod === "transferencia" ? "Sin recargo" : `MP: ${formatPrice(getMercadoPagoPrice(total))}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
