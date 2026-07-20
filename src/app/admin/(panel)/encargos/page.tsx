"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  X,
  ShoppingBag,
  Inbox,
  RefreshCcw,
  Eye,
  Camera,
  Package,
} from "lucide-react";
import type { ShopEncargo, EncargoEstado, EncargoTipo } from "@/lib/types";
import { ENCARGO_ESTADO_LABELS } from "@/lib/types";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetcher, fetcherPatch } from "@/lib/fetcher";
import { toast } from "@/components/ui/Toast";
import { AdminEncargoDrawer } from "@/components/admin/AdminEncargoDrawer";

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

const PAGE_SIZE = 20;

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default function AdminEncargosPage() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [tipo, setTipo] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (estado) qs.set("estado", estado);
  if (tipo) qs.set("tipo", tipo);
  qs.set("page", String(page));
  qs.set("limit", String(PAGE_SIZE));

  const { data, error, isLoading, mutate } = useSWR<{
    encargos: ShopEncargo[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/admin/encargos?${qs.toString()}`, fetcher, { keepPreviousData: true });

  const encargos = data?.encargos ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };
  const hasFilters = !!q || !!estado || !!tipo;

  function clearFilters() {
    setQ("");
    setEstado("");
    setTipo("");
    setPage(1);
  }

  async function updateEncargo(id: string, updates: Record<string, any>) {
    try {
      await fetcherPatch("/api/admin/encargos", { id, ...updates });
      toast.success("Encargo actualizado");
      mutate();
    } catch (e: any) {
      toast.error("Error", { description: e.info?.error || e.message });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encargos"
        description={`${pagination.total} encargo${pagination.total !== 1 ? "s" : ""}`}
        actions={
          <Button
            variant="secondary"
            icon={<RefreshCcw className="h-3.5 w-3.5" />}
            onClick={() => mutate()}
            disabled={isLoading}
          >
            Refrescar
          </Button>
        }
      />

      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <SearchInput
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Buscar por ID, categoría, descripción..."
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)]"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {ENCARGO_ESTADO_LABELS[e]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)]"
            >
              <option value="">Todos los tipos</option>
              <option value="catalogo">Catálogo</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-center">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 rounded-[var(--radius)] text-sm text-[var(--color-danger)]">
          {error.message || "Error cargando encargos"}
        </div>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading && encargos.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : encargos.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-10 w-10" strokeWidth={1.2} />}
            title="No hay encargos"
            description={
              hasFilters
                ? "Probá ajustar los filtros."
                : "Cuando los clientes hagan encargos, aparecerán acá."
            }
            action={
              hasFilters ? (
                <Button variant="ghost" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Encargo
                  </th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Cliente
                  </th>
                  <th className="text-center py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Tipo
                  </th>
                  <th className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Total
                  </th>
                  <th className="text-center py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Estado
                  </th>
                  <th className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Fecha
                  </th>
                  <th className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] w-10">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {encargos.map((encargo) => (
                  <tr
                    key={encargo.id}
                    onClick={() => setDetailId(encargo.id)}
                    className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-bg-subtle)]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {encargo.tipo === "personalizado" ? (
                          <Camera className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" />
                        ) : (
                          <Package className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" />
                        )}
                        <div>
                          <p className="font-medium text-[13px] truncate">
                            {encargo.categoria} — Talle {encargo.talle}
                          </p>
                          <p className="text-[11px] text-[var(--color-fg-muted)] font-mono">
                            #{encargo.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <p className="text-[13px] truncate">
                        {(encargo as any).cliente?.nombre || "—"}
                      </p>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant="neutral" size="sm">
                        {encargo.tipo === "catalogo" ? "Catálogo" : "Personalizado"}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-[13px]">
                      {Number(encargo.precio_total) > 0
                        ? formatARS(Number(encargo.precio_total))
                        : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge
                        variant={
                          (ESTADO_BADGE_MAP[encargo.estado] as any) || "neutral"
                        }
                        dot
                        size="sm"
                      >
                        {ENCARGO_ESTADO_LABELS[encargo.estado]}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right text-[11px] text-[var(--color-fg-muted)] tabular-nums">
                      {new Date(encargo.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Eye className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--color-fg-muted)]">
          <p>
            Página {pagination.page} de {pagination.totalPages} ·{" "}
            {pagination.total} encargos
          </p>
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {detailId && (
        <AdminEncargoDrawer
          encargoId={detailId}
          onClose={() => setDetailId(null)}
          onUpdate={updateEncargo}
        />
      )}
    </div>
  );
}
