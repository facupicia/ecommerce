import { supabaseAdmin } from "@/lib/supabase";
import { ShopOrder } from "@/lib/types";
import {
  Package,
  ShoppingCart,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["paid", "shipped", "delivered"] as const;

export default async function AdminDashboardPage() {
  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: paidOrders },
    { data: recentOrders },
    { data: paidOrdersData },
  ] = await Promise.all([
    supabaseAdmin
      .from("shop_products")
      .select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("shop_orders")
      .select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("shop_orders")
      .select("*", { count: "exact", head: true })
      .eq("estado", "pending"),
    supabaseAdmin
      .from("shop_orders")
      .select("*", { count: "exact", head: true })
      .in("estado", PAID_STATUSES as unknown as string[]),
    supabaseAdmin
      .from("shop_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("shop_orders")
      .select("total_ars, estado, created_at, cliente_nombre")
      .in("estado", PAID_STATUSES as unknown as string[])
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const orders = (recentOrders || []) as ShopOrder[];
  const paidOrdersList = (paidOrdersData || []) as ShopOrder[];

  const totalRevenue = paidOrdersList.reduce(
    (sum, o) => sum + (o.total_ars || 0),
    0
  );

  const conversionRate =
    totalOrders && Number(totalOrders) > 0
      ? Math.round((Number(paidOrders || 0) / Number(totalOrders)) * 100)
      : 0;

  const stats = [
    {
      label: "Productos",
      value: totalProducts ?? 0,
      icon: Package,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Órdenes totales",
      value: totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pendientes",
      value: pendingOrders ?? 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Pagadas",
      value: paidOrders ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de la tienda
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-2.5 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Ingresos confirmados
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                ${totalRevenue.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Suma de órdenes pagadas, enviadas y entregadas.
              </p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Tasa de conversión
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {conversionRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Órdenes pagadas sobre el total.
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-semibold">Órdenes recientes</h2>
            <Link
              href="/admin/ordenes"
              className="text-xs text-primary hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No hay órdenes todavía.
            </div>
          ) : (
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
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {order.items?.length || 0} items
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-medium">
                        ${(order.total_ars || 0).toLocaleString("es-AR")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <EstadoBadge estado={order.estado} />
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-muted-foreground tabular-nums">
                        {new Date(order.created_at).toLocaleDateString("es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent paid orders */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-sm font-semibold">Últimas ventas pagadas</h2>
          </div>

          {paidOrdersList.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No hay ventas pagadas todavía.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {paidOrdersList.map((order, idx) => (
                <div key={order.id ?? `paid-order-${idx}-${order.created_at ?? ""}`} className="p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {order.cliente_nombre || "—"}
                    </p>
                    <span className="text-sm font-semibold tabular-nums">
                      ${(order.total_ars || 0).toLocaleString("es-AR")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    delivered: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const labels: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return (
    <span
      className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${
        styles[estado] || "bg-secondary/50 text-muted-foreground border-border"
      }`}
    >
      {labels[estado] || estado}
    </span>
  );
}
