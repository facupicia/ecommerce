import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { FullwidthBanner } from "@/components/shop/FullwidthBanner";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

const heroSlides = [
  {
    id: "1",
    image: "ecommerce/banners/hero-1",
    title: "",
    subtitle:
      "No solo seguimos las tendencias, las creamos. Tenemos las prendas más exclusivas del momento para quienes no se conforman con lo común.",
    cta: "Ver ahora",
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
        <p className="text-[var(--plug-gray)]">{error.message}</p>
      </div>
    );
  }

  const items: ShopProduct[] = products ?? [];
  const featured = items.slice(0, 8);
  const looks = items.slice(8);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theplug.com.ar";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "THEPLUG",
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.ico`,
    "image": getCloudinaryUrl("ecommerce/banners/final-1", { width: 1200 }),
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

      {/* 3. Fullwidth editorial banner */}
      <FullwidthBanner
        image="ecommerce/banners/editorial-1"
        title=""
        description=""
      />

      {/* 4. Looks grid */}
      {looks.length > 0 ? (
        <ProductGrid title="Elige tu look" products={looks} />
      ) : featured.length > 0 ? (
        <ProductGrid title="Elige tu look" products={featured} />
      ) : null}

      {/* 5. Final fullwidth banner */}
      <FullwidthBanner
        image="ecommerce/banners/final-1"
        title=""
        description="Una mirada diferente sobre el ready-to-wear, con fabricaciones únicas y un enfoque sin marcas."
        primaryCta={{ label: "Shop now", href: "/categorias" }}
        secondaryCta={{ label: "A closer look", href: "/categorias" }}
        align="center"
      />
    </>
  );
}
