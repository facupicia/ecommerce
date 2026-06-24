import { Suspense } from "react";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { CategoryFilters } from "@/components/shop/CategoryFilters";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { data: products, error } = await supabasePublic
    .from("shop_products")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
          Error al cargar productos
        </h2>
        <p className="text-[var(--plug-gray)]">{error.message}</p>
      </div>
    );
  }

  const items: ShopProduct[] = products ?? [];

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
          <p className="text-[var(--plug-gray)]">Cargando catálogo…</p>
        </div>
      }
    >
      <CategoryFilters products={items} />
    </Suspense>
  );
}
