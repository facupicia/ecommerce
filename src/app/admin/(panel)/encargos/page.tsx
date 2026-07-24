"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  RefreshCw,
  Eye,
  Trash2,
  PackageCheck,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import type { EncargoOrder } from "@/lib/types";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { fetcher, fetcherPatch, fetcherDelete } from "@/lib/fetcher";
import { toast } from "@/components/ui/Toast";
import { EncargosProductsManager } from "@/components/admin/EncargosProductsManager";

const ESTADOS = [
  { key: "pending", label: "Pendiente", variant: "warning" as const },
  { key: "confirmed", label: "Confirmado", variant: "info" as const },
  { key: "ordered", label: "Pedido en Origen", variant: "accent" as const },
  { key: "received", label: "Recibido", variant: "success" as const },
  { key: "delivered", label: "Entregado", variant: "success" as const },
  { key: "cancelled", label: "Cancelado", variant: "danger" as const },
];

const PAGE_SIZE = 20;

export default function AdminEncargosPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<EncargoOrder | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [togglingSettings, setTogglingSettings] = useState(false);

  const { data: settingsData, mutate: mutateSettings } = useSWR<{ settings: any }>("/api/settings", fetcher);
  const isEncargosEnabled = settingsData?.settings?.encargosEnabled !== false;

  const handleToggleEncargosModule = async () => {
    if (!settingsData?.settings) return;
    setTogglingSettings(true);
    const newStatus = !isEncargosEnabled;
    try {
      const updatedSettings = {
        ...settingsData.settings,
        encargosEnabled: newStatus,
      };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updatedSettings }),
      });
      if (res.ok) {
        toast.success(newStatus ? "Módulo Encargos activado en la tienda" : "Módulo Encargos ocultado en la tienda");
        mutateSettings();
      } else {
        toast.error("Error al actualizar la configuración");
      }
    } catch {
      toast.error("Error al comunicarse con el servidor");
    } finally {
      setTogglingSettings(false);
    }
  };

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (estado) qs.set("estado", estado);
  qs.set("page", String(page));
  qs.set("limit", String(PAGE_SIZE));

  const { data, error, isLoading, mutate } = useSWR<{
    orders: EncargoOrder[];
    count: number;
  }>(`/api/admin/encargos?${qs.toString()}`, fetcher);

  const orders = data?.orders || [];
  const totalCount = data?.count || 0;

  const handleUpdateStatus = async (orderId: string, newEstado: string) => {
    setUpdating(true);
    try {
      await fetcherPatch(`/api/admin/encargos/${orderId}`, { estado: newEstado });
      toast.success("Estado actualizado");
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, estado: newEstado as EncargoOrder["estado"] } : null));
      }
      mutate();
    } catch (err) {
      toast.error("Error actualizando estado");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await fetcherPatch(`/api/admin/encargos/${selectedOrder.id}`, { admin_notas: editingNotes });
      toast.success("Notas guardadas");
      setSelectedOrder((prev) => (prev ? { ...prev, admin_notas: editingNotes } : null));
      mutate();
    } catch (err) {
      toast.error("Error guardando notas");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("¿Seguro que querés eliminar este pedido de encargo?")) return;
    try {
      await fetcherDelete(`/api/admin/encargos/${orderId}`);
      toast.success("Encargo eliminado");
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      mutate();
    } catch (err) {
      toast.error("Error eliminando encargo");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encargos"
        description="Gestión de solicitudes de importación por encargo y edición del catálogo de productos."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleEncargosModule}
              disabled={togglingSettings}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isEncargosEnabled
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
              title="Activar / Desactivar visualización pública del módulo de Encargos"
            >
              <span className={`w-2 h-2 rounded-full ${isEncargosEnabled ? "bg-green-500" : "bg-amber-500"}`} />
              Tienda: {isEncargosEnabled ? "Visible / Activo" : "Oculto (Pruebas)"}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "orders"
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          }`}
        >
          Pedidos de Clientes
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "products"
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          }`}
        >
          Editar Catálogo / Fotos
        </button>
      </div>

      {activeTab === "products" ? (
        <EncargosProductsManager />
      ) : (
        <>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={q}
              onChange={(val) => {
                setQ(val);
                setPage(1);
              }}
              placeholder="Buscar por cliente, email o producto..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => { setEstado(""); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                !estado
                  ? "bg-[var(--color-fg)] text-[var(--color-bg)]"
                  : "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              Todos
            </button>
            {ESTADOS.map((est) => (
              <button
                key={est.key}
                onClick={() => { setEstado(est.key); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  estado === est.key
                    ? "bg-[var(--color-fg)] text-[var(--color-bg)]"
                    : "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                }`}
              >
                {est.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista / Tabla */}
      <Card>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <EmptyState
            title="Error al cargar encargos"
            description={error.message || "Ocurrió un error"}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No se encontraron encargos"
            description="No hay solicitudes que coincidan con los filtros."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] uppercase tracking-wider text-[10px] font-semibold border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Variante / Talle</th>
                  <th className="px-4 py-3">Precio Est.</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {orders.map((o) => {
                  const estInfo = ESTADOS.find((e) => e.key === o.estado) || ESTADOS[0];
                  return (
                    <tr key={o.id} className="hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--color-fg)] max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          {o.product_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={o.product_image}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover bg-neutral-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 flex-shrink-0">
                              <PackageCheck className="w-4 h-4" />
                            </div>
                          )}
                          <span className="truncate">{o.product_title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--color-fg)]">{o.cliente_nombre}</div>
                        <div className="text-[var(--color-fg-subtle)]">{o.cliente_email}</div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-fg-muted)]">
                        {o.variante_nombre && <div>{o.variante_nombre}</div>}
                        {o.talle && <div className="font-semibold text-[var(--color-fg)]">Talle: {o.talle}</div>}
                        {!o.variante_nombre && !o.talle && "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {o.precio_usd ? `US$${o.precio_usd.toFixed(2)}` : o.precio_cny ? `¥${o.precio_cny}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={estInfo.variant} dot>
                          {estInfo.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-fg-subtle)]">
                        {new Date(o.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(o);
                              setEditingNotes(o.admin_notas || "");
                            }}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(o.id)}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalCount > PAGE_SIZE && (
          <div className="p-4 border-t border-[var(--color-border)]">
            <Pagination
              page={page}
              totalPages={Math.ceil(totalCount / PAGE_SIZE)}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Modal / Dialog de detalle */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center justify-between">
                <span>Detalle de Encargo</span>
                <Badge variant={ESTADOS.find((e) => e.key === selectedOrder.estado)?.variant || "neutral"}>
                  {ESTADOS.find((e) => e.key === selectedOrder.estado)?.label}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 text-xs py-2">
              {/* Producto */}
              <div className="flex items-start gap-4 p-3 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)]">
                {selectedOrder.product_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedOrder.product_image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-200"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-sm text-[var(--color-fg)] mb-1">
                    {selectedOrder.product_title}
                  </h4>
                  {selectedOrder.variante_nombre && (
                    <p className="text-[var(--color-fg-muted)]">Variante: {selectedOrder.variante_nombre}</p>
                  )}
                  {selectedOrder.talle && (
                    <p className="font-medium text-[var(--color-fg)]">Talle: {selectedOrder.talle}</p>
                  )}
                  <p className="font-bold mt-1 text-[var(--color-fg)]">
                    Cantidad: {selectedOrder.cantidad} | Precio: {selectedOrder.precio_usd ? `US$${selectedOrder.precio_usd}` : `¥${selectedOrder.precio_cny}`}
                  </p>
                </div>
              </div>

              {/* Cliente */}
              <div className="space-y-1.5 p-3 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)]">
                <h4 className="font-semibold text-[var(--color-fg)] mb-1">Datos del Cliente</h4>
                <p><strong>Nombre:</strong> {selectedOrder.cliente_nombre}</p>
                <p><strong>Email:</strong> <a href={`mailto:${selectedOrder.cliente_email}`} className="text-blue-600 underline">{selectedOrder.cliente_email}</a></p>
                {selectedOrder.cliente_telefono && <p><strong>Teléfono:</strong> {selectedOrder.cliente_telefono}</p>}
                {selectedOrder.cliente_direccion && <p><strong>Dirección:</strong> {selectedOrder.cliente_direccion}</p>}
                {selectedOrder.cliente_notas && <p className="mt-2 text-amber-700 bg-amber-50 p-2 rounded"><strong>Notas cliente:</strong> {selectedOrder.cliente_notas}</p>}
              </div>

              {/* Cambiar Estado */}
              <div>
                <label className="block font-semibold mb-2 text-[var(--color-fg)]">Cambiar Estado:</label>
                <div className="flex flex-wrap gap-1.5">
                  {ESTADOS.map((est) => (
                    <Button
                      key={est.key}
                      size="sm"
                      variant={selectedOrder.estado === est.key ? "primary" : "outline"}
                      onClick={() => handleUpdateStatus(selectedOrder.id, est.key)}
                      disabled={updating}
                    >
                      {est.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notas Admin */}
              <div>
                <label className="block font-semibold mb-1 text-[var(--color-fg)]">Notas de administración (internas):</label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={3}
                  placeholder="Escribí notas sobre este pedido..."
                  className="w-full p-2.5 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <div className="mt-1 flex justify-end">
                  <Button size="sm" onClick={handleSaveNotes} disabled={updating}>
                    Guardar Notas
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
        </>
      )}
    </div>
  );
}
