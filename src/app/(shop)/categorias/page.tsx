import { Suspense } from "react";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { CategoryFilters } from "@/components/shop/CategoryFilters";

export const dynamic = "force-dynamic";

interface CategoryProps {
  searchParams: Promise<{
    categoria?: string;
    indumentaria?: string;
    marca?: string;
  }>;
}

export async function generateMetadata({ searchParams }: CategoryProps): Promise<Metadata> {
  const params = await searchParams;
  const parts = [];
  if (params.categoria) parts.push(params.categoria);
  if (params.indumentaria) parts.push(params.indumentaria);
  if (params.marca) parts.push(params.marca);

  let title = "Catálogo de Ropa Importada | plug";
  let description = "Explorá nuestro catálogo de indumentaria importada streetwear en Rosario, Argentina. Remeras, buzos, camperas y más.";

  if (parts.length > 0) {
    const filterText = parts.join(" - ");
    title = `${filterText} | Catálogo | plug`;
    description = `Comprá ropa importada de ${parts.join(" ")} en plug. El mejor streetwear premium de Rosario, Argentina.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: "/categorias",
    },
    openGraph: {
      title,
      description,
      url: "/categorias",
      siteName: "plug",
      type: "website",
    },
  };
}

export default async function CategoriesPage({ searchParams }: CategoryProps) {
  const params = await searchParams;
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

  const parts = [];
  if (params.categoria) parts.push(params.categoria);
  if (params.indumentaria) parts.push(params.indumentaria);
  if (params.marca) parts.push(params.marca);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": parts.length > 0 ? `${parts.join(" - ")} - Catálogo plug` : "Catálogo de Ropa Importada - plug",
    "description": "Catálogo completo de ropa importada streetwear en Rosario, Argentina.",
    "url": `${siteUrl}/categorias`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
            <p className="text-[var(--plug-gray)]">Cargando catálogo…</p>
          </div>
        }
      >
        <CategoryFilters products={items} />
      </Suspense>
    </>
  );
}
