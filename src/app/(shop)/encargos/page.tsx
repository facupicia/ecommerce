import { supabaseAdmin } from "@/lib/supabase";
import type { EncargoProduct } from "@/lib/types";
import { EncargoCard } from "@/components/shop/EncargoCard";
import { getShopSettings } from "@/lib/settings";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface EncargosPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function EncargosCatalogPage({ searchParams }: EncargosPageProps) {
  const settings = await getShopSettings();
  if (settings.encargosEnabled === false) {
    notFound();
  }

  const { category } = await searchParams;

  let query = supabaseAdmin
    .from("encargos_products")
    .select("*")
    .eq("activo", true)
    .order("synced_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data: productsData } = await query;

  const { data: catData } = await supabaseAdmin
    .from("encargos_products")
    .select("category")
    .eq("activo", true)
    .not("category", "is", null);

  const categories = Array.from(
    new Set((catData || []).map((c: { category: string }) => c.category))
  ).filter(Boolean).sort();

  const products: EncargoProduct[] = (productsData || []).map((p: Record<string, unknown>) => ({
    ...p,
    variants: typeof p.variants === "string" ? JSON.parse(p.variants as string) : (p.variants || []),
  })) as EncargoProduct[];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      {/* Banner / Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            Productos por Encargo
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
            Importamos lo que buscás
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Elegí la prenda que te gusta, seleccioná variante y talle, y te la traemos directamente desde origen. Sin complicaciones.
          </p>
        </div>
      </div>

      {/* Categorías / Filtros */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Link
            href="/encargos"
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !category
                ? "text-white"
                : "bg-[#f5f5f7] text-[#374151] hover:bg-[#e5e7eb]"
            }`}
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/encargos?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                category === cat
                  ? "bg-[#678dcb] text-white"
                  : "bg-[#f5f5f7] text-[#374151] hover:bg-[#e5e7eb]"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* Grid de productos */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
          {products.map((p, i) => (
            <EncargoCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#f9fafb] rounded-3xl border border-[#f0f0f0]">
          <svg className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-base font-semibold text-[#1d1d1f] mb-1">
            No hay productos de encargo disponibles
          </h3>
          <p className="text-xs text-[#6b7280]">
            Sincronizá productos desde el scraper para que aparezcan acá.
          </p>
        </div>
      )}
    </div>
  );
}
