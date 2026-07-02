"use client";

import { useCart } from "@/lib/cart";
import Link from "next/link";

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link href="/carrito" className="relative p-2 -mr-2" aria-label="Carrito">
      <svg
        className="w-6 h-6 text-[#1a1a1a] hover:text-[#595959] transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {itemCount > 0 && (
        <span
          aria-label={`${itemCount} ${itemCount === 1 ? "producto" : "productos"} en el carrito`}
          className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#1a1a1a] text-white text-[10px] font-semibold leading-none rounded-full ring-2 ring-white"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
