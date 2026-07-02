import { supabaseAdmin } from "@/lib/supabase";
import { parseUserAgent } from "@/lib/user-agent";
import {
  Eye,
  Users,
  TrendingUp,
  Globe2,
  Clock,
  Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface VisitRow {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

const ARROW_URL = "→";

function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function formatDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AdminVisitsPage() {
  const now = new Date();
  const today = startOfDay(now);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const [
    { count: totalCount },
    { count: todayCount },
    { data: last7 },
    { data: recent },
    { data: recentByIp },
  ] = await Promise.all([
    supabaseAdmin
      .from("shop_visits")
      .select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("shop_visits")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    supabaseAdmin
      .from("shop_visits")
      .select("created_at, ip_hash, path")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("shop_visits")
      .select("id, path, referrer, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("shop_visits")
      .select("ip_hash")
      .gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  const last7Rows =
    (last7 as { created_at: string; ip_hash: string | null; path: string }[] | null) ||
    [];
  const recentRows = (recent as VisitRow[] | null) || [];
  const ipHashes =
    (recentByIp as { ip_hash: string | null }[] | null) || [];

  // Serie últimos 7 días con visitas + visitantes únicos
  const dayMap = new Map<string, { visits: number; unique: Set<string> }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    dayMap.set(formatDayKey(d), { visits: 0, unique: new Set() });
  }
  for (const row of last7Rows) {
    const key = formatDayKey(new Date(row.created_at));
    const bucket = dayMap.get(key);
    if (bucket) {
      bucket.visits += 1;
      if (row.ip_hash) bucket.unique.add(row.ip_hash);
    }
  }

  const weekSeries = Array.from(dayMap.entries()).map(([key, v]) => ({
    key,
    label: new Date(key + "T00:00:00Z").toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
    }),
    visits: v.visits,
    unique: v.unique.size,
  }));
  const maxDay = Math.max(1, ...weekSeries.map((d) => d.visits));

  // Visitantes únicos en los últimos 7 días
  const uniqueVisitors7d = new Set(ipHashes.map((r) => r.ip_hash).filter(Boolean))
    .size;

  // Top paths últimas 7 días
  const pathCounts = new Map<string, number>();
  for (const row of last7Rows) {
    const p = row.path || "/";
    pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
  }
  const topPaths = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const stats = [
    {
      label: "Visitas totales",
      value: totalCount ?? 0,
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Visitas hoy",
      value: todayCount ?? 0,
      icon: Clock,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Visitantes únicos (7d)",
      value: uniqueVisitors7d,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Páginas vistas (7d)",
      value: last7Rows.length,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visitas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tráfico de la tienda pública (excluye /admin y /api).
        </p>
      </div>

      {/* Stats */}
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

      {/* Chart + top paths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Últimos 7 días
              </p>
              <p className="text-lg font-semibold text-foreground">
                Visitas por día
              </p>
            </div>
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="flex items-end gap-2 h-44">
            {weekSeries.map((d) => {
              const heightPct = Math.round((d.visits / maxDay) * 100);
              return (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center gap-2 min-w-0"
                >
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] text-muted-foreground tabular-nums mb-1">
                      {d.visits}
                    </span>
                    <div
                      className="w-full bg-primary/80 rounded-t-md min-h-[4px] transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Rutas más vistas
              </p>
              <p className="text-lg font-semibold text-foreground">Top (7d)</p>
            </div>
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Globe2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {topPaths.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin datos en los últimos 7 días.
            </p>
          ) : (
            <ul className="space-y-2">
              {topPaths.map(([path, count]) => (
                <li
                  key={path}
                  className="flex items-center justify-between text-sm gap-3"
                >
                  <span
                    className="truncate text-foreground"
                    title={path}
                  >
                    {path}
                  </span>
                  <span className="text-muted-foreground tabular-nums flex-shrink-0">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent visits table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold">Últimas 100 visitas</h2>
        </div>

        {recentRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Todavía no se registraron visitas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cuándo
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Navegador / OS
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => {
                  const ua = row.user_agent || "";
                  const { browser, os } = parseUserAgent(ua);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString("es-AR")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-foreground font-medium">
                          {row.path}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-[260px]">
                        <span className="truncate inline-block max-w-full align-middle">
                          {cleanReferrer(row.referrer) || ARROW_URL + " directo"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {browser} <span className="opacity-50">·</span> {os}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function cleanReferrer(referrer: string | null): string {
  if (!referrer) return "";
  try {
    const url = new URL(referrer);
    return url.host.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 60);
  }
}
