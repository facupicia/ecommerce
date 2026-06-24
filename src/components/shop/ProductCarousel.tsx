"use client";

import { useRef, useEffect, useState, useCallback } from "react";
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const scrollByAmount = useCallback((amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  // Auto-scroll suave; se pausa al hacer hover o al interactuar.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isHovered) return;

    const interval = setInterval(() => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 10;

      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, products.length]);

  if (products.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <div>
            <h2 className="plug-font-serif text-2xl sm:text-3xl text-[#1a1a1a]">
              {title}
            </h2>
            <div className="w-10 h-0.5 bg-[#1a1a1a] mt-3" />
          </div>

          {/* Controles de navegación */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollByAmount(-340)}
              disabled={!canScrollLeft}
              aria-label="Anterior"
              className="w-10 h-10 flex items-center justify-center border border-[#d9d9d9] text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1a1a1a]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scrollByAmount(340)}
              disabled={!canScrollRight}
              aria-label="Siguiente"
              className="w-10 h-10 flex items-center justify-center border border-[#d9d9d9] text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1a1a1a]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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

      {/* Carrusel */}
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 lg:px-10 pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => {
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
                className="group/card flex-shrink-0 w-[240px] sm:w-[280px] lg:w-[300px] snap-start"
              >
                {/* Imagen */}
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
                  <h3 className="plug-font-serif text-[14px] sm:text-[15px] leading-snug text-[#1a1a1a] group-hover/card:text-[var(--plug-gray)] transition-colors line-clamp-2">
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

        {/* Degradados laterales: suavizan el corte sin recortar las imágenes */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 lg:w-16 bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 lg:w-16 bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </section>
  );
}
