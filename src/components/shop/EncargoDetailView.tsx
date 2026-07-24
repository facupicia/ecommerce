"use client";

import { useState } from "react";
import Link from "next/link";
import type { EncargoProduct, EncargoProductVariant } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Check, ShoppingBag, ArrowRight, X } from "lucide-react";

interface EncargoDetailViewProps {
  product: EncargoProduct;
}

const CNY_USD_RATE = 7.2;

function formatUSD(cny: number): string {
  return `US$${(cny / CNY_USD_RATE).toFixed(2)}`;
}

export function EncargoDetailView({ product }: EncargoDetailViewProps) {
  const images = product.image_urls || [];
  const descImages = product.desc_images || [];
  const variants = product.variants || [];

  const [selectedVariant, setSelectedVariant] = useState<EncargoProductVariant | null>(
    variants[0] || null
  );
  const [selectedTalle, setSelectedTalle] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(
    variants[0]?.image_url || images[0] || ""
  );

  // Form fields
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  
  // Mobile quick form modal state
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const activePriceCny = selectedVariant?.price_cny ?? product.price_cny ?? 0;

  // When variant changes, update main image to variant image if available
  const handleSelectVariant = (variant: EncargoProductVariant) => {
    setSelectedVariant(variant);
    setSelectedTalle("");
    if (variant.image_url) {
      setActiveImage(variant.image_url);
    }
  };

  const handleSubmitOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
          product_image: activeImage || selectedVariant?.image_url || images[0] || null,
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
      setIsMobileModalOpen(false);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleOpenFormModal = () => {
    setIsMobileModalOpen(true);
  };

  const scrollToForm = () => {
    const el = document.getElementById("encargo-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#86868b] mb-6">
        <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/encargos" className="hover:text-[#1d1d1f] transition-colors">Encargos</Link>
        <span>/</span>
        <span className="text-[#1d1d1f] truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Confirmation View */}
      {sent ? (
        <div className="max-w-2xl mx-auto bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-8 sm:p-12 text-center shadow-sm my-8">
          <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#16a34a]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] mb-3">¡Encargo recibido con éxito!</h2>
          <p className="text-[#374151] text-base leading-relaxed mb-6">
            Recibimos tu solicitud para <strong className="text-[#1d1d1f]">{product.title}</strong>.
            Te vamos a contactar a la brevedad por email o WhatsApp para coordinar el pago y el envío.
          </p>
          <Link
            href="/encargos"
            className="inline-flex items-center justify-center px-6 py-3.5 text-white font-medium rounded-2xl text-sm transition-colors border-black  "
          >
            Ver otros productos de encargo
          </Link>
        </div>  
      ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Columna Izquierda: Galería e Imágenes */}
          <div className="lg:col-span-7 space-y-6">
            {/* Foto principal grande */}
            <div className="aspect-[4/5] bg-[#f5f5f7] rounded-3xl overflow-hidden relative shadow-sm border border-[#ebebeb]">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9ca3af]">
                  Sin imagen disponible
                </div>
              )}
            </div>

            {/* Miniaturas de galería */}
            {images.length > 1 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-3">
                  Fotos del producto
                </h4>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative aspect-square w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === imgUrl
                          ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Columna Derecha: Selección y Formulario Sticky */}
          <div className="lg:col-span-5 sticky top-24">
            <div id="encargo-form-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaecf0] shadow-sm space-y-6">
              {/* Categoría y Tag */}
              <div className="flex items-center gap-2">
                <span className="bg-[#7c3aed]/10 text-[#7c3aed] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Producto por encargo
                </span>
                {product.category && (
                  <span className="text-xs text-[#86868b] uppercase tracking-wider font-medium">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] leading-snug">
                {product.title}
              </h1>

              {/* Precio */}
              {activePriceCny > 0 && (
                <div className="flex items-baseline gap-2 pb-2">
                  <span className="text-3xl font-extrabold text-[#1d1d1f]">
                    {formatUSD(activePriceCny)}
                  </span>
                  <span className="text-xs text-[#86868b]">
                    (¥{activePriceCny} base)
                  </span>
                </div>
              )}

              <hr className="border-[#f0f0f0]" />

              {/* Selector de Variantes */}
              {variants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]">
                      Variante / Color ({variants.length})
                    </label>
                    {selectedVariant && (
                      <span className="text-xs text-[#7c3aed] font-semibold truncate max-w-[180px]">
                        {selectedVariant.name}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {variants.map((v, i) => {
                      const isSelected = selectedVariant === v;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectVariant(v)}
                          className={`flex items-center gap-2.5 p-2 rounded-2xl border-2 text-xs text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-[#7c3aed]/5 font-semibold text-[#7c3aed]"
                              : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#d1d5db]"
                          }`}
                        >
                          {v.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={v.image_url}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover bg-[#f5f5f7] flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[10px] text-[#9ca3af] flex-shrink-0">
                              Foto
                            </div>
                          )}
                          <span className="line-clamp-2 leading-tight">{v.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selector de Talle */}
              {selectedVariant && selectedVariant.sizes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-3">
                    Seleccioná tu talle
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.sizes.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedTalle(s.name)}
                        className={`px-4 py-2.5 rounded-xl border-2 text-xs font-medium transition-all cursor-pointer ${
                          selectedTalle === s.name
                            ? "border-[#7c3aed] bg-[#7c3aed] text-white font-bold"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-10 h-10 rounded-xl border border-[#e5e7eb] flex items-center justify-center text-lg font-medium hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-base font-bold w-8 text-center">{cantidad}</span>
                  <button
                    type="button"
                    onClick={() => setCantidad(cantidad + 1)}
                    className="w-10 h-10 rounded-xl border border-[#e5e7eb] flex items-center justify-center text-lg font-medium hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                  {activePriceCny > 0 && (
                    <span className="ml-auto text-sm font-bold text-[#7c3aed]">
                      Total: {formatUSD(activePriceCny * cantidad)}
                    </span>
                  )}
                </div>
              </div>

              {/* Botón directo para mobile para abrir modal y no scrollear */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={handleOpenFormModal}
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-[#7c3aed]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cargar datos y Encargar
                </button>
              </div>

              {/* Formulario de datos integrado (Desktop e Inline) */}
              <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
                <div className="hidden lg:block border-t border-[#f0f0f0] pt-4">
                  <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">Tus Datos de Contacto</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6b7280] mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        placeholder="Ej: Juan Pérez"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#e5e7eb] text-xs focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#6b7280] mb-1">
                        Email de contacto *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="tu@email.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#e5e7eb] text-xs focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6b7280] mb-1">
                          Teléfono / WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          placeholder="+54 9 ..."
                          className="w-full px-3 py-2 rounded-xl border border-[#e5e7eb] text-xs focus:outline-none focus:border-[#7c3aed]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6b7280] mb-1">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          placeholder="Ciudad / Calle"
                          className="w-full px-3 py-2 rounded-xl border border-[#e5e7eb] text-xs focus:outline-none focus:border-[#7c3aed]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#6b7280] mb-1">
                        Notas adicionales
                      </label>
                      <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        rows={2}
                        placeholder="Detalles sobre talle, color..."
                        className="w-full px-3 py-2 rounded-xl border border-[#e5e7eb] text-xs focus:outline-none focus:border-[#7c3aed] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2 text-xs text-[#dc2626]">
                    {error}
                  </div>
                )}

                <div className="hidden lg:block">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-[#7c3aed]/20 disabled:opacity-50 cursor-pointer"
                  >
                    {sending ? "Enviando solicitud..." : "Confirmar Encargo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Fotos de detalle — FUERA del grid para no alargar la columna izquierda */}
        {descImages.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#f0f0f0] max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Fotos de detalle del producto</h3>
            <div className="space-y-4">
              {descImages.map((imgUrl, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden bg-[#f5f5f7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        </>
      )}

      {/* Floating Bottom Bar for Mobile to Order without Scrolling */}
      {!sent && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebebeb] p-3 px-4 flex items-center justify-between shadow-2xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#86868b] block">Total</span>
            <span className="text-base font-extrabold text-[#1d1d1f]">
              {activePriceCny > 0 ? formatUSD(activePriceCny * cantidad) : "Encargo"}
            </span>
          </div>
          <button
            onClick={handleOpenFormModal}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-[#7c3aed]/30 cursor-pointer"
          >
            <span>Encargar Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Form Modal (Sin obligar a scrollear) */}
      <Dialog open={isMobileModalOpen} onOpenChange={setIsMobileModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Datos para tu Encargo</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
            <div className="bg-[#f5f5f7] p-3 rounded-2xl flex items-center gap-3">
              {activeImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#1d1d1f] truncate">{product.title}</p>
                <p className="text-[11px] text-[#7c3aed] font-medium">
                  {selectedVariant?.name || "Estándar"} {selectedTalle ? `• Talle ${selectedTalle}` : ""} • {cantidad} u.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre y apellido"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+54 9 ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Dirección de envío
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección / Ciudad"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Notas extras
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                placeholder="Comentarios adicionales..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:border-[#7c3aed] resize-none"
              />
            </div>

            {error && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2 text-xs text-[#dc2626]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-[#7c3aed]/25 disabled:opacity-50 cursor-pointer"
            >
              {sending ? "Enviando..." : "Confirmar Encargo"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
