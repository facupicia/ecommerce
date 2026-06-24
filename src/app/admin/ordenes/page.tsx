"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Loader2, AlertTriangle, Package, Eye, ChevronDown } from "lucide-react";
import { ShopOrder } from "@/lib/types";

const ESTADOS = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

const labels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const styles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [detailId, setDetailId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando órdenes");
      setOrders(data.orders || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateStatus(id: string, estado: string) {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error actualizando estado");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, estado: data.order.estado } : o))
      );
    } catch (e: any) {
      setError(e.message);
    }
  }

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.estado === filter);

  const detail = orders.find((o) => o.id === detailId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Órdenes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} orden{orders.length !== 1 ? "es" : ""}
            {filter !== "all" && ` · filtrado: ${labels[filter] || filter}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {labels[e]}
              </option>
            ))}
          </select>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            Refrescar
          </button>
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

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-sm mt-4">
            No hay órdenes{filter !== "all" ? " con este estado" : ""}.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">
                        {order.cliente_nombre || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.cliente_email}
                      </p>
                      {order.cliente_telefono && (
                        <p className="text-xs text-muted-foreground">
                          {order.cliente_telefono}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {order.items?.length || 0} items
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      ${(order.total_ars || 0).toLocaleString("es-AR")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="relative inline-block">
                        <select
                          value={order.estado}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`appearance-none text-xs px-3 py-1 pr-7 rounded-full border bg-transparent cursor-pointer ${
                            styles[order.estado] ||
                            "bg-secondary/50 text-muted-foreground border-border"
                          }`}
                        >
                          {ESTADOS.map((e) => (
                            <option key={e} value={e}>
                              {labels[e]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-muted-foreground tabular-nums">
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setDetailId(order.id)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <DetailModal order={detail} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}

function DetailModal({ order, onClose }: { order: ShopOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-sm font-semibold">Detalle de orden</h2>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cerrar
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium">{order.cliente_nombre}</p>
              <p className="text-xs text-muted-foreground">{order.cliente_email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p>{new Date(order.created_at).toLocaleString("es-AR")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p>{order.cliente_telefono || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p>{order.cliente_direccion || "—"}</p>
            </div>
          </div>

          {order.cliente_notas && (
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Notas</p>
              <p className="mt-1">{order.cliente_notas}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-2">Items</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.imagen && (
                      <img
                        src={item.imagen}
                        alt=""
                        className="w-8 h-8 rounded object-cover bg-muted flex-shrink-0"
                      />
                    )}
                    <div className="truncate flex items-center gap-1.5">
                      <span className="truncate">{item.nombre}</span>
                      {item.talle && (
                        <span className="inline-block text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-1 py-0.5 rounded uppercase leading-none">
                          {item.talle}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right tabular-nums text-xs text-muted-foreground">
                    x{item.cantidad} · ${item.precio_ars.toLocaleString("es-AR")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold tabular-nums">
              ${(order.total_ars || 0).toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
