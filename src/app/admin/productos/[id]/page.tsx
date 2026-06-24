"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { ShopProduct } from "@/lib/types";
import { uid } from "@/lib/utils";
import { ImageUploader } from "@/components/ui/ImageUploader";

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
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [existingMarcas, setExistingMarcas] = useState<string[]>([]);
  const [existingIndumentarias, setExistingIndumentarias] = useState<string[]>([]);

  const loadProduct = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Producto no encontrado");
      setProduct(data.product);
    } catch (e: any) {
      setError("Producto no encontrado: " + e.message);
    }
    setLoading(false);
  }, [params.id, isNew]);

  // Load existing marcas and indumentarias from a lightweight meta endpoint
  const loadExistingOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/products/meta", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) {
        setExistingMarcas(data.marcas || []);
        setExistingIndumentarias(data.indumentarias || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadProduct();
    loadExistingOptions();
  }, [loadProduct, loadExistingOptions]);

  function updateField(field: keyof ShopProduct, value: any) {
    setProduct((prev) => ({ ...prev, [field]: value }));
  }

  function generateSlug() {
    const slug =
      (product.nombre || "producto")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now().toString(36);
    updateField("slug", slug);
  }

  function addPhoto() {
    const url = newPhotoUrl.trim();
    if (!url) return;
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

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (!product.nombre?.trim()) {
      setError("El nombre es obligatorio");
      setSaving(false);
      return;
    }

    let slug = product.slug?.trim();
    if (!slug) {
      slug =
        (product.nombre || "producto")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString(36);
    }

    const payload = {
      ...product,
      slug,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            created_at: new Date().toISOString(),
          }),
          credentials: "same-origin",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear");
        setSuccess(true);
        setTimeout(() => router.push("/admin/productos"), 1000);
      } else {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "same-origin",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al guardar");
        setSuccess(true);
      }
    } catch (e: any) {
      setError(e.message);
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      router.push("/admin/productos");
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/productos"
          className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
          ✅ Producto guardado correctamente.
        </div>
      )}

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Nombre *
          </label>
          <input
            type="text"
            value={product.nombre || ""}
            onChange={(e) => updateField("nombre", e.target.value)}
            placeholder="Nombre del producto"
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Slug */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <button
              onClick={generateSlug}
              className="text-xs text-primary hover:underline"
              type="button"
            >
              Generar
            </button>
          </div>
          <input
            type="text"
            value={product.slug || ""}
            onChange={(e) => updateField("slug", e.target.value)}
            placeholder="nombre-del-producto"
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Descripción
          </label>
          <textarea
            value={product.descripcion || ""}
            onChange={(e) => updateField("descripcion", e.target.value)}
            rows={3}
            placeholder="Descripción del producto..."
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Precio ARS */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Precio (ARS)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={product.precio_ars || ""}
              onChange={(e) =>
                updateField("precio_ars", parseFloat(e.target.value) || 0)
              }
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={product.stock || ""}
              onChange={(e) =>
                updateField("stock", parseInt(e.target.value) || 0)
              }
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Categoría
            </label>
            <input
              type="text"
              value={product.categoria || ""}
              onChange={(e) => updateField("categoria", e.target.value)}
              placeholder="Ej: buzos, remeras..."
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Color
            </label>
            <input
              type="text"
              value={product.color || ""}
              onChange={(e) => updateField("color", e.target.value)}
              placeholder="Ej: Negro, Blanco, Azul..."
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Marca
          </label>
          <ChipSelector
            options={mergeOptions(MARCA_OPTIONS, existingMarcas)}
            value={product.marca || null}
            onChange={(val) => updateField("marca", val)}
            placeholder="Marca personalizada..."
          />
        </div>

        {/* Indumentaria */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Indumentaria
          </label>
          <ChipSelector
            options={mergeOptions(INDUMENTARIA_OPTIONS, existingIndumentarias)}
            value={product.indumentaria || null}
            onChange={(val) => updateField("indumentaria", val)}
            placeholder="Tipo personalizado..."
          />
        </div>

        {/* Talles */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Talles disponibles
          </label>
          <TallesEditor
            talles={product.talles || []}
            onChange={(talles) => updateField("talles", talles)}
          />
        </div>

        {/* Peso */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Peso (g)
          </label>
          <input
            type="number"
            min="0"
            value={product.peso_g || ""}
            onChange={(e) =>
              updateField("peso_g", parseInt(e.target.value) || 0)
            }
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Publicado */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="publicado"
            checked={product.publicado || false}
            onChange={(e) => updateField("publicado", e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="publicado" className="text-sm text-foreground cursor-pointer">
            Publicado (visible en la tienda)
          </label>
        </div>

        {/* CSSBuy OID */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            CSSBuy Order ID
          </label>
          <input
            type="text"
            value={product.cssbuy_oid || ""}
            onChange={(e) => updateField("cssbuy_oid", e.target.value || null)}
            placeholder="Opcional"
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Fotos
          </label>
          <ImageUploader
            images={product.fotos || []}
            onChange={(fotos) => updateField("fotos", fotos)}
            folder={`ecommerce/productos/${product.id}`}
          />
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              O agregá una URL externa
            </p>
            <div className="flex gap-2">
              <input
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
                className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
              <button
                onClick={addPhoto}
                disabled={!newPhotoUrl.trim()}
                className="flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                type="button"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {!isNew && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar producto
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/admin/productos"
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Talles chip editor
function TallesEditor({ talles, onChange }: { talles: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const tallesPreset = ["XS", "S", "M", "L", "XL", "XXL", "Único"];

  function toggle(talle: string) {
    if (talles.includes(talle)) {
      onChange(talles.filter((t) => t !== talle));
    } else {
      onChange([...talles, talle]);
    }
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
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                active
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Talle personalizado..."
          className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
        />
        <button
          type="button"
          onClick={addCustom}
          className="text-xs bg-secondary/50 border border-border rounded-lg px-3 py-1.5 hover:bg-secondary/80 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Preset options
const MARCA_OPTIONS = ["Nike", "Adidas", "Essentials", "Stüssy", "New Balance"];
const INDUMENTARIA_OPTIONS = ["Remera", "Buzo", "Campera", "Pantalón"];

// Merge preset options with dynamic ones from DB (deduped, presets first)
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

// Generic chip selector — used for both marca and indumentaria
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
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                active
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={placeholder || "Personalizado..."}
          className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
        />
        <button
          type="button"
          onClick={addCustom}
          className="text-xs bg-secondary/50 border border-border rounded-lg px-3 py-1.5 hover:bg-secondary/80 transition-colors"
        >
          +
        </button>
      </div>
      {value && !options.includes(value) && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2.5 py-1 rounded-md border bg-primary/20 border-primary/50 text-primary">
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
