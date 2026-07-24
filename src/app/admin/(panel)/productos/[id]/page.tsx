"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Save,
  Trash2,
  ArrowLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Copy as CopyIcon,
  ExternalLink,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { ShopProduct, CssbuyOrder, Cotizacion } from "@/lib/types";
import { uid } from "@/lib/utils";
import { ImageUploader } from "@/components/ui/ImageUploader";
import {
  estimateFromOrderAndCotizacionProduct,
  formatARS,
  PricingEstimate,
  PricingEstimateBreakdown,
  calculateProductEstimateBreakdownFromCotizacion,
} from "@/lib/pricing";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { NativeSelect } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { fetcher, fetcherDelete, fetcherPatch, fetcherPost } from "@/lib/fetcher";

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "nuevo";

  const [product, setProduct] = useState<Partial<ShopProduct>>({
    id: uid(),
    slug: "",
    nombre: "",
    descripcion: "",
    precio_ars: 0,
    precio_original_ars: null,
    fotos: [],
    categoria: "",
    stock: 0,
    talles: [],
    color: "",
    marca: null,
    indumentaria: null,
    publicado: false,
    cssbuy_oid: null,
    peso_g: 0,
    tabla_talles: null,
  });
  const [saving, setSaving] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [cotizacionId, setCotizacionId] = useState<string>("");
  const [estimate, setEstimate] = useState<PricingEstimate | null>(null);
  const [estimateBreakdown, setEstimateBreakdown] = useState<PricingEstimateBreakdown | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: productData, isLoading: loadingProduct } = useSWR<{ product: ShopProduct }>(
    isNew ? null : `/api/products/${params.id}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (productData?.product) setProduct(productData.product);
  }, [productData]);

  const { data: meta } = useSWR<{ marcas: string[]; indumentarias: string[] }>(
    "/api/products/meta",
    fetcher
  );

  const { data: cotData, mutate: refreshCot } = useSWR<{ cotizaciones: Cotizacion[] }>(
    "/api/cotizaciones",
    fetcher
  );
  const cotizaciones = cotData?.cotizaciones || [];

  useEffect(() => {
    if (cotizaciones.length > 0 && !cotizacionId) {
      setCotizacionId(cotizaciones[0].id);
    }
  }, [cotizaciones, cotizacionId]);

  // Compute estimate
  useEffect(() => {
    async function computeEstimate() {
      if (!product.cssbuy_oid || !cotizacionId) {
        setEstimate(null);
        setEstimateBreakdown(null);
        return;
      }
      setEstimateLoading(true);
      try {
        const data = await fetcher<{ order?: CssbuyOrder }>(
          `/api/warehouse?oid=${encodeURIComponent(product.cssbuy_oid)}`
        );
        if (!data.order) {
          setEstimate(null);
          setEstimateBreakdown(null);
          return;
        }
        const order = data.order;
        const overrides = { pesoG: product.peso_g || order.peso_g || 0 };
        const selectedCot = cotizaciones.find((c) => c.id === cotizacionId);
        if (!selectedCot) {
          setEstimate(null);
          setEstimateBreakdown(null);
          return;
        }
        const est = estimateFromOrderAndCotizacionProduct(order, selectedCot, overrides);
        setEstimate(est);
        if (est) {
          setEstimateBreakdown(
            calculateProductEstimateBreakdownFromCotizacion(order, selectedCot, overrides)
          );
        } else {
          setEstimateBreakdown(null);
        }
      } catch {
        setEstimate(null);
        setEstimateBreakdown(null);
      } finally {
        setEstimateLoading(false);
      }
    }
    computeEstimate();
  }, [product.cssbuy_oid, product.peso_g, cotizacionId, cotizaciones]);

  function updateField<K extends keyof ShopProduct>(field: K, value: ShopProduct[K]) {
    setProduct((prev) => ({ ...prev, [field]: value }));
  }

  function applySuggestedPrice() {
    if (estimate?.precioSugeridoARS) {
      updateField("precio_ars", Math.round(estimate.precioSugeridoARS));
      toast.success("Precio sugerido aplicado");
    }
  }

  function generateSlug() {
    const rand = Math.random().toString(36).slice(2, 6);
    const slug =
      (product.nombre || "producto")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      rand +
      Date.now().toString(36);
    updateField("slug", slug);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    if (!product.nombre?.trim()) {
      toast.error("El nombre es obligatorio");
      setSaving(false);
      return;
    }

    let slug = product.slug?.trim();
    if (!slug) {
      const rand = Math.random().toString(36).slice(2, 6);
      slug =
        (product.nombre || "producto")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        rand +
        Date.now().toString(36);
    }

    const payload = {
      ...product,
      slug,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        await fetcherPost("/api/products", {
          ...payload,
          created_at: new Date().toISOString(),
        });
        toast.success("Producto creado", { description: product.nombre });
        router.push("/admin/productos");
      } else {
        await fetcherPatch(`/api/products/${product.id}`, payload);
        toast.success("Cambios guardados");
      }
    } catch (e: any) {
      const msg = e.info?.error || e.message || "Error";
      setError(msg);
      toast.error("No se pudo guardar", { description: msg });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await fetcherDelete(`/api/products/${product.id}`);
      toast.success("Producto eliminado");
      router.push("/admin/productos");
    } catch (e: any) {
      toast.error("No se pudo eliminar", { description: e.message });
    }
  }

  function addPhoto() {
    const url = newPhotoUrl.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        toast.error("La URL debe usar http o https");
        return;
      }
    } catch {
      toast.error("URL inválida");
      return;
    }
    setProduct((prev) => ({
      ...prev,
      fotos: [...(prev.fotos || []), url],
    }));
    setNewPhotoUrl("");
  }

  function removePhoto(index: number) {
    setProduct((prev) => ({
      ...prev,
      fotos: (prev.fotos || []).filter((_, i) => i !== index),
    }));
  }

  if (loadingProduct && !isNew) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/productos"
          className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          title={isNew ? "Nuevo producto" : "Editar producto"}
          description={isNew ? "Creá un producto para sumarlo al catálogo." : product.nombre}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 rounded-[var(--radius)] text-sm text-[var(--color-danger)]">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basics */}
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Nombre, descripción y precio.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={product.nombre || ""}
              onChange={(e) => updateField("nombre", e.target.value)}
              placeholder="Buzo Corteiz Marrón"
              required
            />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-[var(--tracking-wide)]">
                  Slug
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  Generar
                </button>
              </div>
              <Input
                value={product.slug || ""}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="buzo-corteiz-marron"
                className="font-mono"
              />
              {product.slug && (
                <p className="text-[10px] text-[var(--color-fg-muted)] mt-1.5">
                  Se verá en: <span className="font-mono">/producto/{product.slug}</span>
                </p>
              )}
            </div>
            <Textarea
              label="Descripción"
              value={product.descripcion || ""}
              onChange={(e) => updateField("descripcion", e.target.value)}
              rows={4}
              placeholder="Descripción del producto..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Precio (ARS)"
                type="number"
                step="0.01"
                min="0"
                value={product.precio_ars || ""}
                onChange={(e) => updateField("precio_ars", parseFloat(e.target.value) || 0)}
                prefix="$"
                className="tabular-nums"
              />
              <Input
                label="Stock"
                type="number"
                min="0"
                value={product.stock || ""}
                onChange={(e) => updateField("stock", parseInt(e.target.value) || 0)}
                className="tabular-nums"
              />
            </div>
          </div>
        </Card>

        {/* Estimado de calculadora */}
        {product.cssbuy_oid && (
          <Card padding="lg">
            <CardHeader>
              <div>
                <CardTitle>Estimado de calculadora</CardTitle>
                <CardDescription>
                  Basado en la cotización guardada. Aplicá el precio sugerido al producto.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {cotizaciones.length > 0 ? (
                  <NativeSelect
                    value={cotizacionId}
                    onValueChange={setCotizacionId}
                    options={cotizaciones.map((c) => ({
                      value: c.id,
                      label: `${c.nombre} (${new Date(c.fecha).toLocaleDateString("es-AR")})`,
                    }))}
                    className="w-56"
                  />
                ) : (
                  <span className="text-xs text-[var(--color-warning)]">
                    Guardá una cotización en la calculadora
                  </span>
                )}
                {estimate?.precioSugeridoARS ? (
                  <Button
                    size="sm"
                    onClick={applySuggestedPrice}
                    variant="primary"
                  >
                    Aplicar {formatARS(Math.round(estimate.precioSugeridoARS))}
                  </Button>
                ) : (
                  <span className="text-xs text-[var(--color-fg-muted)]">
                    {estimateLoading ? "Calculando..." : "Sin datos de warehouse"}
                  </span>
                )}
              </div>
            </CardHeader>

            {estimate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Mini label="Precio sugerido" value={formatARS(Math.round(estimate.precioSugeridoARS))} />
                  <Mini label="Costo unit." value={`USD ${estimate.costoUnitUSD.toFixed(2)}`} />
                  <Mini
                    label="Ganancia"
                    value={`USD ${estimate.gananciaUnitUSD.toFixed(2)}`}
                    className={estimate.gananciaUnitUSD >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}
                  />
                  <Mini label="Margen" value={`${(estimate.margenPct * 100).toFixed(1)}%`} />
                </div>

                {estimateBreakdown && (
                  <div className="p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius)] space-y-1.5 text-xs">
                    <p className="font-medium text-[var(--color-fg-muted)] uppercase tracking-[var(--tracking-wide)] text-[10px] mb-2">
                      Desglose del costo unitario
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[var(--color-fg-muted)]">
                      <Breakdown label="Producto FOB" value={estimateBreakdown.fobUSD} />
                      <Breakdown label="Envío prorrateado" value={estimateBreakdown.envioProrrateadoUSD} />
                      <Breakdown label="Impuestos ARG" value={estimateBreakdown.impuestosProrrateadosUSD} />
                      <div>
                        <p>Total costo</p>
                        <p className="font-semibold text-[var(--color-fg)] tabular-nums">
                          USD {estimateBreakdown.costoUnitUSD.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Categorización */}
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Categorización</CardTitle>
              <CardDescription>Categoría, marca, indumentaria, talles y color.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Categoría"
                value={product.categoria || ""}
                onChange={(e) => updateField("categoria", e.target.value)}
                placeholder="Ej: buzos, remeras..."
              />
              <Input
                label="Color"
                value={product.color || ""}
                onChange={(e) => updateField("color", e.target.value)}
                placeholder="Negro, Blanco, Azul..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-[var(--tracking-wide)] mb-2">
                Marca
              </label>
              <ChipSelector
                options={mergeOptions(MARCA_OPTIONS, meta?.marcas || [])}
                value={product.marca || null}
                onChange={(val) => updateField("marca", val)}
                placeholder="Marca personalizada..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-[var(--tracking-wide)] mb-2">
                Indumentaria
              </label>
              <ChipSelector
                options={mergeOptions(INDUMENTARIA_OPTIONS, meta?.indumentarias || [])}
                value={product.indumentaria || null}
                onChange={(val) => updateField("indumentaria", val)}
                placeholder="Tipo personalizado..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-[var(--tracking-wide)] mb-2">
                Talles disponibles
              </label>
              <TallesEditor
                talles={product.talles || []}
                onChange={(talles) => updateField("talles", talles)}
              />
            </div>
          </div>
        </Card>

        {/* Datos extra */}
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Datos extra</CardTitle>
              <CardDescription>Peso, CSSBuy Order ID y visibilidad.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Peso (g)"
                type="number"
                min="0"
                value={product.peso_g || ""}
                onChange={(e) => updateField("peso_g", parseInt(e.target.value) || 0)}
                className="tabular-nums"
              />
              <Input
                label="CSSBuy Order ID"
                value={product.cssbuy_oid || ""}
                onChange={(e) => updateField("cssbuy_oid", e.target.value || null)}
                placeholder="Opcional"
                className="font-mono"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-fg)]">Publicado</p>
                <p className="text-xs text-[var(--color-fg-muted)]">
                  Visible para los clientes en la tienda.
                </p>
              </div>
              <Switch
                checked={product.publicado || false}
                onCheckedChange={(c: boolean) => updateField("publicado", c)}
              />
            </div>
          </div>
        </Card>

        {/* Fotos */}
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Fotos</CardTitle>
              <CardDescription>Subí imágenes o pegá una URL externa.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <ImageUploader
              images={product.fotos || []}
              onChange={(fotos) => updateField("fotos", fotos)}
              folder={`ecommerce/productos/${product.id}`}
            />
            <div className="pt-3 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-fg-muted)] mb-2">O agregá una URL externa</p>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPhoto();
                    }
                  }}
                  placeholder="https://..."
                  className="flex-1"
                />
                <Button
                  onClick={addPhoto}
                  disabled={!newPhotoUrl.trim()}
                  icon={<Plus className="h-3.5 w-3.5" />}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabla de talles */}
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Tabla de talles
              </CardTitle>
              <CardDescription>Subí una imagen o pegá una URL con la guía de talles.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <ImageUploader
              images={product.tabla_talles ? [product.tabla_talles] : []}
              onChange={(imgs) => updateField("tabla_talles", imgs[0] || null)}
              folder={`ecommerce/productos/${product.id}/talles`}
              maxFiles={1}
            />
            <div className="pt-3 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-fg-muted)] mb-2">O pegá una URL externa</p>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={product.tabla_talles?.startsWith("http") ? product.tabla_talles : ""}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    if (!url) {
                      updateField("tabla_talles", null);
                    } else {
                      updateField("tabla_talles", url);
                    }
                  }}
                  placeholder="https://..."
                  className="flex-1"
                />
                {product.tabla_talles && (
                  <Button
                    variant="danger"
                    onClick={() => updateField("tabla_talles", null)}
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Quitar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between sticky bottom-0 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3 bg-[var(--color-bg-elevated)]/80 backdrop-blur-md border-t border-[var(--color-border)]">
        {!isNew ? (
          <Button
            variant="danger"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => setConfirmDelete(true)}
          >
            Eliminar
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Link href="/admin/productos">
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            icon={!saving ? <Save className="h-3.5 w-3.5" /> : undefined}
          >
            Guardar
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Eliminar producto"
        description={`¿Eliminar "${product.nombre}" permanentemente? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

function Mini({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius)]">
      <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--color-fg-muted)]">
        {label}
      </p>
      <p className={`text-sm font-semibold tabular-nums mt-1 ${className || "text-[var(--color-fg)]"}`}>
        {value}
      </p>
    </div>
  );
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p>{label}</p>
      <p className="font-medium text-[var(--color-fg)] tabular-nums">USD {value.toFixed(2)}</p>
    </div>
  );
}

