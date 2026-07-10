"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  X,
  Copy,
  Camera,
  Package,
  Clock,
  CreditCard,
  History,
  Mail,
  Phone,
  MapPin,
  FileText,
  Send,
  AlertTriangle,
} from "lucide-react";
import type {
  ShopEncargo,
  ShopEncargoStatusHistory,
  ShopEncargoPayment,
  EncargoEstado,
} from "@/lib/types";
import { ENCARGO_ESTADO_LABELS, ENCARGO_CATEGORIAS } from "@/lib/types";
import { Badge, EstadoBadge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { fetcher } from "@/lib/fetcher";
import { toast } from "@/components/ui/Toast";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

const ESTADOS: EncargoEstado[] = [
  "pendiente_presupuesto",
  "pendiente",
  "confirmado",
  "en_camino",
  "listo",
  "entregado",
  "cancelado",
];

const ESTADO_BADGE_MAP: Record<string, string> = {
  pendiente_presupuesto: "info",
  pendiente: "pending",
  confirmado: "paid",
  en_camino: "shipped",
  listo: "delivered",
  entregado: "success",
  cancelado: "cancelled",
};

interface AdminEncargoDrawerProps {
  encargoId: string;
  onClose: () => void;
  onUpdate: (id: string, updates: Record<string, any>) => void;
}

interface EncargoDetail extends ShopEncargo {
  historial: ShopEncargoStatusHistory[];
  pagos: ShopEncargoPayment[];
  cliente_email?: string;
}

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export function AdminEncargoDrawer({
  encargoId,
  onClose,
  onUpdate,
}: AdminEncargoDrawerProps) {
  const { data, error, isLoading, mutate } = useSWR<{
    encargo: EncargoDetail;
  }>(`/api/admin/encargos/${encargoId}`, fetcher, {
    revalidateOnFocus: false,
  });

  const [activeTab, setActiveTab] = useState<
    "general" | "pagos" | "historial"
  >("general");

  const encargo = data?.encargo;

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
            <DialogTitle>Detalle de encargo</DialogTitle>
            <button
              onClick={() => copy(encargo?.id || encargoId, "ID de encargo")}
              className="text-[10px] font-mono text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mt-1 flex items-center gap-1"
            >
              {encargo?.id || encargoId}
              <Copy className="h-2.5 w-2.5" />
            </button>
          </div>
          {encargo && (
            <Badge
              variant={
                (ESTADO_BADGE_MAP[encargo.estado] as any) || "neutral"
              }
              dot
              size="md"
            >
              {ENCARGO_ESTADO_LABELS[encargo.estado]}
            </Badge>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : error || !encargo ? (
          <div className="p-6 flex items-center gap-2 text-[var(--color-danger)]">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">No se pudo cargar el encargo.</span>
          </div>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onValueChange={(v: string) => setActiveTab(v as any)}
            >
              <div className="border-b border-[var(--color-border)] px-5">
                <TabsList>
                  <TabsTrigger value="general">
                    <Package className="h-3.5 w-3.5" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="pagos">
                    <CreditCard className="h-3.5 w-3.5" />
                    Pagos ({encargo.pagos.length})
                  </TabsTrigger>
                  <TabsTrigger value="historial">
                    <History className="h-3.5 w-3.5" />
                    Historial ({encargo.historial.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-5">
                <TabsContent value="general">
                  <GeneralTab
                    encargo={encargo}
                    onUpdate={onUpdate}
                    onMutate={mutate}
                  />
                </TabsContent>
                <TabsContent value="pagos">
                  <PagosTab pagos={encargo.pagos} onCopy={copy} />
                </TabsContent>
                <TabsContent value="historial">
                  <HistorialTab historial={encargo.historial} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GeneralTab({
  encargo,
  onUpdate,
  onMutate,
}: {
  encargo: EncargoDetail;
  onUpdate: (id: string, updates: Record<string, any>) => void;
  onMutate: () => void;
}) {
  const [estado, setEstado] = useState(encargo.estado);
  const [notas, setNotas] = useState(encargo.notas_admin || "");
  const [precio, setPrecio] = useState(String(encargo.precio_total || ""));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updates: Record<string, any> = {};

      if (estado !== encargo.estado) updates.estado = estado;
      if (notas !== encargo.notas_admin) updates.notas_admin = notas;
      if (precio !== String(encargo.precio_total))
        updates.precio_total = Number(precio) || 0;

      if (Object.keys(updates).length > 0) {
        onUpdate(encargo.id, updates);
      }

      // Marcar presupuesto como enviado si cambia a pendiente desde pendiente_presupuesto
      if (
        estado === "pendiente" &&
        encargo.estado === "pendiente_presupuesto" &&
        !encargo.presupuesto_enviado
      ) {
        onUpdate(encargo.id, { presupuesto_enviado: true });
      }

      onMutate();
    } catch (e: any) {
      toast.error("Error al guardar", {
        description: e.message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Info del cliente */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {encargo.cliente_email && (
          <Field
            icon={<Mail className="h-3.5 w-3.5" />}
            label="Email"
            value={encargo.cliente_email}
          />
        )}
        {(encargo as any).cliente?.telefono && (
          <Field
            icon={<Phone className="h-3.5 w-3.5" />}
            label="Teléfono"
            value={(encargo as any).cliente.telefono}
          />
        )}
        {(encargo as any).cliente?.direccion && (
          <Field
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Dirección"
            value={(encargo as any).cliente.direccion}
          />
        )}
        <Field
          label="Fecha"
          value={new Date(encargo.created_at).toLocaleString("es-AR")}
        />
      </div>

      {/* Info del producto */}
      <div className="p-3.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-[var(--radius)]">
        <div className="flex items-start gap-3">
          {encargo.imagen_url ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)] flex-shrink-0">
              <CloudinaryImage
                src={encargo.imagen_url}
                alt="Imagen del encargo"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center flex-shrink-0">
              {encargo.tipo === "catalogo" ? (
                <Package className="h-6 w-6 text-[var(--color-fg-muted)]" />
              ) : (
                <Camera className="h-6 w-6 text-[var(--color-fg-muted)]" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="neutral" size="sm">
                {encargo.tipo === "catalogo" ? "Catálogo" : "Personalizado"}
              </Badge>
            </div>
            <p className="font-medium text-sm">
              {encargo.categoria} — Talle {encargo.talle}
            </p>
            <p className="text-xs text-[var(--color-fg-muted)]">
              Cantidad: {encargo.cantidad}
              {encargo.producto?.nombre && ` · ${encargo.producto.nombre}`}
            </p>
            {encargo.descripcion && (
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                {encargo.descripcion}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-fg-muted)] mb-1.5">
          Precio total (ARS)
        </label>
        <Input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="0"
        />
        {Number(precio) > 0 && (
          <p className="text-xs text-[var(--color-fg-muted)] mt-1">
            Seña (50%): {formatARS(Number(precio) / 2)} · Restante:{" "}
            {formatARS(Number(precio) - Number(encargo.sena_pagada || 0))}
          </p>
        )}
      </div>

      {/* Notas admin */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-fg-muted)] mb-1.5 flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          Notas internas
        </label>
        <Textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Notas privadas (no visibles para el cliente)"
          rows={3}
        />
      </div>

      {/* Estado */}
      <div className="p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius)] border border-[var(--color-border)]">
        <label className="block text-xs font-medium text-[var(--color-fg-muted)] mb-2 uppercase tracking-wide">
          Estado
        </label>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                estado === e
                  ? "bg-[var(--color-fg)] text-[var(--color-fg-inverse)]"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] border border-[var(--color-border)]"
              }`}
            >
              {ENCARGO_ESTADO_LABELS[e]}
            </button>
          ))}
        </div>
      </div>

      {/* Presupuesto pendiente info */}
      {encargo.tipo === "personalizado" &&
        encargo.estado === "pendiente_presupuesto" &&
        !encargo.presupuesto_enviado && (
          <div className="p-3 bg-[var(--color-info-soft)] border border-[var(--color-info)]/20 rounded-[var(--radius)] text-sm">
            <div className="flex items-start gap-2">
              <Send className="h-4 w-4 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[var(--color-info)]">
                  Enviar presupuesto
                </p>
                <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                  Poné el precio total, cambiá el estado a &quot;Pendiente
                  pago&quot; y guardá. El cliente recibirá un email con el
                  presupuesto.
                </p>
              </div>
            </div>
          </div>
        )}

      <Button onClick={handleSave} className="w-full" disabled={saving}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}

function PagosTab({
  pagos,
  onCopy,
}: {
  pagos: ShopEncargoPayment[];
  onCopy: (text: string, label: string) => void;
}) {
  if (pagos.length === 0) {
    return (
      <p className="text-sm text-[var(--color-fg-muted)] text-center py-12">
        No hay pagos registrados.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {pagos.map((p) => (
        <div
          key={p.id}
          className="p-3.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-[var(--radius)] text-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <Badge variant={p.tipo === "sena" ? "accent" : "neutral"} size="sm">
              {p.tipo === "sena" ? "Seña" : "Restante"}
            </Badge>
            {p.mp_payment_id && (
              <button
                onClick={() => onCopy(p.mp_payment_id || "", "ID de pago")}
                className="flex items-center gap-1 font-mono text-[11px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                {p.mp_payment_id}
                <Copy className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Pair label="Monto" value={formatARS(Number(p.monto))} />
            <Pair label="Estado" value={p.estado} />
            {p.metodo_pago && <Pair label="Método" value={p.metodo_pago} />}
            <Pair
              label="Fecha"
              value={new Date(p.created_at).toLocaleString("es-AR")}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorialTab({
  historial,
}: {
  historial: ShopEncargoStatusHistory[];
}) {
  if (historial.length === 0) {
    return (
      <p className="text-sm text-[var(--color-fg-muted)] text-center py-12">
        Sin historial.
      </p>
    );
  }

  return (
    <div className="relative pl-6 space-y-5">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-[var(--color-border)]" />
      {historial.map((h) => (
        <div key={h.id} className="relative">
          <div className="absolute -left-[18px] top-1 w-2 h-2 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-bg-elevated)]" />
          <p className="text-[11px] text-[var(--color-fg-muted)] tabular-nums">
            {new Date(h.created_at).toLocaleString("es-AR")}
          </p>
          <p className="text-sm font-medium text-[var(--color-fg)] mt-0.5">
            {h.estado_anterior
              ? ENCARGO_ESTADO_LABELS[
                  h.estado_anterior as EncargoEstado
                ] || h.estado_anterior
              : "Creación"}
            {" → "}
            {ENCARGO_ESTADO_LABELS[h.estado_nuevo as EncargoEstado] ||
              h.estado_nuevo}
          </p>
          {h.notas && (
            <p className="text-[11px] text-[var(--color-fg-muted)] mt-0.5">
              {h.notas}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-[13px] text-[var(--color-fg)] break-words">
        {value}
      </p>
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
