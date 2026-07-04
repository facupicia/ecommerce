"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { getMercadoPagoPrice } from "@/lib/pricing";

interface MiniCartProps {
  open: boolean;
  onClose: () => void;
}

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export function MiniCart({ open, onClose }: MiniCartProps) {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[60px] px-5 border-b border-[#d9d9d9] flex-shrink-0">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
            Carrito ({items.reduce((s, i) => s + i.cantidad, 0)})
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <svg className="w-16 h-16 text-[var(--plug-gray)] opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[14px] text-[var(--plug-gray)]">Tu carrito está vacío</p>
              <button onClick={onClose} className="plug-link-underline text-[12px] text-[#1a1a1a] mt-3">
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product_id}-${item.talle || ""}`} className="flex gap-3 pb-4 border-b border-[#ebebeb]">
                <Link
                  href={`/producto/${item.slug}`}
                  onClick={onClose}
                  className="relative w-20 h-20 flex-shrink-0 bg-[#f5f5f5] overflow-hidden rounded-sm"
                >
                  {item.imagen ? (
                    <CloudinaryImage
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--plug-gray)] text-xs">Sin foto</div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={onClose}
                      className="text-[13px] font-medium text-[#1a1a1a] leading-snug line-clamp-1 hover:text-[var(--plug-gray)] transition-colors"
                    >
                      {item.nombre}
                    </Link>
                    {item.talle && (
                      <p className="text-[10px] text-[var(--plug-gray)] mt-0.5">
                        Talle: <span className="font-semibold text-[#1a1a1a]">{item.talle}</span>
                      </p>
                    )}
                    <p className="text-[12px] font-medium text-[#1a1a1a] mt-1">
                      {formatPrice(item.precio_ars)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.cantidad - 1, item.talle)}
                        className="w-7 h-7 flex items-center justify-center border border-[#d9d9d9] text-[12px] hover:border-[#1a1a1a] transition-colors"
                        aria-label="Reducir"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-[12px] font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.cantidad + 1, item.talle)}
                        className="w-7 h-7 flex items-center justify-center border border-[#d9d9d9] text-[12px] hover:border-[#1a1a1a] transition-colors"
                        aria-label="Aumentar"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id, item.talle)}
                      className="text-[10px] text-[var(--plug-gray)] hover:text-red-600 transition-colors uppercase tracking-wider"
                      aria-label="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-[#d9d9d9] space-y-3 bg-[#fafafa]">
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-medium text-[#1a1a1a]">Total (transferencia)</span>
              <span className="font-semibold text-[#1a1a1a]">{formatPrice(total)}</span>
            </div>
            <p className="text-[10px] text-[var(--plug-gray)]">
              Mercado Pago: {formatPrice(getMercadoPagoPrice(total))} (+6% recargo)
            </p>
            <p className="text-[10px] text-[var(--plug-gray)] text-center">
              Envío calculado en el checkout
            </p>
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="plug-btn-dark plug-btn w-full block text-center"
              >
                Ir a pagar
              </Link>
              <Link
                href="/carrito"
                onClick={onClose}
                className="plug-btn w-full block text-center text-[11px]"
              >
                Ver carrito completo
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
