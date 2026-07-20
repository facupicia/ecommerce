import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { ProductCard } from "@/components/shop/ProductCard";

interface ProductGridProps {
  title: string;
  products: ShopProduct[];
  cta?: { label: string; href: string };
}

export function ProductGrid({ title, products, cta }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white font-sans">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        {/* Encabezado */}
        <div className="flex items-end justify-between gap-4 mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {title}
          </h2>
          {cta && (
            <Link
              href={cta.href}
              className="group/link hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d1d1f] hover:text-[#86868b] transition-colors flex-shrink-0 pb-1"
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
        </div>

        {/* Grilla de productos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 lg:gap-x-8 lg:gap-y-14">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              priority={i < 4}
            />
          ))}
        </div>

        {/* CTA mobile (debajo de la grilla) */}
        {cta && (
          <div className="mt-10 text-center sm:hidden">
            <Link
              href={cta.href}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d1d1f] border border-[#d2d2d7] rounded-full px-6 py-2.5 hover:bg-[#f5f5f7] transition-colors"
            >
              {cta.label}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
