"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { formatARS, getMercadoPagoPrice } from "@/lib/pricing";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { WishlistButton } from "@/components/shop/WishlistButton";

interface ProductCardProps {
  product: ShopProduct;
  index?: number;
  priority?: boolean;
  className?: string;
}

const NEW_PRODUCT_DAYS = 30;

function isNewProduct(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const diffDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_PRODUCT_DAYS;
}

/**
 * Card de producto unificada para toda la tienda (home, catálogo, carruseles).
 * Estándar de tiendas competitivas: segunda imagen en hover, badges de
 * novedad/descuento/stock, quick-add con talles y wishlist.
 */
export function ProductCard({ product, index = 0, priority = false, className = "" }: ProductCardProps) {
  const hasDiscount =
    product.precio_original_ars != null &&
    product.precio_original_ars > product.precio_ars;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.precio_original_ars! - product.precio_ars) /
          product.precio_original_ars!) *
          100
      )
    : 0;
  const isNew = !hasDiscount && product.stock > 0 && isNewProduct(product.created_at);
  const lowStock = product.stock > 0 && product.stock <= 5;

  const primaryPhoto = product.fotos?.[0];
  const hoverPhoto = product.fotos?.[1];

  return (
    <div
      className={`group/card block relative flex flex-col plug-fade-up plug-stagger-${Math.min(
        index + 1,
        8
      )} ${className}`}
    >
      {/* Imagen */}
      <div className="aspect-[4/5] bg-[#f5f5f7] rounded-[24px] relative overflow-hidden mb-4 transform-gpu backface-hidden">
        <Link
          href={`/producto/${product.slug}`}
          className="block relative w-full h-full"
          aria-label={`Ver ${product.nombre}`}
        >
          {primaryPhoto ? (
            <>
              <CloudinaryImage
                src={primaryPhoto}
                alt={product.nombre}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 transform-gpu backface-hidden"
              />
              {/* Segunda imagen en hover (crossfade) */}
              {hoverPhoto && (
                <CloudinaryImage
                  src={hoverPhoto}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-out pointer-events-none transform-gpu"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col items-start gap-2 pointer-events-none z-10">
          {hasDiscount && (
            <span className="bg-white/85 backdrop-blur-md text-[#1d1d1f] text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full shadow-sm">
              -{discountPct}%
            </span>
          )}
          {isNew && (
            <span className="bg-[#1d1d1f] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full shadow-sm">
              Nuevo
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-[#1d1d1f]/85 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full shadow-sm">
              Agotado
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-4 right-4 z-10">
          <WishlistButton
            product_id={product.id}
            slug={product.slug}
            nombre={product.nombre}
            precio_ars={product.precio_ars}
            imagen={product.fotos?.[0] ?? ""}
          />
        </div>

        {/* Quick Add (desktop, en hover) */}
        {product.stock > 0 && (
          <div className="hidden md:block absolute bottom-4 left-4 right-4 opacity-0 translate-y-3 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 ease-out z-10 transform-gpu will-change-[transform,opacity]">
            <div className="bg-white/70 backdrop-blur-xl rounded-[16px] shadow-sm overflow-hidden border border-white/20 transform-gpu">
              <QuickAddPanel product={product} />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <Link href={`/producto/${product.slug}`} className="flex flex-col gap-1 px-1">
        {product.categoria && (
          <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
            {product.categoria}
            {product.marca ? ` · ${product.marca}` : ""}
          </p>
        )}
        <h3 className="text-[15px] sm:text-[16px] font-medium text-[#1d1d1f] leading-snug line-clamp-2 mt-0.5">
          {product.nombre}
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-1">
          <span className="text-[15px] font-semibold text-[#1d1d1f]">
            {formatARS(product.precio_ars)}
          </span>
          {hasDiscount && (
            <span className="text-[13px] text-[#86868b] line-through font-normal">
              {formatARS(product.precio_original_ars!)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#86868b] mt-0.5">
          {formatARS(getMercadoPagoPrice(product.precio_ars))} con Mercado Pago
        </p>
        {lowStock && (
          <p className="text-[11px] font-semibold text-[#b45309] mt-0.5">
            ¡Quedan {product.stock} {product.stock === 1 ? "unidad" : "unidades"}!
          </p>
        )}
      </Link>
    </div>
  );
}

function QuickAddPanel({ product }: { product: ShopProduct }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent, talle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      nombre: product.nombre,
      precio_ars: product.precio_ars,
      cantidad: 1,
      imagen: product.fotos?.[0] ?? "",
      slug: product.slug,
      talle,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (added) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#1d1d1f] py-3">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Añadido
      </div>
    );
  }

  if (product.talles && product.talles.length > 0) {
    return (
      <div className="flex flex-col w-full py-2 px-2">
        <span className="text-[10px] font-medium text-center text-[#86868b] mb-1.5">
          Seleccionar talle
        </span>
        <div className="flex flex-wrap gap-1.5 justify-center w-full max-h-[60px] overflow-y-auto scrollbar-hide">
          {product.talles.map((talle) => (
            <button
              key={talle}
              onClick={(e) => handleQuickAdd(e, talle)}
              className="px-3 py-1.5 text-[12px] font-medium bg-white text-[#1d1d1f] rounded-lg hover:bg-[#1d1d1f] hover:text-white transition-colors border border-transparent shadow-sm cursor-pointer"
            >
              {talle}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => handleQuickAdd(e)}
      className="w-full text-[13px] font-medium text-[#1d1d1f] bg-transparent hover:bg-[#1d1d1f] hover:text-white transition-colors py-3 cursor-pointer"
    >
      Añadir al carrito
    </button>
  );
}
