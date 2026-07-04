"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ars);
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    []
  );

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(value)}&limit=6&publicado=true`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
          setOpen(true);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Search icon + input */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 w-4 h-4 text-[var(--plug-gray)] pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-10 py-2 text-[13px] border-b border-transparent bg-transparent text-[#1a1a1a] placeholder:text-[var(--plug-gray)] focus:border-[#1a1a1a] outline-none transition-colors"
          aria-label="Buscar productos"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 p-1 text-[var(--plug-gray)] hover:text-[#1a1a1a] transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#d9d9d9] shadow-xl rounded-sm overflow-hidden z-50 max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[12px] text-[var(--plug-gray)]">
              Buscando...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-[12px] text-[var(--plug-gray)]">
              No se encontraron productos
            </div>
          ) : (
            <>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/producto/${product.slug}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] transition-colors border-b border-[#ebebeb] last:border-b-0"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-[#f5f5f5] overflow-hidden rounded-sm">
                    {product.fotos && product.fotos.length > 0 ? (
                      <CloudinaryImage
                        src={product.fotos[0]}
                        alt={product.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--plug-gray)]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] line-clamp-1">
                      {product.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px] font-semibold text-[#1a1a1a]">
                        {formatPrice(product.precio_ars)}
                      </span>
                      {product.categoria && (
                        <span className="text-[10px] text-[var(--plug-gray)] uppercase tracking-wider">
                          {product.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {results.length >= 6 && (
                <Link
                  href={`/categorias?q=${encodeURIComponent(query)}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="block text-center py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors border-t border-[#d9d9d9]"
                >
                  Ver todos los resultados
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
