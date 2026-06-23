"use client";

import { useCart } from "@/lib/cart";
import Link from "next/link";

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link href="/carrito" className="relative p-2 -mr-2">
      <svg
        className="w-6 h-6 text-gray-700 hover:text-emerald-600 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full leading-none">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
