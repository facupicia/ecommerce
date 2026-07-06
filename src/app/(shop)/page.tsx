import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { FullwidthBanner } from "@/components/shop/FullwidthBanner";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoryCards } from "@/components/shop/CategoryCards";
import { getShopSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

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
        <p className="text-[var(--plug-gray)]">{error.message}</p>
      </div>
    );
  }

  const items: ShopProduct[] = products ?? [];
  const featured = items.slice(0, 8);
  const looks = items.slice(8);

  const shopSettings = await getShopSettings();
  const categoryCards = shopSettings.categoryCards ?? [];

  const heroSlides = [
    {
      id: "1",
      image: shopSettings.heroBannerImage || "ecommerce/banners/hero-1",
      title: "",
      subtitle:
        "No solo seguimos las tendencias, las creamos. Tenemos las prendas más exclusivas del momento para quienes no se conforman con lo común.",
      cta: "Ver ahora",
      href: "/categorias",
    },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz/";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "plug",
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.ico`,
    "image": getCloudinaryUrl(shopSettings.finalBannerImage || "ecommerce/banners/final-1", { width: 1200 }),
    "description": "Ropa importada premium. El mejor style streetwear desde Rosario a todo el país.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Rosario",
      "addressRegion": "Santa Fe",
      "addressCountry": "AR"
    },
    "sameAs": [
      "https://www.instagram.com/theplug.ros/?hl=es-la"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* 1. Fullscreen hero carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* 2. Featured products carousel */}
      {featured.length > 0 && (
        <ProductCarousel title="" products={featured} />
      )}

      {/* Sección de transición */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 text-center">
          <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] text-[#86868b] mb-3">
            Navegá por categoría
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            Encontrá tu estilo
          </h2>
          <div className="mt-4 w-10 h-[2px] bg-[#d9d9d9] mx-auto" />
        </div>
      </section>

      {/* 3. Category cards */}
      <CategoryCards cards={categoryCards} />

      {/* 4. Fullwidth editorial banner */}
      <FullwidthBanner
        image={shopSettings.editorialBannerImage || "ecommerce/banners/editorial-1"}
        title=""
        description=""
      />

      {/* 5. Looks grid */}
      {looks.length > 0 ? (
        <ProductGrid title="Elige tu look" products={looks} />
      ) : featured.length > 0 ? (
        <ProductGrid title="Elige tu look" products={featured} />
      ) : null}

      {/* 6. Final fullwidth banner */}
      <FullwidthBanner
        image={shopSettings.finalBannerImage || "ecommerce/banners/final-1"}
        title=""
        description="Una mirada diferente sobre el ready-to-wear, con fabricaciones únicas y un enfoque sin marcas."
        primaryCta={{ label: "Shop now", href: "/categorias" }}
        secondaryCta={{ label: "A closer look", href: "/categorias" }}
        align="center"
      />
    </>
  );
}
