"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { X, Loader2, AlertTriangle, Copy, RotateCcw, Box, CreditCard, History, Package, Phone, MapPin, Mail, FileText } from "lucide-react";
import { ShopOrder, ShopOrderLog, ShopPayment, ShopStockMovement } from "@/lib/types";
import { ESTADO_LABELS, ESTADO_BADGE_MAP, Badge, EstadoBadge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { NativeSelect } from "@/components/ui/Select";
import { fetcher, fetcherPost } from "@/lib/fetcher";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/Dialog";

const ESTADOS = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

interface OrderDetailDrawerProps {
  orderId: string;
  onClose: () => void;
  onStatusChange: (id: string, estado: string, nota?: string) => void;
}

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function OrderDetailDrawer({ orderId, onClose, onStatusChange }: OrderDetailDrawerProps) {
  const { data, error, isLoading } = useSWR<{
    order: ShopOrder;
    logs: ShopOrderLog[];
    payments: ShopPayment[];
    stockMovements: (ShopStockMovement & { shop_products?: { nombre: string } })[];
  }>(`/api/orders/${orderId}`, fetcher, { revalidateOnFocus: false });

  const [retrying, setRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "pagos" | "logs" | "stock">("general");

  async function retryPayment() {
    if (!data?.order) return;
    setRetrying(true);
    try {
      const res = await fetcherPost<{ mp_init_point: string }>(`/api/orders/${data.order.id}/retry`, {});
      window.location.href = res.mp_init_point;
    } catch (e: any) {
      toast.error("No se pudo generar el link", { description: e.info?.error || e.message });
      setRetrying(false);
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copiado`),
      () => toast.error("No se pudo copiar")
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="xl" className="max-w-2xl p-0">
        <DialogHeader className="p-5 border-b border-[var(--color-border)] flex-row items-start justify-between">
          <div className="min-w-0">
            <DialogTitle>Detalle de orden</DialogTitle>
            <button
              onClick={() => copy(data?.order?.id || orderId, "ID de orden")}
              className="text-[10px] font-mono text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mt-1 flex items-center gap-1"
            >
              {data?.order?.id || orderId}
              <Copy className="h-2.5 w-2.5" />
            </button>
          </div>
          {data?.order && <EstadoBadge estado={data.order.estado} />}
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : error || !data?.order ? (
          <div className="p-6 flex items-center gap-2 text-[var(--color-danger)]">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">No se pudo cargar la orden.</span>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)}>
              <div className="border-b border-[var(--color-border)] px-5">
                <TabsList>
                  <TabsTrigger value="general">
                    <Box className="h-3.5 w-3.5" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="pagos">
                    <CreditCard className="h-3.5 w-3.5" />
                    Pagos ({data.payments.length})
                  </TabsTrigger>
                  <TabsTrigger value="logs">
                    <History className="h-3.5 w-3.5" />
                    Logs ({data.logs.length})
                  </TabsTrigger>
                  <TabsTrigger value="stock">
                    <Package className="h-3.5 w-3.5" />
                    Stock ({data.stockMovements.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-5">
                <TabsContent value="general">
                  <GeneralTab order={data.order} onStatusChange={onStatusChange} />
                </TabsContent>
                <TabsContent value="pagos">
                  <PagosTab payments={data.payments} order={data.order} onCopy={copy} />
                </TabsContent>
                <TabsContent value="logs">
                  <LogsTab logs={data.logs} />
                </TabsContent>
                <TabsContent value="stock">
                  <StockTab movements={data.stockMovements} />
                </TabsContent>
              </div>
            </Tabs>

            {data.order.estado === "pending" && (
              <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center justify-between">
                <p className="text-xs text-[var(--color-fg-muted)]">
                  Generá un nuevo link de pago para enviárselo al cliente.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={retryPayment}
                  loading={retrying}
                  icon={!retrying ? <RotateCcw className="h-3.5 w-3.5" /> : undefined}
                >
                  Generar link de pago
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GeneralTab({ order, onStatusChange }: { order: ShopOrder; onStatusChange: (id: string, estado: string, nota?: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Field icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={order.cliente_email} />
        <Field
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Teléfono"
          value={order.cliente_telefono || "—"}
        />
        <Field
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Dirección"
          value={order.cliente_direccion || "—"}
        />
        <Field
          label="Fecha"
          value={new Date(order.created_at).toLocaleString("es-AR")}
        />
      </div>

      {order.cliente_notas && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] mb-2 flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            Notas del cliente
          </p>
          <p className="text-sm text-[var(--color-fg)] p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius)] border border-[var(--color-border)]">
            {order.cliente_notas}
          </p>
        </div>
      )}

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] mb-2">
          Items ({order.items?.length || 0})
        </p>
        <div className="space-y-1.5">
          {order.items?.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 bg-[var(--color-bg-subtle)] rounded-[var(--radius)] text-sm"
            >
              {item.imagen && (
                <div className="relative w-9 h-9 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-muted)] flex-shrink-0">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-fg)] truncate">{item.nombre}</p>
                <p className="text-[11px] text-[var(--color-fg-muted)]">
                  {item.talle && <span>Talle {item.talle} · </span>}
                  x{item.cantidad}
                </p>
              </div>
              <p className="text-[13px] font-medium tabular-nums flex-shrink-0">
                ${formatARS(item.precio_ars * item.cantidad)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <span className="text-sm text-[var(--color-fg-muted)]">Total</span>
        <span className="text-lg font-semibold tabular-nums">${formatARS(order.total_ars || 0)}</span>
      </div>

      <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius)]">
        <label className="text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-[var(--tracking-wide)]">
          Estado
        </label>
        <NativeSelect
          value={order.estado}
          onValueChange={(v) => onStatusChange(order.id, v, "Cambiado desde detalle de orden")}
          options={ESTADOS.map((e) => ({ value: e, label: ESTADO_LABELS[e] }))}
          className="flex-1 max-w-[200px]"
          ariaLabel="Cambiar estado de la orden"
        />
      </div>
    </div>
  );
}

function PagosTab({
  payments,
  order,
  onCopy,
}: {
  payments: ShopPayment[];
  order: ShopOrder;
  onCopy: (text: string, label: string) => void;
}) {
  if (payments.length === 0 && !order.mp_preference_id) {
    return (
      <p className="text-sm text-[var(--color-fg-muted)] text-center py-12">
        No hay pagos registrados.
      </p>
    );
  }
  return (
    <div className="space-y-2.5">
      {payments.map((p) => (
        <div
          key={p.id}
          className="p-3.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-[var(--radius)] text-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] font-semibold">
              MP Payment
            </span>
            <button
              onClick={() => onCopy(p.mp_payment_id || "", "ID de pago")}
              className="flex items-center gap-1 font-mono text-[11px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            >
              {p.mp_payment_id}
              <Copy className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Pair label="Estado" value={p.mp_status || "—"} />
            {p.mp_status_detail && <Pair label="Detalle" value={p.mp_status_detail} />}
            {p.monto_pagado != null && (
              <Pair label="Monto pagado" value={`$${formatARS(p.monto_pagado)}`} />
            )}
            {p.metodo_pago && <Pair label="Método" value={p.metodo_pago} />}
            {p.cuotas != null && <Pair label="Cuotas" value={String(p.cuotas)} />}
            {p.fecha_pago && (
              <Pair
                label="Fecha de pago"
                value={new Date(p.fecha_pago).toLocaleString("es-AR")}
              />
            )}
          </div>
        </div>
      ))}
      {order.mp_preference_id && (
        <div className="p-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-[var(--radius)] text-sm flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] font-semibold">
            MP Preference
          </span>
          <button
            onClick={() => onCopy(order.mp_preference_id || "", "ID de preferencia")}
            className="flex items-center gap-1 font-mono text-[11px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            {order.mp_preference_id}
            <Copy className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function LogsTab({ logs }: { logs: ShopOrderLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-[var(--color-fg-muted)] text-center py-12">Sin logs.</p>;
  }
  return (
    <div className="relative pl-6 space-y-5">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-[var(--color-border)]" />
      {logs.map((log) => (
        <div key={log.id} className="relative">
          <div className="absolute -left-[18px] top-1 w-2 h-2 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-bg-elevated)]" />
          <p className="text-[11px] text-[var(--color-fg-muted)] tabular-nums">
            {new Date(log.created_at).toLocaleString("es-AR")}
          </p>
          <p className="text-sm font-medium text-[var(--color-fg)] mt-0.5">
            {log.estado_anterior ? ESTADO_LABELS[log.estado_anterior] || log.estado_anterior : "Creación"}
            {" → "}
            {ESTADO_LABELS[log.estado_nuevo] || log.estado_nuevo}
          </p>
          {log.metadata?.nota && (
            <p className="text-[11px] text-[var(--color-fg-muted)] mt-0.5">{log.metadata.nota}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function StockTab({
  movements,
}: {
  movements: (ShopStockMovement & { shop_products?: { nombre: string } })[];
}) {
  if (movements.length === 0) {
    return <p className="text-sm text-[var(--color-fg-muted)] text-center py-12">Sin movimientos.</p>;
  }
  return (
    <div className="space-y-1.5">
      {movements.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius)] text-sm"
        >
          <div>
            <p className="text-[13px] font-medium text-[var(--color-fg)]">
              {m.shop_products?.nombre || m.product_id}
            </p>
            <p className="text-[10px] text-[var(--color-fg-muted)] capitalize">
              {m.tipo} · {m.motivo || "—"}
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-[13px] font-semibold tabular-nums",
                m.cantidad > 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
              )}
            >
              {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
            </p>
            <p className="text-[10px] text-[var(--color-fg-muted)] tabular-nums">
              {new Date(m.created_at).toLocaleString("es-AR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-[13px] text-[var(--color-fg)] break-words">{value}</p>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
        {label}
      </p>
      <p className="text-[12px] text-[var(--color-fg)] mt-0.5">{value}</p>
    </div>
  );
}
