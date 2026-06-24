"use client";

import { useState } from "react";
import type { ShopProduct } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";

interface ProductPurchasePanelProps {
  product: ShopProduct;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [talle, setTalle] = useState<string | undefined>(undefined);
  const [cantidad, setCantidad] = useState(1);

  const hasTalles = product.talles && product.talles.length > 0;

  const handleQtyChange = (val: number) => {
    const newQty = Math.max(1, Math.min(product.stock, val));
    setCantidad(newQty);
  };

  // Stock status styling & text
  let stockLedClass = "plug-stock-led-available";
  let stockText = "Stock disponible";

  if (product.stock === 0) {
    stockLedClass = "plug-stock-led-empty";
    stockText = "Sin stock";
  } else if (product.stock <= 5) {
    stockLedClass = "plug-stock-led-warning";
    stockText = `Últimas ${product.stock} unidades`;
  }

  return (
    <div className="space-y-6">
      {/* Stock LED */}
      <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.1em] text-[var(--plug-gray)]">
        <span className={`plug-stock-led ${stockLedClass}`} />
        {stockText}
      </div>

      {/* Size Picker (Talles) */}
      {hasTalles && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a]">
            <span>Talle</span>
            {talle && <span className="text-[var(--plug-gray)] font-medium">Seleccionado: {talle}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.talles.map((size) => (
              <button
                key={size}
                onClick={() => setTalle(size)}
                className={`plug-size-btn rounded-xs ${talle === size ? "plug-size-btn-active" : ""}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      {product.stock > 0 && (
        <div className="space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a]">
            Cantidad
          </label>
          <div className="flex items-center gap-1 w-fit border border-[#d9d9d9] bg-white rounded-xs overflow-hidden">
            <button
              onClick={() => handleQtyChange(cantidad - 1)}
              disabled={cantidad <= 1}
              className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-medium text-lg cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-medium text-[#1a1a1a] select-none">
              {cantidad}
            </span>
            <button
              onClick={() => handleQtyChange(cantidad + 1)}
              disabled={cantidad >= product.stock}
              className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-medium text-lg cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add To Cart */}
      <div className="pt-2">
        <AddToCartButton product={product} talle={talle} cantidad={cantidad} fullWidth />
      </div>
    </div>
  );
}
