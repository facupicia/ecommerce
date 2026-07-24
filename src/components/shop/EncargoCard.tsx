"use client";

import Link from "next/link";
import type { EncargoProduct } from "@/lib/types";

interface EncargoCardProps {
  product: EncargoProduct;
  index?: number;
}

const CNY_USD_RATE = 7.2;

function formatUSD(cny: number): string {
  const usd = cny / CNY_USD_RATE;
  return `US$${usd.toFixed(2)}`;
}

export function EncargoCard({ product, index = 0 }: EncargoCardProps) {
  const primaryPhoto = product.image_urls?.[0];
  const hoverPhoto = product.image_urls?.[1];
  const variantCount = product.variants?.length || 0;

  return (
    <div
      className={`group/card block relative flex flex-col plug-fade-up plug-stagger-${Math.min(
        index + 1,
        8
      )}`}
    >
      {/* Imagen */}
      <div className="aspect-[4/5] bg-[#f5f5f7] rounded-[24px] relative overflow-hidden mb-4 transform-gpu backface-hidden">
        <Link
          href={`/encargos/${product.id}`}
          className="block relative w-full h-full"
          aria-label={`Ver ${product.title}`}
        >
          {primaryPhoto ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryPhoto}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 transform-gpu backface-hidden"
                loading={index < 4 ? "eager" : "lazy"}
              />
              {hoverPhoto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hoverPhoto}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-out pointer-events-none transform-gpu"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <svg
                className="w-10 h-10"
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

        {/* Badge encargo */}
        <div className="absolute top-4 left-4 flex flex-col items-start gap-2 pointer-events-none z-10">
          <span className="bg-[#7c3aed]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full shadow-sm">
            Encargo
          </span>
        </div>

        {/* Variantes pill on hover */}
        {variantCount > 0 && (
          <div className="hidden md:block absolute bottom-4 left-4 right-4 opacity-0 translate-y-3 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 ease-out z-10 transform-gpu will-change-[transform,opacity]">
            <div className="bg-white/70 backdrop-blur-xl rounded-[16px] shadow-sm overflow-hidden border border-white/20 transform-gpu">
              <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#1d1d1f] py-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25z" />
                </svg>
                {variantCount} {variantCount === 1 ? "variante" : "variantes"} disponibles
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <Link href={`/encargos/${product.id}`} className="flex flex-col gap-1 px-1">
        {product.category && (
          <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
            {product.category} · {product.source_type}
          </p>
        )}
        <h3 className="text-[15px] sm:text-[16px] font-medium text-[#1d1d1f] leading-snug line-clamp-2 mt-0.5">
          {product.title}
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-1">
          {product.price_cny != null && (
            <>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {formatUSD(product.price_cny)}
              </span>
              <span className="text-[12px] text-[#86868b]">
                (¥{product.price_cny})
              </span>
            </>
          )}
        </div>
        {variantCount > 0 && (
          <p className="text-[11px] text-[#86868b] mt-0.5">
            {variantCount} {variantCount === 1 ? "variante" : "variantes"}
          </p>
        )}
      </Link>
    </div>
  );
}
