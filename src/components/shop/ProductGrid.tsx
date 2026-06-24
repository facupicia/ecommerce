"use client";

import Link from "next/link";
import type { ShopProduct } from "@/lib/types";

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
              <Link
                key={product.id}
                href={`/producto/${product.slug}`}
                className={`group block plug-fade-up plug-stagger-${Math.min(i + 1, 8)}`}
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden mb-3">
                  {product.fotos && product.fotos.length > 0 ? (
                    <img
                      src={product.fotos[0]}
                      alt={product.nombre}
                      className="w-full h-full object-cover plug-img-hover"
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
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {hasDiscount && (
                      <span className="plug-badge plug-badge-sale">
                        -{discountPct}%
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="plug-badge plug-badge-oot">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
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
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
