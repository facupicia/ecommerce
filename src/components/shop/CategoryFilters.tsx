"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ShopProduct } from "@/lib/types";
import { ProductCard } from "@/components/shop/ProductCard";

interface CategoryFiltersProps {
  products: ShopProduct[];
}

const INDUMENTARIA_LABELS: Record<string, string> = {
  Remera: "Remeras",
  Buzo: "Buzos",
  Campera: "Camperas",
  "Pantalón": "Pantalones",
};

export function CategoryFilters({ products }: CategoryFiltersProps) {
  const searchParams = useSearchParams();
  const indParam = searchParams.get("indumentaria");
  const marcaParam = searchParams.get("marca");
  const catParam = searchParams.get("categoria");

  // Initialize filters from URL query params
  const [selectedMarcas, setSelectedMarcas] = useState<Set<string>>(
    () => (marcaParam ? new Set([marcaParam]) : new Set())
  );
  const [selectedIndumentaria, setSelectedIndumentaria] = useState<Set<string>>(
    () => (indParam ? new Set([indParam]) : new Set())
  );
  const [selectedCategorias, setSelectedCategorias] = useState<Set<string>>(
    () => (catParam ? new Set([catParam]) : new Set())
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("recientes");

  // Sincronizar filtros cuando cambian los query params (navegación entre categorías)
  const paramsKey = `${indParam ?? ""}|${marcaParam ?? ""}|${catParam ?? ""}`;
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey);
  if (prevParamsKey !== paramsKey) {
    setPrevParamsKey(paramsKey);
    setSelectedIndumentaria(indParam ? new Set([indParam]) : new Set());
    setSelectedMarcas(marcaParam ? new Set([marcaParam]) : new Set());
    setSelectedCategorias(catParam ? new Set([catParam]) : new Set());
  }

  // Extract unique values
  const marcas = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.marca) set.add(p.marca);
    });
    return Array.from(set).sort();
  }, [products]);

  const indumentarias = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.indumentaria) set.add(p.indumentaria);
    });
    return Array.from(set).sort();
  }, [products]);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoria && p.categoria.toLowerCase() !== "importado") {
        set.add(p.categoria);
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter + sort products
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedMarcas.size > 0 && (!p.marca || !selectedMarcas.has(p.marca))) return false;
      if (selectedIndumentaria.size > 0 && (!p.indumentaria || !selectedIndumentaria.has(p.indumentaria))) return false;
      if (selectedCategorias.size > 0 && (!p.categoria || !selectedCategorias.has(p.categoria))) return false;
      return true;
    });

    // Sort
    switch (sortBy) {
      case "precio-asc":
        result = result.sort((a, b) => a.precio_ars - b.precio_ars);
        break;
      case "precio-desc":
        result = result.sort((a, b) => b.precio_ars - a.precio_ars);
        break;
      case "nombre":
        result = result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "recientes":
      default:
        result = result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [products, selectedMarcas, selectedIndumentaria, selectedCategorias, sortBy]);

  const activeFilterCount = selectedMarcas.size + selectedIndumentaria.size + selectedCategorias.size;

  function toggleFilter(
    set: Set<string>,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string
  ) {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setter(next);
  }

  function clearAll() {
    setSelectedMarcas(new Set());
    setSelectedIndumentaria(new Set());
    setSelectedCategorias(new Set());
  }

  const filterSections = (
    <>
      {/* Indumentaria */}
      {indumentarias.length > 0 && (
        <FilterSection title="Indumentaria">
          {indumentarias.map((ind) => (
            <FilterCheckbox
              key={ind}
              label={INDUMENTARIA_LABELS[ind] || ind}
              checked={selectedIndumentaria.has(ind)}
              onChange={() => toggleFilter(selectedIndumentaria, setSelectedIndumentaria, ind)}
              count={products.filter((p) => p.indumentaria === ind).length}
            />
          ))}
        </FilterSection>
      )}

      {/* Marca */}
      {marcas.length > 0 && (
        <FilterSection title="Marca">
          {marcas.map((marca) => (
            <FilterCheckbox
              key={marca}
              label={marca}
              checked={selectedMarcas.has(marca)}
              onChange={() => toggleFilter(selectedMarcas, setSelectedMarcas, marca)}
              count={products.filter((p) => p.marca === marca).length}
            />
          ))}
        </FilterSection>
      )}

      {/* Categoría */}
      {categorias.length > 0 && (
        <FilterSection title="Categoría">
          {categorias.map((cat) => (
            <FilterCheckbox
              key={cat}
              label={cat}
              checked={selectedCategorias.has(cat)}
              onChange={() => toggleFilter(selectedCategorias, setSelectedCategorias, cat)}
              count={products.filter((p) => p.categoria === cat).length}
            />
          ))}
        </FilterSection>
      )}

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="plug-btn-sm plug-btn-sm-danger w-full mt-4 py-2 border-t border-[#d9d9d9] justify-center"
        >
          Limpiar filtros ({activeFilterCount})
        </button>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      {/* Page header */}
      <section className="mb-10 lg:mb-14 text-center max-w-2xl mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--plug-gray)] mb-4">
          Explorar
        </p>
        <h1 className="plug-font-serif text-4xl sm:text-5xl text-[#1a1a1a] mb-4">
          Catálogo
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--plug-gray)]">
          Encontrá lo que buscás filtrando por marca, tipo de prenda y categoría.
        </p>
      </section>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center gap-2 plug-btn w-full justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold bg-[#1a1a1a] text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Mobile filters drawer */}
        {mobileFiltersOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[320px] max-w-[85vw] bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between h-[60px] px-5 border-b border-[#d9d9d9]">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
                  Filtros
                </span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 -mr-2 text-[#1a1a1a]"
                  aria-label="Cerrar filtros"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-1">
                {filterSections}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop layout: sidebar + grid */}
      <div className="flex gap-10 lg:gap-14">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-[220px] flex-shrink-0">
          <div className="sticky top-[80px] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-5 pb-3 border-b border-[#d9d9d9]">
              Filtros
            </p>
            {filterSections}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {/* Results count + Sort */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#d9d9d9]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--plug-gray)]">
              {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-[10px] uppercase tracking-[0.15em] text-[var(--plug-gray)] hidden sm:inline">
                Ordenar:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[11px] font-medium text-[#1a1a1a] bg-transparent border border-[#d9d9d9] px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-[#1a1a1a] uppercase tracking-[0.08em] min-h-[36px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231a1a1a' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "0.75rem",
                }}
              >
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="hidden lg:inline-flex plug-btn-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from(selectedIndumentaria).map((v) => (
                <FilterPill
                  key={`ind-${v}`}
                  label={INDUMENTARIA_LABELS[v] || v}
                  onRemove={() => toggleFilter(selectedIndumentaria, setSelectedIndumentaria, v)}
                />
              ))}
              {Array.from(selectedMarcas).map((v) => (
                <FilterPill
                  key={`marca-${v}`}
                  label={v}
                  onRemove={() => toggleFilter(selectedMarcas, setSelectedMarcas, v)}
                />
              ))}
              {Array.from(selectedCategorias).map((v) => (
                <FilterPill
                  key={`cat-${v}`}
                  label={v}
                  onRemove={() => toggleFilter(selectedCategorias, setSelectedCategorias, v)}
                />
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-[var(--plug-gray)] opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h3 className="plug-font-serif text-xl text-[#1a1a1a] mb-2">
                Sin resultados
              </h3>
              <p className="text-[var(--plug-gray)] text-sm mb-4">
                No hay productos que coincidan con los filtros seleccionados.
              </p>
              <button onClick={clearAll} className="plug-btn text-xs">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 lg:gap-x-8 lg:gap-y-14">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="py-3 border-b border-[#ebebeb]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full group"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1a1a]">
          {title}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[var(--plug-gray)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count: number;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group min-h-[32px] py-1 select-none">
      <div
        className={`w-4 h-4 border rounded-[3px] flex items-center justify-center transition-colors flex-shrink-0 ${
          checked
            ? "bg-[#1a1a1a] border-[#1a1a1a]"
            : "border-[#d9d9d9] group-hover:border-[#999] group-focus-within:border-[#1a1a1a]"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        aria-label={`Filtrar por ${label}`}
      />
      <span
        className={`text-[12px] capitalize transition-colors ${
          checked ? "text-[#1a1a1a] font-medium" : "text-[var(--plug-gray)] group-hover:text-[#1a1a1a]"
        }`}
      >
        {label}
      </span>
      <span className="ml-auto text-[10px] text-[var(--plug-gray)] tabular-nums">
        {count}
      </span>
    </label>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 border border-[#1a1a1a] bg-[#1a1a1a] text-white text-[10px] font-medium uppercase tracking-[0.1em]">
      {label}
      <button
        onClick={onRemove}
        className="inline-flex items-center justify-center min-w-[24px] min-h-[24px] p-1 rounded-full hover:bg-white/15 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        aria-label={`Quitar filtro ${label}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