const MARCA_OPTIONS = ["Nike", "Adidas", "Essentials", "Stüssy", "New Balance"];
const INDUMENTARIA_OPTIONS = ["Remera", "Buzo", "Campera", "Pantalón"];

function mergeOptions(presets: string[], existing: string[]): string[] {
  const set = new Set(presets);
  const merged = [...presets];
  for (const v of existing) {
    if (!set.has(v)) {
      merged.push(v);
      set.add(v);
    }
  }
  return merged;
}

function TallesEditor({ talles, onChange }: { talles: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const tallesPreset = ["XS", "S", "M", "L", "XL", "XXL", "Único"];

  function toggle(talle: string) {
    if (talles.includes(talle)) onChange(talles.filter((t) => t !== talle));
    else onChange([...talles, talle]);
  }

  function addCustom() {
    const t = input.trim();
    if (t && !talles.includes(t)) {
      onChange([...talles, t]);
      setInput("");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tallesPreset.map((t) => {
          const active = talles.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] border transition-colors ${
                active
                  ? "bg-[var(--color-accent-soft)] border-[var(--color-accent-border)] text-[var(--color-accent)]"
                  : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-accent-border)]"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Talle personalizado..."
          className="flex-1"
        />
        <Button variant="secondary" onClick={addCustom}>
          +
        </Button>
      </div>
    </div>
  );
}

function ChipSelector({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
}) {
  const [customInput, setCustomInput] = useState("");

  function select(option: string) {
    onChange(value === option ? null : option);
  }

  function addCustom() {
    const t = customInput.trim();
    if (t) {
      onChange(t);
      setCustomInput("");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => select(opt)}
              className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] border transition-colors ${
                active
                  ? "bg-[var(--color-accent-soft)] border-[var(--color-accent-border)] text-[var(--color-accent)]"
                  : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-accent-border)]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={placeholder || "Personalizado..."}
          className="flex-1"
        />
        <Button variant="secondary" onClick={addCustom}>
          +
        </Button>
      </div>
    </div>
  );
}
