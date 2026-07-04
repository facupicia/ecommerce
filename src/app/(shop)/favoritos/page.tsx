"use client";

import Link from "next/link";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export default function FavoritosPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <svg className="w-16 h-16 mx-auto text-[var(--plug-gray)] opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <h2 className="plug-font-serif text-3xl text-[#1a1a1a] mb-3">No tenés favoritos</h2>
        <p className="text-[14px] text-[var(--plug-gray)] mb-8">
          Guardá los productos que te gusten haciendo clic en el corazón.
        </p>
        <Link href="/categorias" className="plug-btn">Explorar catálogo</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      <div className="mb-10 lg:mb-12">
        <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a]">Favoritos</h1>
        <p className="text-[13px] text-[var(--plug-gray)] mt-2">
          {items.length} producto{items.length !== 1 ? "s" : ""} guardado{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-12">
        {items.map((item) => (
          <div key={item.product_id} className="group relative">
            {/* Image */}
            <div className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden mb-3 rounded-sm">
              <Link href={`/producto/${item.slug}`} className="block w-full h-full">
                {item.imagen ? (
                  <CloudinaryImage
                    src={item.imagen}
                    alt={item.nombre}
                    fill
                    className="object-cover plug-img-hover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--plug-gray)]">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Remove from wishlist */}
              <button
                onClick={() => {
                  removeFromWishlist(item.product_id);
                  toast("Eliminado de favoritos", "info");
                }}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white hover:scale-110"
                aria-label="Quitar de favoritos"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <Link href={`/producto/${item.slug}`}>
                <h3 className="text-[13px] sm:text-[14px] leading-snug text-[#1a1a1a] group-hover:text-[var(--plug-gray)] transition-colors line-clamp-2">
                  {item.nombre}
                </h3>
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-[12px] sm:text-[13px] font-medium text-[#1a1a1a]">
                  {formatPrice(item.precio_ars)}
                </span>
                <button
                  onClick={() => {
                    addToCart({
                      product_id: item.product_id,
                      nombre: item.nombre,
                      precio_ars: item.precio_ars,
                      cantidad: 1,
                      imagen: item.imagen,
                      slug: item.slug,
                    });
                    toast("Agregado al carrito", "success");
                  }}
                  className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors cursor-pointer"
                >
                  + Carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
