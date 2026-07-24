"use client";

import { useState } from "react";
import type { EncargoProduct, EncargoProductVariant } from "@/lib/types";

interface EncargoFormProps {
  product: EncargoProduct;
}

const CNY_USD_RATE = 7.2;

function formatUSD(cny: number): string {
  return `US$${(cny / CNY_USD_RATE).toFixed(2)}`;
}

export function EncargoForm({ product }: EncargoFormProps) {
  const [selectedVariant, setSelectedVariant] = useState<EncargoProductVariant | null>(
    product.variants?.[0] || null
  );
  const [selectedTalle, setSelectedTalle] = useState<string>("");
  const [cantidad, setCantidad] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const activePriceCny =
    selectedVariant?.price_cny ?? product.price_cny ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }

    setSending(true);
    try {
      const resp = await fetch("/api/encargos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          product_title: product.title,
          product_image: selectedVariant?.image_url || product.image_urls?.[0] || null,
          variante_nombre: selectedVariant?.name || null,
          variante_imagen: selectedVariant?.image_url || null,
          talle: selectedTalle || null,
          precio_cny: activePriceCny,
          cantidad,
          cliente_nombre: nombre.trim(),
          cliente_email: email.trim(),
          cliente_telefono: telefono.trim() || null,
          cliente_direccion: direccion.trim() || null,
          cliente_notas: notas.trim() || null,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "Error al enviar el encargo.");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">¡Encargo recibido!</h3>
        <p className="text-[#374151] text-sm leading-relaxed max-w-md mx-auto">
          Recibimos tu solicitud de encargo. Te vamos a contactar pronto por email para confirmar los detalles y el precio final.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Variantes */}
      {product.variants.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Variante
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedVariant(v);
                  setSelectedTalle("");
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all cursor-pointer ${
                  selectedVariant === v
                    ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed] font-medium"
                    : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#d1d5db]"
                }`}
              >
                {v.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.image_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover bg-[#f5f5f7]"
                  />
                )}
                <span className="line-clamp-1">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Talles */}
      {selectedVariant && selectedVariant.sizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Talle
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedVariant.sizes.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedTalle(s.name)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                  selectedTalle === s.name
                    ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]"
                    : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#d1d5db]"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cantidad */}
      <div>
        <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
          Cantidad
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="w-10 h-10 rounded-xl border-2 border-[#e5e7eb] flex items-center justify-center text-lg font-medium hover:bg-[#f5f5f7] transition-colors cursor-pointer"
          >
            −
          </button>
          <span className="text-lg font-semibold w-8 text-center">{cantidad}</span>
          <button
            type="button"
            onClick={() => setCantidad(cantidad + 1)}
            className="w-10 h-10 rounded-xl border-2 border-[#e5e7eb] flex items-center justify-center text-lg font-medium hover:bg-[#f5f5f7] transition-colors cursor-pointer"
          >
            +
          </button>
          {activePriceCny > 0 && (
            <span className="ml-3 text-sm text-[#86868b]">
              Total: {formatUSD(activePriceCny * cantidad)}
            </span>
          )}
        </div>
      </div>

      <hr className="border-[#f0f0f0]" />

      {/* Datos del cliente */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#1d1d1f]">Tus datos</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre completo"
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+54 9 341 ..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
              Dirección de envío
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Tu dirección"
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
            Comentarios / notas
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="¿Algún detalle extra? Ej: color preferido, urgencia, etc."
            className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3 text-sm text-[#dc2626]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-3.5 rounded-2xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#7c3aed]/20"
      >
        {sending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </span>
        ) : (
          "Enviar encargo"
        )}
      </button>

      <p className="text-[11px] text-[#86868b] text-center leading-relaxed">
        Al enviar, nos llega tu pedido por email. Te contactamos para confirmar disponibilidad, precio final y forma de pago.
      </p>
    </form>
  );
}
