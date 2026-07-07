import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoryCards } from "@/components/shop/CategoryCards";
import { getShopSettings } from "@/lib/settings";
import Link from "next/link";

interface FullwidthBannerProps {
  image: string;
  title?: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "left" | "center";
}

function FullwidthBanner({
  image,
  title,
  description,
  primaryCta,
  secondaryCta,
  align = "left",
}: FullwidthBannerProps) {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <img
        src={getCloudinaryUrl(image, { width: 1920, crop: "fill" })}
        alt={title || "Banner"}
        className="w-full h-[50vh] min-h-[400px] object-cover opacity-80"
        loading="lazy"
      />
      <div
        className={`absolute inset-0 flex items-center ${
          align === "center" ? "justify-center text-center" : "justify-start text-left"
        }`}
      >
        <div className="px-6 lg:px-16 max-w-2xl">
          {title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-sm sm:text-base text-white/80 max-w-md">
              {description}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center text-white px-5 py-2.5 text-sm font-medium border border-white/40 rounded-md hover:bg-white/10 transition-colors"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

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
