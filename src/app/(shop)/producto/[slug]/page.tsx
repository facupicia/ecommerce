import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: product, error } = await supabasePublic
    .from("shop_products")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (error || !product) {
    notFound();
  }

  const p = product as ShopProduct;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#828282] mb-8 lg:mb-12">
        <a href="/" className="hover:text-[#333333] transition-colors">
          Inicio
        </a>
        <span>/</span>
        <span className="text-[#333333] truncate">{p.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div>
          {p.fotos && p.fotos.length > 1 ? (
            <div className="space-y-4">
              <div className="aspect-square bg-[#f2f2f2] overflow-hidden">
                <img
                  src={p.fotos[0]}
                  alt={p.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {p.fotos.slice(1, 5).map((foto, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#f2f2f2] overflow-hidden border border-transparent hover:border-[#333333] transition-colors cursor-pointer"
                  >
                    <img
                      src={foto}
                      alt={`${p.nombre} ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : p.fotos && p.fotos.length === 1 ? (
            <div className="aspect-square bg-[#f2f2f2] overflow-hidden">
              <img
                src={p.fotos[0]}
                alt={p.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-[#f2f2f2] flex items-center justify-center text-[#d9d9d9]">
              <svg
                className="w-24 h-24"
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
        </div>

        {/* Info */}
        <div className="flex flex-col lg:pt-6">
          {p.categoria && (
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#828282] mb-3">
              {p.categoria}
            </p>
          )}

          <h1 className="kith-font-serif text-3xl sm:text-4xl lg:text-[42px] leading-tight text-[#333333] mb-5">
            {p.nombre}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl sm:text-3xl font-medium text-[#333333]">
              {formatPrice(p.precio_ars)}
            </span>
            {p.precio_original_ars &&
              p.precio_original_ars > p.precio_ars && (
                <span className="text-base text-[#828282] line-through">
                  {formatPrice(p.precio_original_ars)}
                </span>
              )}
          </div>

          {/* Stock */}
          <div className="mb-8">
            {p.stock > 5 ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-[#828282]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#333333]" />
                Stock disponible
              </span>
            ) : p.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-[#828282]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#828282]" />
                Solo quedan {p.stock} unidades
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-[#828282]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d9d9d9]" />
                Sin stock
              </span>
            )}
          </div>

          {/* Description */}
          {p.descripcion && (
            <div className="mb-10">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#333333] mb-3">
                Descripción
              </h2>
              <p className="text-[14px] leading-[1.7] text-[#828282] whitespace-pre-line">
                {p.descripcion}
              </p>
            </div>
          )}

          {/* Add to cart */}
          <AddToCartButton product={p} />
        </div>
      </div>
    </div>
  );
}
