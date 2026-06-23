"use client";

import { useCart } from "@/lib/cart";
import type { ShopProduct } from "@/lib/types";
import { useState } from "react";

interface Props {
  product: ShopProduct;
}

export function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      product_id: product.id,
      nombre: product.nombre,
      precio_ars: product.precio_ars,
      cantidad: 1,
      imagen: product.fotos?.[0] ?? "",
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed text-lg"
      >
        Sin stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-lg transition-all duration-200 ${
        added
          ? "bg-green-600 text-white scale-105"
          : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-200"
      }`}
    >
      {added ? (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          ¡Agregado!
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          Agregar al carrito
        </>
      )}
    </button>
  );
}
