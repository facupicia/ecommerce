import { Suspense } from "react";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { EncargosGrid } from "@/components/shop/EncargosGrid";
import { Spinner } from "@/components/ui/Spinner";

export const dynamic = "force-dynamic";

export default async function EncargosPage() {
  const { data: products, error } = await supabasePublic
    .from("shop_products")
    .select("*")
    .eq("publicado", true)
    .eq("es_encargo", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <h2 className="plug-font-serif text-3xl text-[#1a1a1a] mb-2">
          Error al cargar productos
        </h2>
        <p className="text-[var(--plug-gray)]">{error.message}</p>
      </div>
    );
  }

  const products2: ShopProduct[] = products ?? [];

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <EncargosGrid products={products2} />
    </Suspense>
  );
}
