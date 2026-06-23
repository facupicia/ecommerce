import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export default async function ShopHomePage() {
  const { data: products, error } = await supabasePublic
    .from("shop_products")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
  }

  const items: ShopProduct[] = products ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3">
          Productos importados
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Descubrí nuestra selección de productos traídos especialmente para vos.
          Calidad garantizada con envío a todo el país.
        </p>
      </div>

      {/* Product Grid */}
      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No hay productos aún
          </h3>
          <p className="text-gray-500">
            Estamos preparando productos increíbles. ¡Volvé pronto!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/producto/${product.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                {product.fotos && product.fotos.length > 0 ? (
                  <img
                    src={product.fotos[0]}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg
                      className="w-16 h-16"
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

                {/* Category badge */}
                {product.categoria && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                    {product.categoria}
                  </span>
                )}

                {/* Stock badge */}
                {product.stock <= 3 && product.stock > 0 && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    ¡Últimas {product.stock} unidades!
                  </span>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-900">
                      Sin stock
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {product.nombre}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {product.descripcion}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.precio_ars)}
                  </span>
                  {product.precio_original_ars &&
                    product.precio_original_ars > product.precio_ars && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.precio_original_ars)}
                      </span>
                    )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
