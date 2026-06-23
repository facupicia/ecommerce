"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Download,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ShopProduct, CssbuyOrder } from "@/lib/types";
import { uid } from "@/lib/utils";

export default function AdminProductosPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouseItems, setWarehouseItems] = useState<CssbuyOrder[]>([]);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function loadWarehouse() {
    setLoadingWarehouse(true);
    setError(null);
    const { data, error } = await supabase
      .from("cssbuy_warehouse")
      .select("*")
      .order("fecha_pedido", { ascending: false });

    if (error) {
      setError("Error cargando warehouse: " + error.message);
    } else {
      setWarehouseItems(data || []);
      setShowImport(true);
    }
    setLoadingWarehouse(false);
  }

  async function importToShop(order: CssbuyOrder) {
    setImporting(order.oid);
    setError(null);

    const slug =
      (order.producto || `producto-${order.oid}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      order.oid.slice(0, 6);

    const newProduct: Partial<ShopProduct> = {
      id: uid(),
      slug,
      nombre: order.producto || `CSSBuy #${order.oid}`,
      descripcion: `Importado de ${order.vendedor || "CSSBuy"}. Variante: ${order.variante || "N/A"}`,
      precio_ars: 0,
      precio_original_ars: null,
      fotos: order.imagen ? [order.imagen] : [],
      categoria: "importado",
      stock: order.cantidad || 1,
      publicado: false,
      cssbuy_oid: order.oid,
      peso_g: order.peso_g || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("shop_products").insert(newProduct);

    if (error) {
      setError("Error al importar: " + error.message);
    } else {
      await loadProducts();
    }
    setImporting(null);
  }

  async function togglePublished(product: ShopProduct) {
    const { error } = await supabase
      .from("shop_products")
      .update({ publicado: !product.publicado, updated_at: new Date().toISOString() })
      .eq("id", product.id);

    if (error) {
      setError("Error: " + error.message);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, publicado: !p.publicado } : p
        )
      );
    }
  }

  async function deleteProduct(product: ShopProduct) {
    if (!confirm(`¿Eliminar "${product.nombre}"? Esta acción no se puede deshacer.`))
      return;

    const { error } = await supabase
      .from("shop_products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setError("Error: " + error.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  }

  const alreadyImported = new Set(products.map((p) => p.cssbuy_oid).filter(Boolean) as string[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadWarehouse}
            disabled={loadingWarehouse}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loadingWarehouse ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Importar de Warehouse
          </button>
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Import from warehouse modal */}
      {showImport && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold">
              Warehouse CSSBuy ({warehouseItems.length} items)
            </h2>
            <button
              onClick={() => setShowImport(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Producto
                  </th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Precio ¥
                  </th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Peso g
                  </th>
                  <th className="text-center py-2 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Estado
                  </th>
                  <th className="text-center py-2 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {warehouseItems.map((item) => {
                  const imported = alreadyImported.has(item.oid);
                  return (
                    <tr
                      key={item.oid}
                      className={`border-b border-border/50 ${
                        imported ? "opacity-50" : "hover:bg-secondary/30"
                      }`}
                    >
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          {item.imagen && (
                            <img
                              src={item.imagen}
                              alt=""
                              className="w-8 h-8 rounded object-cover bg-muted flex-shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">
                              {item.producto || item.oid}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.vendedor}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums">
                        ¥{item.precio_unitario_cny?.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums">
                        {item.peso_g || "—"}g
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="text-xs text-emerald-400">{item.estado}</span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        {imported ? (
                          <span className="text-xs text-muted-foreground">
                            Ya importado
                          </span>
                        ) : (
                          <button
                            onClick={() => importToShop(item)}
                            disabled={importing === item.oid}
                            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                          >
                            {importing === item.oid ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : (
                              "Importar"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {warehouseItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      No hay items en el warehouse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <PackageEmptyIcon />
          <p className="text-muted-foreground text-sm mt-4">
            No hay productos. Importá desde warehouse o creá uno nuevo.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Publicado
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.fotos?.[0] && (
                          <img
                            src={product.fotos[0]}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0"
                          />
                        )}
                        <div>
                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {product.nombre}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {product.categoria || "Sin categoría"}
                            {product.cssbuy_oid && ` · CSSBuy #${product.cssbuy_oid}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      ${(product.precio_ars || 0).toLocaleString("es-AR")}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      <span
                        className={
                          (product.stock || 0) === 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => togglePublished(product)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                          product.publicado
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-secondary/50 text-muted-foreground border-border"
                        }`}
                      >
                        {product.publicado ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {product.publicado ? "Visible" : "Oculto"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageEmptyIcon() {
  return (
    <Package className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
  );
}
