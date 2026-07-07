import { supabaseAdmin } from "@/lib/supabase";
import { ShopOrder } from "@/lib/types";
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { EstadoBadge, Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Plus, Upload, Calculator as CalcIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["paid", "shipped", "delivered"] as const;

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const today = startOfDay(now);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: paidOrders },
    { data: recentOrders },
    { data: paidOrdersList },
    { data: ordersLast30 },
  ] = await Promise.all([
    supabaseAdmin
      .from("shop_products")
      .select("id", { count: "exact", head: true })
      .neq("slug", "__shop_settings__"),
    supabaseAdmin
      .from("shop_orders")
      .select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("shop_orders")
      .select("id", { count: "exact", head: true })
      .eq("estado", "pending"),
    supabaseAdmin
      .from("shop_orders")
      .select("id", { count: "exact", head: true })
      .in("estado", PAID_STATUSES as unknown as string[]),
    supabaseAdmin
      .from("shop_orders")
      .select("id, cliente_nombre, cliente_email, items, total_ars, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabaseAdmin
      .from("shop_orders")
      .select("id, total_ars, cliente_nombre, created_at")
      .in("estado", PAID_STATUSES as unknown as string[])
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("shop_orders")
      .select("total_ars, created_at, estado")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const orders = (recentOrders || []) as ShopOrder[];
  const paidList = (paidOrdersList || []) as ShopOrder[];
  const last30 = (ordersLast30 || []) as { total_ars: number; created_at: string; estado: string }[];

  const totalRevenue = paidList.reduce((sum, o) => sum + (o.total_ars || 0), 0);

  const conversionRate =
    totalOrders && Number(totalOrders) > 0
      ? Math.round((Number(paidOrders || 0) / Number(totalOrders)) * 100)
      : 0;

  // Build daily series for last 30 days
  const dayMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    dayMap.set(formatDayKey(d), 0);
  }
  for (const o of last30) {
    const key = formatDayKey(new Date(o.created_at));
    const cur = dayMap.get(key) ?? 0;
    dayMap.set(key, cur + (o.total_ars || 0));
  }
  const series = Array.from(dayMap.entries()).map(([key, value]) => ({
    key,
    value,
    label: new Date(key + "T00:00:00Z").toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));
  const maxVal = Math.max(1, ...series.map((s) => s.value));

  const todayLabel = now.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Productos"
          value={totalProducts ?? 0}
          icon={<Package className="h-4 w-4" strokeWidth={1.6} />}
          size="sm"
        />
        <StatCard
          label="Órdenes"
          value={totalOrders ?? 0}
          icon={<ShoppingCart className="h-4 w-4" strokeWidth={1.6} />}
          size="sm"
        />
        <StatCard
          label="Pendientes"
          value={pendingOrders ?? 0}
          icon={<Clock className="h-4 w-4" strokeWidth={1.6} />}
          size="sm"
        />
        <StatCard
          label="Conversión"
          value={`${conversionRate}%`}
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.6} />}
          size="sm"
        />
      </div>

      {/* Revenue + sales chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card padding="lg" className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                Ingresos confirmados
              </p>
              <p className="text-3xl font-semibold tracking-[-0.025em] tabular-nums text-[var(--color-fg)] mt-2">
                ${formatARS(totalRevenue)}
              </p>
            </div>
            <div className="p-2.5 rounded-[var(--radius)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <DollarSign className="h-4 w-4" strokeWidth={1.6} />
            </div>
          </div>
          <p className="text-xs text-[var(--color-fg-muted)] mb-5">
            Suma de órdenes pagadas, enviadas y entregadas.
          </p>

          {/* Chart */}
          <div className="h-32 flex items-end gap-[2px]" aria-hidden>
            {series.map((d, i) => {
              const pct = (d.value / maxVal) * 100;
              return (
                <div
                  key={d.key}
                  className="flex-1 bg-[var(--color-bg-subtle)] hover:bg-[var(--color-accent)] transition-colors rounded-t-[2px] min-w-0"
                  style={{ height: `${Math.max(2, pct)}%` }}
                  title={`${d.label}: $${formatARS(d.value)}`}
                />
              );
            })}
          </div>
        </Card>

        <Card padding="lg">
          <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
            Pagos confirmados
          </p>
          <p className="text-3xl font-semibold tracking-[-0.025em] tabular-nums text-[var(--color-fg)] mt-2">
            {paidOrders ?? 0}
          </p>
          <p className="text-xs text-[var(--color-fg-muted)] mt-1 mb-5">
            órdenes completadas en total.
          </p>
          <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
            <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
              Acciones rápidas
            </p>
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center justify-between p-2.5 -mx-2.5 rounded-[var(--radius-sm)] text-xs text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" strokeWidth={1.6} />
                Crear producto
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/admin/productos"
              className="flex items-center justify-between p-2.5 -mx-2.5 rounded-[var(--radius-sm)] text-xs text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Upload className="h-3.5 w-3.5" strokeWidth={1.6} />
                Importar de warehouse
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/admin/modulos/calculadora"
              className="flex items-center justify-between p-2.5 -mx-2.5 rounded-[var(--radius-sm)] text-xs text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] transition-colors group"
            >
              <span className="flex items-center gap-2">
                <CalcIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
                Nueva cotización
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent orders + recent sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card padding="none" className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold">Órdenes recientes</h2>
            <Link
              href="/admin/ordenes"
              className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
            >
              Ver todas →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--color-fg-muted)]">
              No hay órdenes todavía.
            </div>
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
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-bg-subtle)]/50 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <Link href="/admin/ordenes" className="block min-w-0">
                          <p className="font-medium text-[var(--color-fg)] truncate text-[13px]">
                            {o.cliente_nombre || "—"}
                          </p>
                          <p className="text-[11px] text-[var(--color-fg-muted)] truncate">
                            {o.cliente_email}
                          </p>
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-medium text-[13px]">
                        ${formatARS(o.total_ars || 0)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <EstadoBadge estado={o.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold">Últimas ventas</h2>
          </div>
          {paidList.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--color-fg-muted)]">
              Sin ventas pagadas todavía.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {paidList.map((o) => (
                <li key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--color-fg)] truncate">
                      {o.cliente_nombre || "—"}
                    </p>
                    <p className="text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-fg-subtle)] mt-0.5">
                      {new Date(o.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p className="text-[13px] font-semibold tabular-nums text-[var(--color-fg)] flex-shrink-0">
                    ${formatARS(o.total_ars || 0)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
