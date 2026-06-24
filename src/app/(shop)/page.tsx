import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { FullwidthBanner } from "@/components/shop/FullwidthBanner";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

const heroSlides = [
  {
    id: "1",
    image: "https://placehold.co/1920x1080/1a1a1a/ffffff?text=Nueva+Colección",
    title: "Nueva Colección",
    subtitle:
      "Descubrí las últimas piezas seleccionadas traídas especialmente para esta temporada.",
    cta: "Ver ahora",
    href: "/categorias",
  },
  {
    id: "2",
    image: "https://placehold.co/1920x1080/2a2a2a/ffffff?text=Edición+Limitada",
    title: "Edición Limitada",
    subtitle:
      "Productos exclusivos con stock limitado. No te quedes sin el tuyo.",
    cta: "Descubrir",
    href: "/categorias",
  },
  {
    id: "3",
    image: "https://placehold.co/1920x1080/151515/ffffff?text=Envío+a+todo+el+país",
    title: "Envío a todo el país",
    subtitle: "Comprá con confianza. Recibí tus productos importados en la puerta de tu casa.",
    cta: "Comprar",
    href: "/categorias",
  },
];

export default async function ShopHomePage() {
  const { data: products, error } = await supabasePublic
    .from("shop_products")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <h2 className="plug-font-serif text-3xl text-[#1a1a1a] mb-2">
          Error al cargar productos
        </h2>
        <p className="text-[#777777]">{error.message}</p>
      </div>
    );
  }

  const items: ShopProduct[] = products ?? [];
  const featured = items.slice(0, 8);
  const looks = items.slice(8);

  return (
    <>
      {/* 1. Fullscreen hero carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* 2. Featured products carousel */}
      {featured.length > 0 && (
        <ProductCarousel title="Destacados" products={featured} />
      )}

      {/* 3. Fullwidth editorial banner */}
      <FullwidthBanner
        image="https://placehold.co/1920x1080/4a5d4a/ffffff?text=Summer+2026"
        title="Summer 2026"
        description="Piezas livianas, colores frescos y la mejor calidad en productos importados para la temporada."
        primaryCta={{ label: "Shop now", href: "/categorias" }}
        secondaryCta={{ label: "A closer look", href: "/categorias" }}
      />

      {/* 4. Looks grid */}
      {looks.length > 0 ? (
        <ProductGrid title="Elige tu look" products={looks} />
      ) : featured.length > 0 ? (
        <ProductGrid title="Elige tu look" products={featured} />
      ) : null}

      {/* 5. Final fullwidth banner */}
      <FullwidthBanner
        image="https://placehold.co/1920x1080/5a5a5a/ffffff?text=&Kin+Summer"
        title="&Kin Summer"
        description="Una mirada diferente sobre el ready-to-wear, con fabricaciones únicas y un enfoque sin marcas."
        primaryCta={{ label: "Shop now", href: "/categorias" }}
        secondaryCta={{ label: "A closer look", href: "/categorias" }}
        align="center"
      />
    </>
  );
}
