"use client";

import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/lib/toast";

interface WishlistButtonProps {
  product_id: string;
  slug: string;
  nombre: string;
  precio_ars: number;
  imagen: string;
  className?: string;
}

export function WishlistButton({
  product_id,
  slug,
  nombre,
  precio_ars,
  imagen,
  className = "",
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const liked = isInWishlist(product_id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (liked) {
      removeFromWishlist(product_id);
      toast("Eliminado de favoritos", "info");
    } else {
      addToWishlist({ product_id, slug, nombre, precio_ars, imagen });
      toast("Agregado a favoritos", "success");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
        liked
          ? "bg-red-50 text-red-500 scale-100"
          : "bg-white/60 backdrop-blur-sm text-[#1a1a1a] hover:bg-white hover:scale-110"
      } ${className}`}
      aria-label={liked ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${liked ? "scale-110" : ""}`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
