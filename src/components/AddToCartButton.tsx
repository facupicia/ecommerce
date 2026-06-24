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
        className="kith-btn w-full sm:w-auto cursor-not-allowed opacity-50"
      >
        Sin stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`kith-btn w-full sm:w-auto ${added ? "kith-btn-dark" : ""}`}
    >
      {added ? (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Agregado
        </>
      ) : (
        "Agregar al carrito"
      )}
    </button>
  );
}
