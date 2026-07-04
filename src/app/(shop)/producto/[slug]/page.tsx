import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { ProductPurchasePanel } from "@/components/shop/ProductPurchasePanel";
import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { ProductDetailTabs } from "@/components/shop/ProductDetailTabs";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: product } = await supabasePublic
    .from("shop_products")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (!product) {
    return {
      title: "Producto no encontrado | plug",
    };
  }

  const p = product as ShopProduct;
  const title = `${p.nombre} | plug`;
  const cleanDescription = p.descripcion
    ? p.descripcion.replace(/\n/g, " ").slice(0, 155) + (p.descripcion.length > 155 ? "..." : "")
    : `Compra ${p.nombre} en plug. Ropa importada premium en Rosario, Argentina.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";
  const ogImages =
    p.fotos && p.fotos.length > 0
      ? p.fotos.map((foto) => {
          const url = getCloudinaryUrl(foto, {
            width: 800,
            height: 1000,
            crop: "fill",
          });
          return {
            url: url.startsWith("http") ? url : `${siteUrl}${url}`,
            width: 800,
            height: 1000,
            alt: p.nombre,
          };
        })
      : [];

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: `/producto/${slug}`,
    },
    openGraph: {
      title,
      description: cleanDescription,
      url: `/producto/${slug}`,
      siteName: "plug",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: ogImages.map((img) => img.url),
    },
  };
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

  // Recommended products: prioritize same category, then fill with latest
  const { data: recommendedRaw } = await supabasePublic
    .from("shop_products")
    .select("*")
    .eq("publicado", true)
    .neq("id", p.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const recommendedAll: ShopProduct[] = recommendedRaw ?? [];
  const sameCategory = recommendedAll.filter(
    (r) => r.categoria && r.categoria === p.categoria
  );
  const others = recommendedAll.filter(
    (r) => !r.categoria || r.categoria !== p.categoria
  );
  const recommended = [...sameCategory, ...others].slice(0, 4);

  const tabs = [
    {
      id: "descripcion",
      label: "Descripción",
      content: p.descripcion ? (
        <p className="whitespace-pre-line">{p.descripcion}</p>
      ) : (
        <p>Sin descripción disponible.</p>
      ),
    },
    {
      id: "detalles",
      label: "Detalles",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
          <div>
            <span className="text-[#1a1a1a] font-medium">Categoría:</span>{" "}
            {p.categoria || "—"}
          </div>
          <div>
            <span className="text-[#1a1a1a] font-medium">Marca:</span>{" "}
            {p.marca || "—"}
          </div>
          <div>
            <span className="text-[#1a1a1a] font-medium">Indumentaria:</span>{" "}
            {p.indumentaria || "—"}
          </div>
          <div>
            <span className="text-[#1a1a1a] font-medium">Stock:</span>{" "}
            {p.stock > 0 ? `${p.stock} unidades` : "Sin stock"}
          </div>
          <div>
            <span className="text-[#1a1a1a] font-medium">Peso:</span>{" "}
            {p.peso_g ? `${p.peso_g} g` : "—"}
          </div>
          <div>
            <span className="text-[#1a1a1a] font-medium">SKU:</span>{" "}
            {p.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
      ),
    },
    {
      id: "envio",
      label: "Envío y devoluciones",
      content: (
        <div className="space-y-4">
          <p>
            Realizamos envíos a todo el país. Los tiempos de entrega varían
            según la ubicación y la disponibilidad del producto.
          </p>
          <p>
            Una vez confirmado el pago, procesamos el pedido y coordinamos el
            envío. Para productos importados, el tiempo estimado puede ser mayor
            debido a trámites aduaneros.
          </p>
          <p>
            Ante cualquier duda sobre devoluciones, contactanos por WhatsApp o
            correo electrónico.
          </p>
        </div>
      ),
    },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";
  const productUrl = `${siteUrl}/producto/${p.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.nombre,
    "image":
      p.fotos && p.fotos.length > 0
        ? p.fotos.map((foto) => {
            const url = getCloudinaryUrl(foto, {
              width: 800,
              height: 1000,
              crop: "fill",
            });
            return url.startsWith("http") ? url : `${siteUrl}${url}`;
          })
        : [`${siteUrl}/favicon.ico`],
    "description": p.descripcion || `Compra ${p.nombre} en plug.`,
    "sku": p.id.slice(0, 8).toUpperCase(),
    "brand": {
      "@type": "Brand",
      "name": p.marca || "plug"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "ARS",
      "price": p.precio_ars,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[var(--plug-gray)] mb-8 lg:mb-12">
          <a href="/" className="hover:text-[#1a1a1a] transition-colors">
            Inicio
          </a>
          <span>/</span>
          {p.categoria ? (
            <>
              <a
                href={`/categorias`}
                className="hover:text-[#1a1a1a] transition-colors"
              >
                {p.categoria}
              </a>
              <span>/</span>
            </>
          ) : null}
          <span className="text-[#1a1a1a] truncate">{p.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <ProductImageGallery fotos={p.fotos ?? []} nombre={p.nombre} />

          {/* Info */}
          <div className="flex flex-col lg:pt-2">
            {p.marca && (
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-1">
                {p.marca}
              </p>
            )}
            {p.categoria && (
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--plug-gray)] mb-3">
                {p.categoria}
                {p.indumentaria && ` · ${p.indumentaria}`}
              </p>
            )}

            <h1 className="plug-font-serif text-2xl sm:text-3xl lg:text-[36px] leading-tight text-[#1a1a1a] mb-5">
              {p.nombre}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[#d9d9d9]">
              <span className="text-xl sm:text-2xl font-medium text-[#1a1a1a]">
                {formatPrice(p.precio_ars)}
              </span>
              {p.precio_original_ars &&
                p.precio_original_ars > p.precio_ars && (
                  <>
                    <span className="text-base text-[var(--plug-gray)] line-through">
                      {formatPrice(p.precio_original_ars)}
                    </span>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      -{Math.round(((p.precio_original_ars - p.precio_ars) / p.precio_original_ars) * 100)}%
                    </span>
                  </>
                )}
            </div>

            {/* Interactive Purchase controls */}
            <div className="mb-8">
              <ProductPurchasePanel product={p} />
            </div>

            {/* Notes */}
            <div className="mb-10 space-y-3 text-[12px] leading-[1.6] text-[var(--plug-gray)]">
              <p>
                Disponible en nuestros canales de venta. El inventario puede
                variar.
              </p>
            </div>

            {/* Tabs */}
            <ProductDetailTabs tabs={tabs} />
          </div>
        </div>
      </div>

      {/* Recommended products */}
      {recommended.length > 0 && (
        <ProductGrid title="También te puede gustar" products={recommended} />
      )}
    </>
  );
}
