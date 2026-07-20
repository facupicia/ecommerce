"use client";

import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

interface EncargosGridProps {
  products: ShopProduct[];
  title?: string;
}

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export function EncargosGrid({ products, title = "Encargos" }: EncargosGridProps) {
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <h2 className="plug-font-serif text-3xl text-[#1a1a1a] mb-2">Sin productos de encargo</h2>
        <p className="text-[var(--plug-gray)]">Pronto subiremos nuevos ítems para encargar.</p>
      </div>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white font-sans">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-10 lg:mb-12 text-center max-w-2xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] text-[#86868b] mb-3">Encargá</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">{title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--plug-gray)]">
            Elegí lo que te gusta y lo traemos por vos. Pagás una seña del 50% y en ~30 días lo tenés.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, i) => {
            const hasDiscount = product.precio_original_ars && product.precio_original_ars > product.precio_ars;
            const discountPct = hasDiscount
              ? Math.round(((product.precio_original_ars! - product.precio_ars) / product.precio_original_ars!) * 100)
              : 0;
            const staggerClass = `plug-fade-up plug-stagger-${Math.min(i + 1, 8)}`;

            return (
              <div key={product.id} className={`group block relative flex flex-col ${staggerClass}`}>
                <div className="aspect-[4/5] bg-[#f5f5f7] rounded-[24px] relative overflow-hidden mb-5 transition-all duration-500 ease-out group-hover:scale-[1.02] transform-gpu backface-hidden">
                  <Link href={`/encargos/nuevo?producto=${product.id}`} className="block relative w-full h-full">
                    {product.fotos && product.fotos.length > 0 ? (
                      <CloudinaryImage
                        src={product.fotos[0]}
                        alt={product.nombre}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 transform-gpu backface-hidden"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
                    {hasDiscount && (
                      <span className="bg-white/80 backdrop-blur-md text-[#1d1d1f] text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full shadow-sm">-{discountPct}%</span>
                    )}
                    <span className="bg-[#1d1d1f]/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full shadow-sm">Encargo</span>
                  </div>

                  <div className="hidden md:block absolute bottom-4 left-4 right-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-10 transform-gpu will-change-[transform,opacity]">
                    <Link
                      href={`/encargos/nuevo?producto=${product.id}`}
                      className="block w-full text-center text-[13px] font-medium text-[#1d1d1f] bg-white/70 backdrop-blur-xl hover:bg-[#1d1d1f] hover:text-white transition-colors py-3 rounded-[16px] border border-white/20"
                    >
                      Encargar
                    </Link>
                  </div>
                </div>

                <Link href={`/encargos/nuevo?producto=${product.id}`} className="flex flex-col gap-1 px-1">
                  {product.categoria && <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">{product.categoria}</p>}
                  <h3 className="text-[16px] font-medium text-[#1d1d1f] leading-snug line-clamp-2 mt-0.5 transition-colors">{product.nombre}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[15px] font-semibold text-[#1d1d1f]">{formatPrice(product.precio_ars)}</span>
                    {hasDiscount && <span className="text-[13px] text-[#86868b] line-through font-normal">{formatPrice(product.precio_original_ars!)}</span>}
                  </div>
                  <p className="text-[11px] text-[var(--plug-gray)] mt-1">Seña 50% · ~30 días</p>
                </Link>

                <Link
                  href={`/encargos/nuevo?producto=${product.id}`}
                  className="md:hidden mt-3 block w-full text-center text-[12px] font-medium bg-[#1d1d1f] text-white py-2.5 rounded-[12px] hover:bg-[#333] transition-colors"
                >
                  Encargar
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
