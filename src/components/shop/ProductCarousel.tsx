"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

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
        <div className="flex items-center justify-between mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {title}
          </h2>

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

      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 lg:px-12 pb-8 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {extendedProducts.map((product, index) => {
            const hasDiscount = product.precio_original_ars && product.precio_original_ars > product.precio_ars;
            const discountPct = hasDiscount
              ? Math.round(((product.precio_original_ars! - product.precio_ars) / product.precio_original_ars!) * 100)
              : 0;

            return (
              <div
                key={`${product.id}-${index}`}
                className="group/card flex-shrink-0 w-[260px] sm:w-[300px] lg:w-[320px] snap-start relative flex flex-col"
              >
                {/* Contenedor de Imagen optimizado con transform-gpu para evitar lag del blur */}
                <div className="aspect-[4/5] bg-[#f5f5f7] rounded-[24px] relative overflow-hidden mb-5 transition-all duration-500 ease-out group-hover/card:scale-[1.02] transform-gpu backface-hidden">
                  <Link href={`/producto/${product.slug}`} className="block relative w-full h-full">
                    {product.fotos && product.fotos.length > 0 ? (
                      <CloudinaryImage
                        src={product.fotos[0]}
                        alt={product.nombre}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-105 transform-gpu backface-hidden"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
                    {hasDiscount && (
                      <span className="bg-white/80 backdrop-blur-md text-[#1d1d1f] text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full shadow-sm">
                        -{discountPct}%
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="bg-[#1d1d1f]/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full shadow-sm">
                        Agotado
                      </span>
                    )}
                  </div>

                  {/* Quick Add Overlay Sincronizado y Acelerado por Hardware */}
                  {product.stock > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-3 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 ease-out z-10 transform-gpu will-change-[transform,opacity]">
                      <div className="bg-white/70 backdrop-blur-xl rounded-[16px] shadow-sm overflow-hidden border border-white/20 transform-gpu">
                        <QuickAddPanel product={product} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info del producto */}
                <Link href={`/producto/${product.slug}`} className="flex flex-col gap-1 px-1">
                  {product.categoria && (
                    <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">
                      {product.categoria}
                    </p>
                  )}
                  <h3 className="text-[16px] font-medium text-[#1d1d1f] leading-snug line-clamp-2 mt-0.5">
                    {product.nombre}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[15px] font-semibold text-[#1d1d1f]">
                      {formatPrice(product.precio_ars)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[13px] text-[#86868b] line-through font-normal">
                        {formatPrice(product.precio_original_ars!)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Degradados laterales fijos */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-44 bg-gradient-to-r from-white via-white/25 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-44 bg-gradient-to-l from-white via-white/25 to-transparent" />
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
      <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#1d1d1f] py-3">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Añadido
      </div>
    );
  }

  if (product.talles && product.talles.length > 0) {
    return (
      <div className="flex flex-col w-full py-2 px-2">
        <span className="text-[10px] font-medium text-center text-[#86868b] mb-1.5">Seleccionar talle</span>
        <div className="flex flex-wrap gap-1.5 justify-center w-full max-h-[60px] overflow-y-auto scrollbar-hide">
          {product.talles.map((talle) => (
            <button
              key={talle}
              onClick={(e) => handleQuickAdd(e, talle)}
              className="px-3 py-1.5 text-[12px] font-medium bg-white text-[#1d1d1f] rounded-lg hover:bg-[#1d1d1f] hover:text-white transition-colors border border-transparent shadow-sm cursor-pointer"
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
      className="w-full text-[13px] font-medium text-[#1d1d1f] bg-transparent hover:bg-[#1d1d1f] hover:text-white transition-colors py-3 cursor-pointer"
    >
      Añadir a la bolsa
    </button>
  );
}