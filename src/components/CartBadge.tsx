"use client";

import { useCart } from "@/lib/cart";

export function CartBadge() {
  const { itemCount } = useCart();
  if (itemCount === 0) return null;

  return (
    <span
      aria-label={`${itemCount} productos en el carrito`}
      className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#1a1a1a] text-white text-[10px] font-semibold leading-none rounded-full ring-2 ring-white"
    >
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  );
}
