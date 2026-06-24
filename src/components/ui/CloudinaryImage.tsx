"use client";

import { CldImage } from "next-cloudinary";
import { isCloudinarySource } from "@/lib/cloudinary";

interface CloudinaryImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  priority,
  loading,
}: CloudinaryImageProps) {
  if (!src) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className ?? ""}`}
        aria-label="Sin imagen"
      >
        <svg
          className="w-10 h-10 text-muted-foreground/40"
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
      </div>
    );
  }

  if (!isCloudinarySource(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
      />
    );
  }

  return (
    <CldImage
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      loading={loading}
    />
  );
}
