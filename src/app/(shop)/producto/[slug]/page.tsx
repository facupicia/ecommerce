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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <a href="/" className="hover:text-gray-600 transition-colors">
          Inicio
        </a>
        <span>/</span>
        <span className="text-gray-600 truncate">{p.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          {p.fotos && p.fotos.length > 1 ? (
            <div className="space-y-4">
              {/* Main image */}
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                <img
                  src={p.fotos[0]}
                  alt={p.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {p.fotos.slice(1, 5).map((foto, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-400 transition-colors cursor-pointer"
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
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <img
                src={p.fotos[0]}
                alt={p.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category */}
          {p.categoria && (
            <span className="inline-flex self-start px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-4">
              {p.categoria}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {p.nombre}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(p.precio_ars)}
            </span>
            {p.precio_original_ars &&
              p.precio_original_ars > p.precio_ars && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(p.precio_original_ars)}
                </span>
              )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {p.stock > 5 ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Stock disponible
              </span>
            ) : p.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Solo quedan {p.stock} unidades
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Sin stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Descripción
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {p.descripcion}
            </p>
          </div>

          {/* Add to cart */}
          <AddToCartButton product={p} />
        </div>
      </div>
    </div>
  );
}
