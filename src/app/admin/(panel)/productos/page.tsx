"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Download,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Upload as UploadIcon,
  CheckCircle2,
} from "lucide-react";
import { ShopProduct, CssbuyOrder } from "@/lib/types";
import { uid } from "@/lib/utils";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import {
  loadCalcConfig,
  estimateFromOrder,
  formatARS,
} from "@/lib/pricing";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogClose } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/Toast";
import { fetcher, fetcherDelete, fetcherPatch, fetcherPost } from "@/lib/fetcher";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 25;

type FiltroEstado = "todos" | "publicado" | "oculto" | "sin-stock";

export default function AdminProductosPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [calcConfig, setCalcConfig] = useState(() => loadCalcConfig());
  const [pricing, setPricing] = useState<Record<string, { loading: boolean; value: number | null }>>({});
  const [confirmDelete, setConfirmDelete] = useState<ShopProduct | null>(null);

  // Update config on visibility
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") setCalcConfig(loadCalcConfig());
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const apiKey = useMemo(
    () =>
      [page, PAGE_SIZE, search].join("|"),
    [page, search]
  );
  const { data, error, isLoading, mutate } = useSWR<{
    products: ShopProduct[];
    count: number;
  }>(`/api/products?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}${search ? `&q=${encodeURIComponent(search)}` : ""}`, fetcher, {
    keepPreviousData: true,
  });

  const products = data?.products ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Apply client filter on top of API result
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filtro === "publicado" && !p.publicado) return false;
      if (filtro === "oculto" && p.publicado) return false;
      if (filtro === "sin-stock" && (p.stock || 0) > 0) return false;
      return true;
    });
  }, [products, filtro]);

  async function loadWarehouse(): Promise<CssbuyOrder[]> {
    const res = await fetch("/api/warehouse", { credentials: "same-origin" });
    if (!res.ok) throw new Error("Error cargando warehouse");
    const data = await res.json();
    return data.orders || [];
  }

  const { data: warehouseData, isLoading: loadingWarehouse } = useSWR<{ orders: CssbuyOrder[] }>(
    showImport ? "/api/warehouse" : null,
    fetcher
  );
  const warehouseItems = useMemo(
    () => (warehouseData?.orders || []).filter((o) => o.estado === "In Warehouse"),
    [warehouseData]
  );
  const alreadyImported = useMemo(
    () => new Set(products.map((p) => p.cssbuy_oid).filter(Boolean) as string[]),
    [products]
  );

  async function importToShop(order: CssbuyOrder) {
    setImporting(order.oid);
    try {
      const estimate = estimateFromOrder(order, calcConfig);
      const precioSugerido = estimate?.precioSugeridoARS ?? 0;

      const slugBase = (order.producto || `producto-${order.oid}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);

      const slug = `${slugBase}-${order.oid.slice(0, 8)}-${Date.now().toString(36)}`;

      await fetcherPost("/api/products", {
        id: uid(),
        slug,
        nombre: order.producto || `CSSBuy #${order.oid}`,
        descripcion: `Importado de ${order.vendedor || "CSSBuy"}. Variante: ${order.variante || "N/A"}`,
        precio_ars: Math.round(precioSugerido),
        precio_original_ars: null,
        fotos: order.imagen ? [order.imagen] : [],
        categoria: "",
        stock: order.cantidad || 1,
        publicado: false,
        cssbuy_oid: order.oid,
        peso_g: order.peso_g || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.success("Producto importado", { description: order.producto });
      mutate();
    } catch (e: any) {
      toast.error("Error al importar", { description: e.message });
    } finally {
      setImporting(null);
    }
  }

  async function togglePublished(product: ShopProduct) {
    const previous = product.publicado;
    // Optimistic
    mutate(
      (current) =>
        current
          ? {
              ...current,
              products: current.products.map((p) =>
                p.id === product.id ? { ...p, publicado: !p.publicado } : p
              ),
            }
          : current,
      { revalidate: false }
    );

    try {
      await fetcherPatch(`/api/products/${product.id}`, {
        publicado: !product.publicado,
        updated_at: new Date().toISOString(),
      });
      toast.success(product.publicado ? "Producto ocultado" : "Producto publicado");
    } catch (e: any) {
      // Rollback
      mutate(
        (current) =>
          current
            ? {
                ...current,
                products: current.products.map((p) =>
                  p.id === product.id ? { ...p, publicado: previous } : p
                ),
              }
            : current,
        { revalidate: false }
      );
      toast.error("No se pudo cambiar la visibilidad", { description: e.message });
    }
  }

  async function deleteProduct() {
    if (!confirmDelete) return;
    try {
      await fetcherDelete(`/api/products/${confirmDelete.id}`);
      toast.success("Producto eliminado");
      setConfirmDelete(null);
      mutate();
    } catch (e: any) {
      toast.error("No se pudo eliminar", { description: e.message });
    }
  }

  async function updateField(product: ShopProduct, field: "precio_ars" | "stock", value: number) {
    const current = product[field] ?? 0;
    if (value === current) return;

    try {
      await fetcherPatch(`/api/products/${product.id}`, {
        [field]: value,
        updated_at: new Date().toISOString(),
      });
      mutate();
    } catch (e: any) {
      toast.error("No se pudo actualizar", { description: e.message });
    }
  }

  async function applySuggestedPrice(product: ShopProduct) {
    if (!product.cssbuy_oid) return;
    setPricing((prev) => ({ ...prev, [product.id]: { loading: true, value: prev[product.id]?.value ?? null } }));
    try {
      const data = await fetcher<{ order?: CssbuyOrder }>(
        `/api/warehouse?oid=${encodeURIComponent(product.cssbuy_oid)}`
      );
      if (!data.order) throw new Error("No se encontró la orden");
      const estimate = estimateFromOrder(data.order, calcConfig);
      const value = estimate ? Math.round(estimate.precioSugeridoARS) : null;
      setPricing((prev) => ({ ...prev, [product.id]: { loading: false, value } }));
      if (value != null) {
        await updateProductField(product, "precio_ars", value);
      }
    } catch (e: any) {
      setPricing((prev) => ({ ...prev, [product.id]: { loading: false, value: prev[product.id]?.value ?? null } }));
      toast.error("No se pudo calcular el precio", { description: e.message });
    }
  }

  async function updateProductField(product: ShopProduct, field: "precio_ars" | "stock", value: number) {
    return updateField(product, field, value);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description={`${totalCount} producto${totalCount !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={() => setShowImport(true)}
            >
              Importar
            </Button>
            <Link href="/admin/productos/nuevo">
              <Button variant="primary" icon={<Plus className="h-3.5 w-3.5" />}>
                Nuevo producto
              </Button>
            </Link>
          </>
        }
      />

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Buscar por nombre, categoría, marca..."
          />
        </div>
        <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-[var(--radius)] p-0.5 bg-[var(--color-bg-elevated)]">
          {[
            { value: "todos" as const, label: "Todos" },
            { value: "publicado" as const, label: "Publicados" },
            { value: "oculto" as const, label: "Ocultos" },
            { value: "sin-stock" as const, label: "Sin stock" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setFiltro(opt.value);
                setPage(1);
              }}
              className={cn(
                "px-3 h-8 text-xs font-medium rounded-[var(--radius-sm)] transition-colors",
                filtro === opt.value
                  ? "bg-[var(--color-bg-subtle)] text-[var(--color-fg)] shadow-[var(--shadow-xs)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 rounded-[var(--radius)] text-sm text-[var(--color-danger)]">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error.message || "Error cargando productos"}
        </div>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-10 w-10" strokeWidth={1.2} />}
            title={search ? "Sin resultados" : "No hay productos"}
            description={
              search
                ? `No encontramos productos que coincidan con "${search}".`
                : "Importá desde warehouse o creá uno nuevo para empezar."
            }
            action={
              !search && (
                <Link href="/admin/productos/nuevo">
                  <Button variant="primary" icon={<Plus className="h-3.5 w-3.5" />}>
                    Crear producto
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th scope="col" className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Producto
                  </th>
                  <th scope="col" className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Precio
                  </th>
                  <th scope="col" className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Stock
                  </th>
                  <th scope="col" className="text-center py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Estado
                  </th>
                  <th scope="col" className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] w-10">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onTogglePublished={togglePublished}
                    onDelete={(p) => setConfirmDelete(p)}
                    onUpdateField={updateProductField}
                    onApplySuggested={applySuggestedPrice}
                    pricingState={pricing[product.id]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--color-fg-muted)]">
          <p>
            Página {page} de {totalPages} · {totalCount} productos
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Import modal */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Importar desde warehouse</DialogTitle>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              {warehouseItems.length} productos disponibles en el almacén de CSSBuy.
            </p>
          </DialogHeader>
          <DialogBody>
            {loadingWarehouse ? (
              <div className="py-12 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : warehouseItems.length === 0 ? (
              <EmptyState
                title="Sin items en el warehouse"
                description="Cuando tengas productos en tu almacén de CSSBuy, aparecerán acá."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th scope="col" className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">Producto</th>
                      <th scope="col" className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">¥</th>
                      <th scope="col" className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">g</th>
                      <th scope="col" className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] w-28"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseItems.map((item) => {
                      const imported = alreadyImported.has(item.oid);
                      return (
                        <tr
                          key={item.oid}
                          className={cn(
                            "border-b border-[var(--color-border)]/50 last:border-0",
                            imported && "opacity-50"
                          )}
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.imagen && (
                                <div className="relative w-8 h-8 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-muted)] flex-shrink-0">
                                  <CloudinaryImage src={item.imagen} alt="" fill className="object-cover" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-[13px] truncate">{item.producto || item.oid}</p>
                                <p className="text-[10px] text-[var(--color-fg-muted)] truncate">{item.vendedor}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-[13px]">
                            ¥{item.precio_unitario_cny?.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-[13px] text-[var(--color-fg-muted)]">
                            {item.peso_g || "—"}g
                          </td>
                          <td className="py-2 px-2 text-right">
                            {imported ? (
                              <Badge variant="neutral">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Importado
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => importToShop(item)}
                                loading={importing === item.oid}
                              >
                                Importar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Eliminar producto"
        description={`¿Eliminar "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={deleteProduct}
      />
    </div>
  );
}

interface ProductRowProps {
  product: ShopProduct;
  onTogglePublished: (p: ShopProduct) => void;
  onDelete: (p: ShopProduct) => void;
  onUpdateField: (p: ShopProduct, field: "precio_ars" | "stock", value: number) => void;
  onApplySuggested: (p: ShopProduct) => void;
  pricingState?: { loading: boolean; value: number | null };
}

function ProductRow({
  product,
  onTogglePublished,
  onDelete,
  onUpdateField,
  onApplySuggested,
  pricingState,
}: ProductRowProps) {
  return (
    <tr className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-bg-subtle)]/50 transition-colors group">
      <td className="py-2.5 px-4">
        <Link href={`/admin/productos/${product.id}`} className="flex items-center gap-3 min-w-0">
          {product.fotos?.[0] && (
            <div className="relative w-9 h-9 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-muted)] flex-shrink-0">
              <CloudinaryImage
                src={product.fotos[0]}
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-fg)] truncate text-[13px] group-hover:text-[var(--color-accent)] transition-colors">
              {product.nombre}
            </p>
            <p className="text-[11px] text-[var(--color-fg-muted)] truncate">
              {[
                product.categoria,
                product.marca,
                product.indumentaria,
                product.cssbuy_oid && "CSSBuy",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </Link>
      </td>
      <td className="py-2.5 px-4 text-right">
        <div className="inline-flex flex-col items-end gap-0.5">
          <InlineNumberInput
            value={product.precio_ars || 0}
            prefix="$"
            min={0}
            onSave={(v) => onUpdateField(product, "precio_ars", v)}
          />
          {product.cssbuy_oid && (
            <div className="min-h-[14px]">
              {pricingState?.loading ? (
                <Spinner size="sm" />
              ) : pricingState?.value != null ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onApplySuggested(product);
                  }}
                  className="text-[10px] text-[var(--color-accent)] hover:underline"
                  title="Aplicar precio calculado"
                >
                  Sugerido: {formatARS(pricingState.value)}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onApplySuggested(product);
                  }}
                  className="text-[10px] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
                >
                  Calcular
                </button>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 text-right">
        <InlineNumberInput
          value={product.stock || 0}
          min={0}
          step={1}
          onSave={(v) => onUpdateField(product, "stock", v)}
        />
      </td>
      <td className="py-2.5 px-4 text-center">
        <button
          onClick={() => onTogglePublished(product)}
          className={cn(
            "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors",
            product.publicado
              ? "bg-[var(--estado-paid-bg)] text-[var(--estado-paid-fg)] border-[var(--estado-paid-bd)]"
              : "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] border-[var(--color-border)]"
          )}
        >
          {product.publicado ? (
            <>
              <Eye className="h-2.5 w-2.5" strokeWidth={2} />
              Visible
            </>
          ) : (
            <>
              <EyeOff className="h-2.5 w-2.5" strokeWidth={2} />
              Oculto
            </>
          )}
        </button>
      </td>
      <td className="py-2.5 px-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] transition-colors"
              aria-label="Acciones"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/productos/${product.id}`}>
                <Edit className="h-3.5 w-3.5" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublished(product)}>
              {product.publicado ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {product.publicado ? "Ocultar" : "Publicar"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/producto/${product.slug}`} target="_blank" rel="noopener">
                <Eye className="h-3.5 w-3.5" />
                Ver en tienda
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger onClick={() => onDelete(product)}>
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function InlineNumberInput({
  value,
  onSave,
  prefix,
  min,
  step,
}: {
  value: number;
  onSave: (val: number) => void;
  prefix?: string;
  min?: number;
  step?: number;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    const num = step === 1 ? parseInt(draft, 10) : parseFloat(draft);
    const normalized = isNaN(num) ? 0 : Math.max(min ?? 0, num);
    if (normalized !== value) {
      onSave(normalized);
    } else {
      setDraft(String(value));
    }
  }

  return (
    <div className="inline-flex items-center justify-end gap-1">
      {prefix && <span className="text-[10px] text-[var(--color-fg-muted)]">{prefix}</span>}
      <input
        type="number"
        min={min ?? 0}
        step={step ?? 1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-20 text-right bg-transparent border border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] rounded-[var(--radius-sm)] px-2 py-1 text-[13px] tabular-nums focus:outline-none transition-colors"
      />
    </div>
  );
}
