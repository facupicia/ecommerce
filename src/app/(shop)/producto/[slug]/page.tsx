import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { ProductDetailTabs } from "@/components/shop/ProductDetailTabs";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
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
            <span className="text-[#333333] font-medium">Categoría:</span>{" "}
            {p.categoria || "—"}
          </div>
          <div>
            <span className="text-[#333333] font-medium">Stock:</span>{" "}
            {p.stock > 0 ? `${p.stock} unidades` : "Sin stock"}
          </div>
          <div>
            <span className="text-[#333333] font-medium">Peso:</span>{" "}
            {p.peso_g ? `${p.peso_g} g` : "—"}
          </div>
          <div>
            <span className="text-[#333333] font-medium">SKU:</span>{" "}
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

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#828282] mb-8 lg:mb-12">
          <a href="/" className="hover:text-[#333333] transition-colors">
            Inicio
          </a>
          <span>/</span>
          {p.categoria ? (
            <>
              <a
                href={`/categorias`}
                className="hover:text-[#333333] transition-colors"
              >
                {p.categoria}
              </a>
              <span>/</span>
            </>
          ) : null}
          <span className="text-[#333333] truncate">{p.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <ProductImageGallery fotos={p.fotos ?? []} nombre={p.nombre} />

          {/* Info */}
          <div className="flex flex-col lg:pt-2">
            {p.categoria && (
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#828282] mb-3">
                {p.categoria}
              </p>
            )}

            <h1 className="kith-font-serif text-2xl sm:text-3xl lg:text-[36px] leading-tight text-[#333333] mb-5">
              {p.nombre}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[#d9d9d9]">
              <span className="text-xl sm:text-2xl font-medium text-[#333333]">
                {formatPrice(p.precio_ars)}
              </span>
              {p.precio_original_ars &&
                p.precio_original_ars > p.precio_ars && (
                  <>
                    <span className="text-base text-[#828282] line-through">
                      {formatPrice(p.precio_original_ars)}
                    </span>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      -{Math.round(((p.precio_original_ars - p.precio_ars) / p.precio_original_ars) * 100)}%
                    </span>
                  </>
                )}
            </div>

            {/* Stock */}
            <div className="mb-8">
              {p.stock > 5 ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-[#828282]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#333333]" />
                  Stock disponible
                </span>
              ) : p.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-[#828282]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#828282]" />
                  Solo quedan {p.stock} unidades
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-[#828282]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d9d9d9]" />
                  Sin stock
                </span>
              )}
            </div>

            {/* Add to cart */}
            <div className="mb-8">
              <AddToCartButton product={p} fullWidth />
            </div>

            {/* Notes */}
            <div className="mb-10 space-y-3 text-[12px] leading-[1.6] text-[#828282]">
              <p className="uppercase tracking-[0.1em]">
                Venta final. No se aceptan cambios ni devoluciones.
              </p>
              <p>Limitado a 2 unidades por cliente.</p>
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
