"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

interface ProductGridProps {
  title: string;
  products: ShopProduct[];
}

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export function ProductGrid({ title, products }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <h2 className="plug-font-serif text-2xl sm:text-3xl text-[#1a1a1a] mb-2">
          {title}
        </h2>
        <div className="w-10 h-0.5 bg-[#1a1a1a] mb-8 lg:mb-10" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {products.map((product, i) => {
            const hasDiscount =
              product.precio_original_ars &&
              product.precio_original_ars > product.precio_ars;
            const discountPct = hasDiscount
              ? Math.round(
                  ((product.precio_original_ars! - product.precio_ars) /
                    product.precio_original_ars!) *
                    100
                )
              : 0;

            return (
              <div
                key={product.id}
                className={`group block relative plug-fade-up plug-stagger-${Math.min(i + 1, 8)}`}
              >
                {/* Image Container */}
                <div className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden mb-3 shadow-xs">
                  <Link href={`/producto/${product.slug}`} className="block relative w-full h-full">
                    {product.fotos && product.fotos.length > 0 ? (
                      <CloudinaryImage
                        src={product.fotos[0]}
                        alt={product.nombre}
                        fill
                        className="object-cover plug-img-hover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--plug-gray)]">
                        <svg
                          className="w-12 h-12"
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

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
                    {hasDiscount && (
                      <span className="plug-badge plug-badge-sale shadow-sm font-semibold rounded-xs">
                        -{discountPct}%
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="plug-badge plug-badge-oot shadow-sm font-semibold rounded-xs">
                        Agotado
                      </span>
                    )}
                  </div>

                  {/* Quick Add Overlay */}
                  {product.stock > 0 && (
                    <div className="plug-quick-add hidden md:flex items-center justify-center z-10">
                      <QuickAddPanel product={product} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <Link href={`/producto/${product.slug}`} className="space-y-1 block">
                  {product.categoria && (
                    <p className="plug-tag">{product.categoria}</p>
                  )}
                  <h3 className="plug-font-serif text-[14px] sm:text-[15px] leading-snug text-[#1a1a1a] group-hover:text-[var(--plug-gray)] transition-colors line-clamp-2">
                    {product.nombre}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] sm:text-[14px] font-medium text-[#1a1a1a]">
                      {formatPrice(product.precio_ars)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[12px] text-[#737373] line-through">
                        {formatPrice(product.precio_original_ars!)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QuickAddPanel({ product }: { product: ShopProduct }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent, talle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      nombre: product.nombre,
      precio_ars: product.precio_ars,
      cantidad: 1,
      imagen: product.fotos?.[0] ?? "",
      slug: product.slug,
      talle,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (added) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400 py-1">
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        ¡Agregado!
      </div>
    );
  }

  if (product.talles && product.talles.length > 0) {
    return (
      <div className="flex flex-col gap-1 w-full items-center">
        <span className="text-[8px] uppercase tracking-wider text-white/50 mb-0.5">Talle rápido</span>
        <div className="flex flex-wrap gap-1 justify-center w-full max-h-[44px] overflow-y-auto px-1">
          {product.talles.map((talle) => (
            <button
              key={talle}
              onClick={(e) => handleQuickAdd(e, talle)}
              className="px-2 py-0.5 text-[9px] font-bold bg-white text-black hover:bg-neutral-200 transition-colors uppercase border border-transparent shadow-xs cursor-pointer"
            >
              {talle}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => handleQuickAdd(e)}
      className="w-full text-[10px] font-bold text-white bg-transparent hover:text-black hover:bg-white transition-colors py-1.5 uppercase cursor-pointer"
    >
      Agregar al carrito
    </button>
  );
}
