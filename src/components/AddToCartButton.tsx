"use client";

import { useCart } from "@/lib/cart";
import type { ShopProduct } from "@/lib/types";
import { useState } from "react";

interface Props {
  product: ShopProduct;
  fullWidth?: boolean;
  talle?: string;
  cantidad?: number;
}

export function AddToCartButton({
  product,
  fullWidth = false,
  talle,
  cantidad = 1,
}: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      product_id: product.id,
      nombre: product.nombre,
      precio_ars: product.precio_ars,
      cantidad,
      imagen: product.fotos?.[0] ?? "",
      slug: product.slug,
      talle,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isMissingTalle = product.talles && product.talles.length > 0 && !talle;

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="plug-btn w-full cursor-not-allowed opacity-50 bg-[#f5f5f5] text-[var(--plug-gray)] border-[#d9d9d9]"
      >
        Sin stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added || isMissingTalle}
      className={`plug-btn ${fullWidth ? "w-full" : "w-full sm:w-auto"} ${
        added ? "plug-btn-dark !border-emerald-600 !bg-emerald-600 !text-white" : ""
      } ${isMissingTalle ? "opacity-60 cursor-not-allowed hover:bg-white hover:text-[#1a1a1a]" : ""}`}
    >
      {added ? (
        <>
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          ¡Agregado al carrito!
        </>
      ) : isMissingTalle ? (
        "Seleccioná un talle"
      ) : (
        "Agregar al carrito"
      )}
    </button>
  );
}
