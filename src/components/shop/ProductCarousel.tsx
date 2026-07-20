"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { ProductCard } from "@/components/shop/ProductCard";

interface ProductCarouselProps {
  title: string;
  products: ShopProduct[];
  cta?: { label: string; href: string };
}

export function ProductCarousel({ title, products, cta }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Triplicamos los productos para crear un loop infinito bidireccional limpio y transparente
  const extendedProducts = products.length > 0 ? [...products, ...products, ...products] : [];

  const checkScrollLoop = useCallback(() => {
    const el = scrollRef.current;
    if (!el || products.length === 0) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const oneThirdWidth = scrollWidth / 3;

    // Si el scroll llega cerca del inicio del primer bloque, saltamos silenciosamente al bloque central
    if (scrollLeft < 10) {
      el.scrollLeft = scrollLeft + oneThirdWidth;
    }
    // Si llega al final del tercer bloque, saltamos silenciosamente al bloque central
    else if (scrollLeft + clientWidth > scrollWidth - 10) {
      el.scrollLeft = scrollLeft - oneThirdWidth;
    }
  }, [products.length]);

  const scrollByAmount = useCallback((amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  // Inicializar el scroll justo en el bloque del medio una vez montado el layout
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || products.length === 0) return;

    const initializeScroll = () => {
      const oneThirdWidth = el.scrollWidth / 3;
      el.scrollLeft = oneThirdWidth;
    };

    const timeoutId = setTimeout(initializeScroll, 50);

    el.addEventListener("scroll", checkScrollLoop, { passive: true });
    window.addEventListener("resize", checkScrollLoop);

    return () => {
      clearTimeout(timeoutId);
      el.removeEventListener("scroll", checkScrollLoop);
      window.removeEventListener("resize", checkScrollLoop);
    };
  }, [products, checkScrollLoop]);

  // Auto-scroll infinito fluido y pausable
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isHovered || products.length === 0) return;

    const interval = setInterval(() => {
      el.scrollBy({ left: 320, behavior: "smooth" });
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, products.length]);

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white font-sans">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="flex items-end justify-between gap-4 mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {title}
          </h2>

          <div className="flex items-center gap-3 flex-shrink-0">
            {cta && (
              <Link
                href={cta.href}
                className="group/link hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d1d1f] hover:text-[#86868b] transition-colors pb-1 mr-2"
              >
                {cta.label}
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* Controles de navegación (Siempre activos gracias al desplazamiento infinito) */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => scrollByAmount(-340)}
                aria-label="Anterior"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] transition-colors duration-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollByAmount(340)}
                aria-label="Siguiente"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] transition-colors duration-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-5 lg:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 lg:px-12 pb-8 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {extendedProducts.map((product, index) => (
            <ProductCard
              key={`${product.id}-${index}`}
              product={product}
              index={index % products.length}
              className="flex-shrink-0 w-[240px] sm:w-[280px] lg:w-[300px] snap-start"
            />
          ))}
        </div>

        {/* Degradados laterales fijos */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-44 bg-gradient-to-r from-white via-white/25 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-44 bg-gradient-to-l from-white via-white/25 to-transparent" />
      </div>
    </section>
  );
}
