"use client";

import { useRef } from "react";
import Link from "next/link";
import type { ShopProduct } from "@/lib/types";

interface ProductCarouselProps {
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

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 280;
    const gap = 16;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="plug-font-serif text-2xl sm:text-3xl text-[#1a1a1a]">
            {title}
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 flex items-center justify-center border border-[#d9d9d9] text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
              aria-label="Anterior"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 flex items-center justify-center border border-[#d9d9d9] text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
              aria-label="Siguiente"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 lg:px-10 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/producto/${product.slug}`}
            className="group flex-shrink-0 w-[260px] sm:w-[300px] lg:w-[320px] snap-start"
          >
            <div className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden mb-3">
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
                  <span className="px-3 py-1.5 border border-[#1a1a1a] text-[10px] font-medium uppercase tracking-wider text-[#1a1a1a]">
                    Sin stock
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              {product.categoria && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#777777]">
                  {product.categoria}
                </p>
              )}
              <h3 className="plug-font-serif text-[13px] sm:text-[14px] leading-snug text-[#1a1a1a] group-hover:text-[#777777] transition-colors line-clamp-2">
                {product.nombre}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] sm:text-[13px] font-medium text-[#1a1a1a]">
                  {formatPrice(product.precio_ars)}
                </span>
                {product.precio_original_ars &&
                  product.precio_original_ars > product.precio_ars && (
                    <span className="text-[11px] text-[#777777] line-through">
                      {formatPrice(product.precio_original_ars)}
                    </span>
                  )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
