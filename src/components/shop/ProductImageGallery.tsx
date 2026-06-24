"use client";

import { useState } from "react";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

interface ProductImageGalleryProps {
  fotos: string[];
  nombre: string;
}

const placeholderSvg = (
  <svg
    className="w-24 h-24"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export function ProductImageGallery({ fotos, nombre }: ProductImageGalleryProps) {
  const validFotos = fotos && fotos.length > 0 ? fotos : [];
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex gap-3 lg:gap-4 h-full">
      {/* Thumbnails - vertical stack */}
      {validFotos.length > 1 && (
        <div className="hidden sm:flex flex-col gap-3 w-[72px] lg:w-[88px] flex-shrink-0">
          {validFotos.map((foto, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative aspect-square bg-[#f5f5f5] overflow-hidden border transition-colors ${
                selected === i
                  ? "border-[#1a1a1a]"
                  : "border-transparent hover:border-[var(--plug-gray)]"
              }`}
              aria-label={`Ver imagen ${i + 1} de ${nombre}`}
            >
              <CloudinaryImage
                src={foto}
                alt={`${nombre} ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 min-w-0">
        <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden border border-[#ebebeb] rounded-sm">
          {validFotos.length > 0 ? (
            <CloudinaryImage
              key={selected}
              src={validFotos[selected]}
              alt={nombre}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out hover:scale-105 cursor-zoom-in"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--plug-gray)]">
              {placeholderSvg}
            </div>
          )}
        </div>

        {/* Mobile thumbnails */}
        {validFotos.length > 1 && (
          <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto pb-1">
            {validFotos.map((foto, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`relative flex-shrink-0 w-16 aspect-square bg-[#f5f5f5] overflow-hidden border transition-colors ${
                  selected === i
                    ? "border-[#1a1a1a]"
                    : "border-transparent"
                }`}
                aria-label={`Ver imagen ${i + 1} de ${nombre}`}
              >
                <CloudinaryImage
                  src={foto}
                  alt={`${nombre} ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
