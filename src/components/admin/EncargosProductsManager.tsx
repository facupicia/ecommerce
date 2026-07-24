"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import type { EncargoProduct, EncargoProductVariant } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { fetcher, fetcherPatch, fetcherDelete } from "@/lib/fetcher";
import { toast } from "@/components/ui/Toast";

const PAGE_SIZE = 12;

export function EncargosProductsManager() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<EncargoProduct | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states for modal
  const [formTitle, setFormTitle] = useState("");
  const [formPriceCny, setFormPriceCny] = useState<string>("");
  const [formCategory, setFormCategory] = useState("");
  const [formActivo, setFormActivo] = useState(true);
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [formDescImages, setFormDescImages] = useState<string[]>([]);
  const [formVariants, setFormVariants] = useState<EncargoProductVariant[]>([]);
  
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDescImageUrl, setNewDescImageUrl] = useState("");

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("page", String(page));
  qs.set("limit", String(PAGE_SIZE));

  const { data, error, isLoading, mutate } = useSWR<{
    products: EncargoProduct[];
    count: number;
  }>(`/api/admin/encargos/products?${qs.toString()}`, fetcher);

  const products = (data?.products || []).map((p: any) => ({
    ...p,
    variants: typeof p.variants === "string" ? JSON.parse(p.variants) : p.variants || [],
  }));
  const totalCount = data?.count || 0;

  const handleOpenEdit = (prod: EncargoProduct) => {
    setEditingProduct(prod);
    setFormTitle(prod.title || "");
    setFormPriceCny(prod.price_cny != null ? String(prod.price_cny) : "");
    setFormCategory(prod.category || "");
    setFormActivo(prod.activo);
    setFormImageUrls([...(prod.image_urls || [])]);
    setFormDescImages([...(prod.desc_images || [])]);
    setFormVariants([...(prod.variants || [])]);
    setNewImageUrl("");
    setNewDescImageUrl("");
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      await fetcherPatch(`/api/admin/encargos/products/${editingProduct.id}`, {
        title: formTitle.trim(),
        price_cny: formPriceCny ? parseFloat(formPriceCny) : null,
        category: formCategory.trim() || null,
        activo: formActivo,
        image_urls: formImageUrls,
        desc_images: formDescImages,
        variants: formVariants,
      });
      toast.success("Producto guardado correctamente");
      setEditingProduct(null);
      mutate();
    } catch (err) {
      toast.error("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este producto de encargo?")) return;
    try {
      await fetcherDelete(`/api/admin/encargos/products/${id}`);
      toast.success("Producto eliminado");
      mutate();
    } catch {
      toast.error("Error al eliminar el producto");
    }
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setFormImageUrls([...formImageUrls, url]);
    setNewImageUrl("");
  };

  const handleRemoveImageUrl = (index: number) => {
    setFormImageUrls(formImageUrls.filter((_, i) => i !== index));
  };

  const handleAddDescImageUrl = () => {
    const url = newDescImageUrl.trim();
    if (!url) return;
    setFormDescImages([...formDescImages, url]);
    setNewDescImageUrl("");
  };

  const handleRemoveDescImageUrl = (index: number) => {
    setFormDescImages(formDescImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={q}
              onChange={(val) => {
                setQ(val);
                setPage(1);
              }}
              placeholder="Buscar producto por título..."
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </Card>

      {/* Grid de Productos */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-10 w-10 text-[var(--color-fg-muted)]" />}
          title="No hay productos de encargo"
          description="Sincronizá productos desde el scraper o creá nuevos productos para encargo."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const firstImg = p.image_urls?.[0];
            return (
              <Card key={p.id} className="overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="aspect-square bg-[var(--color-bg-subtle)] relative overflow-hidden">
                    {firstImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firstImg}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-fg-muted)]">
                        Sin imagen
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={p.activo ? "success" : "neutral"}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                      {p.category || "Sin categoría"}
                    </span>
                    <h4 className="text-sm font-semibold line-clamp-2 text-[var(--color-fg)] leading-snug">
                      {p.title}
                    </h4>
                    {p.price_cny != null && (
                      <p className="text-xs font-bold text-[var(--color-fg-muted)]">
                        ¥{p.price_cny} base • {p.image_urls?.length || 0} fotos
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenEdit(p)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteProduct(p.id)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <div className="p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl">
          <Pagination page={page} totalPages={Math.ceil(totalCount / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}

      {/* Modal de Edición de Producto */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Producto de Encargo</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Información General */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-fg-muted)] mb-1">
                    Título del producto *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-fg-muted)] mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-fg-muted)] mb-1">
                    Precio CNY Base (¥)
                  </label>
                  <input
                    type="number"
                    value={formPriceCny}
                    onChange={(e) => setFormPriceCny(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--color-fg)]">
                    <input
                      type="checkbox"
                      checked={formActivo}
                      onChange={(e) => setFormActivo(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    Producto Visible / Activo
                  </label>
                </div>
              </div>

              <hr className="border-[var(--color-border)]" />

              {/* Imágenes Principales (Galería) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-[var(--color-fg)]">
                    Imágenes de Galería Principales ({formImageUrls.length})
                  </h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {formImageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg bg-black/5 overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                        title="Quitar imagen"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL de nueva imagen (https://...)"
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddImageUrl}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              <hr className="border-[var(--color-border)]" />

              {/* Imágenes de Descripción */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-[var(--color-fg)]">
                    Imágenes de Detalle / Descripción ({formDescImages.length})
                  </h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {formDescImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg bg-black/5 overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveDescImageUrl(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                        title="Quitar imagen"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDescImageUrl}
                    onChange={(e) => setNewDescImageUrl(e.target.value)}
                    placeholder="URL de foto de detalle (https://...)"
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDescImageUrl}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              <hr className="border-[var(--color-border)]" />

              {/* Editor de Variantes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[var(--color-fg)]">
                    Variantes ({formVariants.length})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormVariants([
                        ...formVariants,
                        { sku_id: null, name: "", price_cny: null, sizes: [], image_url: null },
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Variante
                  </Button>
                </div>

                {formVariants.length === 0 ? (
                  <p className="text-xs text-[var(--color-fg-muted)] italic">
                    Sin variantes configuradas. Agregá una usando el botón de arriba.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formVariants.map((variant, vIdx) => (
                      <div
                        key={vIdx}
                        className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-bg-subtle)] space-y-3 relative"
                      >
                        {/* Remove Variant Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormVariants(formVariants.filter((_, i) => i !== vIdx));
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Eliminar variante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-start gap-3 pr-8">
                          {/* Variant Image Preview */}
                          <div className="w-16 h-16 rounded-lg bg-black/5 overflow-hidden flex-shrink-0 border border-[var(--color-border)]">
                            {variant.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={variant.image_url}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--color-fg-muted)]">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Variant Name */}
                          <div className="flex-1 min-w-0">
                            <label className="block text-[10px] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider mb-1">
                              Nombre de la variante
                            </label>
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => {
                                const updated = [...formVariants];
                                updated[vIdx] = { ...updated[vIdx], name: e.target.value };
                                setFormVariants(updated);
                              }}
                              placeholder="Ej: Negro, Rojo, Modelo A..."
                              className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Variant Price */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider mb-1">
                              Precio CNY (¥)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price_cny ?? ""}
                              onChange={(e) => {
                                const updated = [...formVariants];
                                updated[vIdx] = {
                                  ...updated[vIdx],
                                  price_cny: e.target.value ? parseFloat(e.target.value) : null,
                                };
                                setFormVariants(updated);
                              }}
                              placeholder="Precio en yuanes"
                              className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                            />
                          </div>

                          {/* Variant Image URL */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider mb-1">
                              URL de Imagen
                            </label>
                            <input
                              type="text"
                              value={variant.image_url ?? ""}
                              onChange={(e) => {
                                const updated = [...formVariants];
                                updated[vIdx] = {
                                  ...updated[vIdx],
                                  image_url: e.target.value.trim() || null,
                                };
                                setFormVariants(updated);
                              }}
                              placeholder="https://..."
                              className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                            />
                          </div>
                        </div>

                        {/* Variant Sizes */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider">
                              Talles ({variant.sizes?.length || 0})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formVariants];
                                updated[vIdx] = {
                                  ...updated[vIdx],
                                  sizes: [...(updated[vIdx].sizes || []), { name: "", price: null }],
                                };
                                setFormVariants(updated);
                              }}
                              className="text-[10px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
                            >
                              + Agregar Talle
                            </button>
                          </div>
                          {variant.sizes && variant.sizes.length > 0 && (
                            <div className="space-y-1.5">
                              {variant.sizes.map((size, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={size.name}
                                    onChange={(e) => {
                                      const updated = [...formVariants];
                                      const sizes = [...(updated[vIdx].sizes || [])];
                                      sizes[sIdx] = { ...sizes[sIdx], name: e.target.value };
                                      updated[vIdx] = { ...updated[vIdx], sizes };
                                      setFormVariants(updated);
                                    }}
                                    placeholder="Nombre del talle (S, M, L...)"
                                    className="flex-1 px-2.5 py-1 rounded border border-[var(--color-border)] text-xs"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={size.price ?? ""}
                                    onChange={(e) => {
                                      const updated = [...formVariants];
                                      const sizes = [...(updated[vIdx].sizes || [])];
                                      sizes[sIdx] = {
                                        ...sizes[sIdx],
                                        price: e.target.value ? parseFloat(e.target.value) : null,
                                      };
                                      updated[vIdx] = { ...updated[vIdx], sizes };
                                      setFormVariants(updated);
                                    }}
                                    placeholder="¥ precio"
                                    className="w-24 px-2.5 py-1 rounded border border-[var(--color-border)] text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...formVariants];
                                      const sizes = (updated[vIdx].sizes || []).filter((_, i) => i !== sIdx);
                                      updated[vIdx] = { ...updated[vIdx], sizes };
                                      setFormVariants(updated);
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Quitar talle"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
