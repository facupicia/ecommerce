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
import { supabase } from "@/lib/supabase";
import { ShopProduct } from "@/lib/types";
import { uid } from "@/lib/utils";

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
    publicado: false,
    cssbuy_oid: null,
    peso_g: 0,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const loadProduct = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      setError("Producto no encontrado: " + (error?.message || ""));
    } else {
      setProduct(data);
    }
    setLoading(false);
  }, [params.id, isNew]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

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

    if (!product.slug?.trim()) {
      generateSlug();
      return;
    }

    const payload = {
      ...product,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      payload.created_at = new Date().toISOString();
      const { error: insertError } = await supabase.from("shop_products").insert(payload);
      if (insertError) {
        setError("Error al crear: " + insertError.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/admin/productos"), 1000);
      }
    } else {
      const { error: updateError } = await supabase
        .from("shop_products")
        .update(payload)
        .eq("id", product.id);
      if (updateError) {
        setError("Error al guardar: " + updateError.message);
      } else {
        setSuccess(true);
      }
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;

    const { error } = await supabase
      .from("shop_products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setError("Error al eliminar: " + error.message);
    } else {
      router.push("/admin/productos");
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
          <div className="space-y-2">
            {product.fotos && product.fotos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.fotos.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-16 h-16 rounded-lg object-cover bg-muted"
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                placeholder="URL de la imagen"
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
