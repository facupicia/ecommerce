"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  Calendar,
  X,
  Loader2,
  ShoppingCart,
  Inbox,
  RefreshCcw,
  Eye,
  Download,
} from "lucide-react";
import { ShopOrder } from "@/lib/types";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Badge, EstadoBadge, ESTADO_LABELS } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderDetailDrawer } from "@/components/admin/OrderDetailDrawer";
import { fetcher, fetcherPatch } from "@/lib/fetcher";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const ESTADOS = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
const PAGE_SIZE = 20;

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPhone(raw: string | null | undefined) {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+54 9 ${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

export default function AdminOrdenesPage() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (estado) qs.set("estado", estado);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  qs.set("page", String(page));
  qs.set("limit", String(PAGE_SIZE));

  const { data, error, isLoading, mutate } = useSWR<{
    orders: ShopOrder[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/orders?${qs.toString()}`, fetcher, { keepPreviousData: true });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };
  const hasFilters = !!q || !!estado || !!from || !!to;

  function clearFilters() {
    setQ("");
    setEstado("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  async function updateStatus(id: string, nuevoEstado: string, nota?: string) {
    try {
      const res = await fetcherPatch<{ order: ShopOrder }>("/api/orders", { id, estado: nuevoEstado, nota });
      mutate(
        (current) =>
          current
            ? {
                ...current,
                orders: current.orders.map((o) =>
                  o.id === id ? { ...o, estado: res.order.estado } : o
                ),
              }
            : current,
        { revalidate: false }
      );
      toast.success("Estado actualizado", { description: ESTADO_LABELS[nuevoEstado] });
    } catch (e: any) {
      toast.error("No se pudo actualizar", { description: e.info?.error || e.message });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes"
        description={`${pagination.total} orden${pagination.total !== 1 ? "es" : ""}`}
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
              placeholder="Buscar por cliente, email o ID..."
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
                  {ESTADO_LABELS[e]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--color-fg-muted)] flex-shrink-0" />
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="flex-1 h-9 px-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)]"
            />
            <span className="text-[var(--color-fg-subtle)]">—</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="flex-1 h-9 px-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)]"
            />
          </div>
        </div>
        {hasFilters && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[var(--color-fg-muted)]">Filtros:</span>
              {q && (
                <Badge variant="neutral">
                  "{q}"
                  <button onClick={() => setQ("")} aria-label="Quitar" className="ml-1">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {estado && (
                <Badge variant="neutral">
                  {ESTADO_LABELS[estado]}
                  <button onClick={() => setEstado("")} aria-label="Quitar" className="ml-1">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {(from || to) && (
                <Badge variant="neutral">
                  {from || "..."} → {to || "..."}
                  <button
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                    aria-label="Quitar"
                    className="ml-1"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
            >
              Limpiar
            </button>
          </div>
        )}
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 rounded-[var(--radius)] text-sm text-[var(--color-danger)]">
          {error.message || "Error cargando órdenes"}
        </div>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading && orders.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-10 w-10" strokeWidth={1.2} />}
            title="No hay órdenes"
            description={
              hasFilters
                ? "Probá ajustar los filtros."
                : "Cuando los clientes hagan pedidos, aparecerán acá."
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
                  <th scope="col" className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Cliente
                  </th>
                  <th scope="col" className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Total
                  </th>
                  <th scope="col" className="text-center py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Estado
                  </th>
                  <th scope="col" className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                    Fecha
                  </th>
                  <th scope="col" className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)] w-10">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setDetailId(order.id)}
                    className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-bg-subtle)]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4">
                      <p className="font-medium text-[var(--color-fg)] text-[13px] truncate">
                        {order.cliente_nombre || "—"}
                      </p>
                      <p className="text-[11px] text-[var(--color-fg-muted)] truncate">
                        {order.cliente_email}
                      </p>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-[13px]">
                      ${formatARS(order.total_ars || 0)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <EstadoBadge estado={order.estado} />
                    </td>
                    <td className="py-2.5 px-4 text-right text-[11px] text-[var(--color-fg-muted)] tabular-nums">
                      {new Date(order.created_at).toLocaleDateString("es-AR", {
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
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} órdenes
          </p>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      {detailId && (
        <OrderDetailDrawer
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}
