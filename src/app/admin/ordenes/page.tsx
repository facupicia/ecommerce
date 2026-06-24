"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Package,
  Eye,
  ChevronDown,
  Search,
  Calendar,
  X,
  Clock,
  CreditCard,
  Copy,
  ExternalLink,
  RotateCcw,
  History,
  Box,
} from "lucide-react";
import { ShopOrder, ShopOrderLog, ShopPayment, ShopStockMovement } from "@/lib/types";
import { useDebounce } from "@/lib/hooks";

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
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const PAGE_SIZE = 20;

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [detailId, setDetailId] = useState<string | null>(null);
  const debouncedQ = useDebounce(q, 300);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (estado) params.set("estado", estado);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    return `/api/orders?${params.toString()}`;
  }, [debouncedQ, estado, from, to, page]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildQuery(), { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando órdenes");
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Resetear a página 1 cuando cambian filtros de búsqueda.
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, estado, from, to]);

  async function updateStatus(id: string, nuevoEstado: string, nota?: string) {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado, nota }),
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

  function clearFilters() {
    setQ("");
    setEstado("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const hasFilters = q || estado || from || to;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Órdenes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.total} orden{pagination.total !== 1 ? "es" : ""}
            {estado && ` · ${labels[estado]}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por cliente, email, ID de orden o pago..."
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {labels[e]}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando resultados filtrados
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          </div>
        )}
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
      ) : orders.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-sm mt-4">
            No hay órdenes{hasFilters ? " con estos filtros" : ""}.
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
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
                {orders.map((order) => (
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {detailId && (
        <DetailModal
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onStatusChange={(id, estado) => updateStatus(id, estado, `Cambiado desde detalle de orden`)}
        />
      )}
    </div>
  );
}

function DetailModal({
  orderId,
  onClose,
  onStatusChange,
}: {
  orderId: string;
  onClose: () => void;
  onStatusChange: (id: string, estado: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [logs, setLogs] = useState<ShopOrderLog[]>([]);
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [stockMovements, setStockMovements] = useState<ShopStockMovement[]>([]);
  const [activeTab, setActiveTab] = useState<"general" | "pagos" | "logs" | "stock">("general");
  const [retrying, setRetrying] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando detalle");
      setOrder(data.order);
      setLogs(data.logs || []);
      setPayments(data.payments || []);
      setStockMovements(data.stockMovements || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function retryPayment() {
    if (!order) return;
    setRetrying(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/retry`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al reintentar pago");
      window.location.href = data.mp_init_point;
    } catch (e: any) {
      setError(e.message);
      setRetrying(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <p>{error || "No se pudo cargar la orden"}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-secondary rounded-lg text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const latestPayment = payments[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">Detalle de orden</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cerrar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {[
            { id: "general", label: "General", icon: Box },
            { id: "pagos", label: `Pagos (${payments.length})`, icon: CreditCard },
            { id: "logs", label: `Logs (${logs.length})`, icon: History },
            { id: "stock", label: `Stock (${stockMovements.length})`, icon: RotateCcw },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "general" && (
            <div className="space-y-5">
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

              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground">Cambiar estado:</span>
                <select
                  value={order.estado}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded-full border bg-transparent ${
                    styles[order.estado]
                  }`}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {labels[e]}
                    </option>
                  ))}
                </select>
              </div>

              {order.estado === "pending" && (
                <button
                  onClick={retryPayment}
                  disabled={retrying}
                  className="flex items-center gap-2 text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {retrying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  Generar nuevo link de pago
                </button>
              )}
            </div>
          )}

          {activeTab === "pagos" && (
            <div className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay pagos registrados para esta orden.
                </p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-secondary/30 border border-border rounded-lg text-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ID de Pago MP</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {payment.mp_payment_id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(payment.mp_payment_id || "")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <span className="font-medium">{payment.mp_status}</span>
                    </div>
                    {payment.mp_status_detail && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Detalle</span>
                        <span>{payment.mp_status_detail}</span>
                      </div>
                    )}
                    {payment.monto_pagado && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Monto pagado</span>
                        <span className="font-medium">
                          ${payment.monto_pagado.toLocaleString("es-AR")}
                        </span>
                      </div>
                    )}
                    {payment.metodo_pago && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Método</span>
                        <span>{payment.metodo_pago}</span>
                      </div>
                    )}
                    {payment.cuotas && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cuotas</span>
                        <span>{payment.cuotas}</span>
                      </div>
                    )}
                    {payment.fecha_pago && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Fecha de pago</span>
                        <span>{new Date(payment.fecha_pago).toLocaleString("es-AR")}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      Recibido: {new Date(payment.created_at).toLocaleString("es-AR")}
                    </div>
                  </div>
                ))
              )}

              {order.mp_preference_id && (
                <div className="p-4 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ID Preferencia MP</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{order.mp_preference_id}</span>
                      <button
                        onClick={() => copyToClipboard(order.mp_preference_id || "")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay logs para esta orden.
                </p>
              ) : (
                <div className="relative border-l border-border ml-2 space-y-6">
                  {logs.map((log) => (
                    <div key={log.id} className="ml-4">
                      <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("es-AR")}
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {log.estado_anterior
                          ? `${labels[log.estado_anterior] || log.estado_anterior} → `
                          : "Creación → "}
                        {labels[log.estado_nuevo] || log.estado_nuevo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tipo: {log.tipo}
                        {log.metadata?.nota && ` · Nota: ${log.metadata.nota}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "stock" && (
            <div className="space-y-3">
              {stockMovements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay movimientos de stock para esta orden.
                </p>
              ) : (
                stockMovements.map((movement: any) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {movement.shop_products?.nombre || movement.product_id}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {movement.tipo} · {movement.motivo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${movement.cantidad < 0 ? "text-destructive" : "text-emerald-400"}`}>
                        {movement.cantidad > 0 ? `+${movement.cantidad}` : movement.cantidad}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movement.created_at).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
