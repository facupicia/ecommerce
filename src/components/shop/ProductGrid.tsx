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
        <h2 className="kith-font-serif text-2xl sm:text-3xl text-[#333333] mb-8 lg:mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/producto/${product.slug}`}
              className="group block"
            >
              <div className="aspect-[3/4] bg-[#f2f2f2] relative overflow-hidden mb-3">
                {product.fotos && product.fotos.length > 0 ? (
                  <img
                    src={product.fotos[0]}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#d9d9d9]">
                    <svg
                      className="w-14 h-14"
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
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="px-3 py-1.5 border border-[#333333] text-[10px] font-medium uppercase tracking-wider text-[#333333]">
                      Sin stock
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {product.categoria && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#828282]">
                    {product.categoria}
                  </p>
                )}
                <h3 className="kith-font-serif text-[13px] sm:text-[14px] leading-snug text-[#333333] group-hover:text-[#828282] transition-colors line-clamp-2">
                  {product.nombre}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[12px] sm:text-[13px] font-medium text-[#333333]">
                    {formatPrice(product.precio_ars)}
                  </p>
                  {product.precio_original_ars && product.precio_original_ars > product.precio_ars && (
                    <>
                      <p className="text-[11px] sm:text-[12px] text-[#999999] line-through">
                        {formatPrice(product.precio_original_ars)}
                      </p>
                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        -{Math.round(((product.precio_original_ars - product.precio_ars) / product.precio_original_ars) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
