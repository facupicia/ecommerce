import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import type { ShopProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

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
        <h2 className="text-xl font-bold text-[#333333] mb-2">
          Error al cargar categorías
        </h2>
        <p className="text-[#828282]">{error.message}</p>
      </div>
    );
  }

  const items: ShopProduct[] = products ?? [];

  const grouped = items.reduce<Record<string, ShopProduct[]>>((acc, p) => {
    const cat = p.categoria || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      <section className="mb-12 lg:mb-16 text-center max-w-2xl mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#828282] mb-4">
          Explorar
        </p>
        <h1 className="kith-font-serif text-4xl sm:text-5xl text-[#333333] mb-4">
          Categorías
        </h1>
        <p className="text-[15px] leading-relaxed text-[#828282]">
          Encontrá lo que buscás navegando por nuestras categorías.
        </p>
      </section>

      {categories.length === 0 ? (
        <div className="text-center py-24">
          <h3 className="text-lg font-medium text-[#333333] mb-1">
            No hay categorías disponibles
          </h3>
          <p className="text-[#828282]">Pronto tendremos productos publicados.</p>
        </div>
      ) : (
        <div className="space-y-16 lg:space-y-20">
          {categories.map((cat) => (
            <section key={cat}>
              <div className="flex items-baseline justify-between mb-6 lg:mb-8 border-b border-[#d9d9d9] pb-3">
                <h2 className="kith-font-serif text-2xl sm:text-3xl text-[#333333] capitalize">
                  {cat}
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#828282]">
                  {grouped[cat].length} productos
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14">
                {grouped[cat].map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    className="group block"
                  >
                    <div className="aspect-square bg-[#f2f2f2] relative overflow-hidden mb-4">
                      {product.fotos && product.fotos.length > 0 ? (
                        <img
                          src={product.fotos[0]}
                          alt={product.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#d9d9d9]">
                          <svg
                            className="w-16 h-16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="px-3 py-1.5 border border-[#333333] text-[11px] font-medium uppercase tracking-wider text-[#333333]">
                            Sin stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="kith-font-serif text-[13px] sm:text-[14px] leading-snug text-[#333333] group-hover:text-[#828282] transition-colors">
                        {product.nombre}
                      </h3>
                      <p className="text-[12px] sm:text-[13px] font-medium text-[#333333]">
                        {formatPrice(product.precio_ars)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
