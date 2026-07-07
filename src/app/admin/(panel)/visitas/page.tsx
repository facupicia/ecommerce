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
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

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

  const uniqueVisitors7d = new Set(ipHashes.map((r) => r.ip_hash).filter(Boolean))
    .size;

  const pathCounts = new Map<string, number>();
  for (const row of last7Rows) {
    const p = row.path || "/";
    pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
  }
  const topPaths = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const stats = [
    { label: "Visitas totales", value: totalCount ?? 0, icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Visitas hoy", value: todayCount ?? 0, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Visitantes únicos (7d)", value: uniqueVisitors7d, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Páginas vistas (7d)", value: last7Rows.length, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitas"
        description="Tráfico de la tienda pública (excluye /admin y /api)."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            size="sm"
            icon={<stat.icon className="h-4 w-4" strokeWidth={1.6} />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader className="border-0 pb-0 mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                Últimos 7 días
              </p>
              <CardTitle>Visitas por día</CardTitle>
            </div>
            <div className="p-2 rounded-[var(--radius)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Activity className="h-4 w-4" strokeWidth={1.6} />
            </div>
          </CardHeader>
          <div className="flex items-end gap-2 h-44">
            {weekSeries.map((d) => {
              const heightPct = Math.round((d.visits / maxDay) * 100);
              return (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center gap-2 min-w-0"
                >
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] text-[var(--color-fg-muted)] tabular-nums mb-1">
                      {d.visits}
                    </span>
                    <div
                      className="w-full bg-[var(--color-accent)] rounded-t-md min-h-[4px] transition-all hover:opacity-80"
                      style={{ height: `${heightPct}%` }}
                      title={`${d.label}: ${d.visits} visitas`}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--color-fg-muted)] truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader className="border-0 pb-0 mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                Rutas más vistas
              </p>
              <CardTitle>Top (7d)</CardTitle>
            </div>
            <div className="p-2 rounded-[var(--radius)] bg-[var(--color-info-soft)] text-[var(--color-info)]">
              <Globe2 className="h-4 w-4" strokeWidth={1.6} />
            </div>
          </CardHeader>
          {topPaths.length === 0 ? (
            <p className="text-sm text-[var(--color-fg-muted)]">
              Sin datos en los últimos 7 días.
            </p>
          ) : (
            <ul className="space-y-2">
              {topPaths.map(([path, count]) => (
                <li
                  key={path}
                  className="flex items-center justify-between text-sm gap-3"
                >
                  <span className="truncate text-[var(--color-fg)] font-mono text-xs" title={path}>
                    {path}
                  </span>
                  <span className="text-[var(--color-fg-muted)] tabular-nums flex-shrink-0 text-xs">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <CardTitle>Últimas 100 visitas</CardTitle>
        </div>

        {recentRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-fg-muted)]">
            Todavía no se registraron visitas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th scope="col" className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">Cuándo</th>
                  <th scope="col" className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">Ruta</th>
                  <th scope="col" className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">Origen</th>
                  <th scope="col" className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">Navegador / OS</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => {
                  const ua = row.user_agent || "";
                  const { browser, os } = parseUserAgent(ua);
                  return (
                    <tr key={row.id} className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4 text-[11px] text-[var(--color-fg-muted)] tabular-nums whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString("es-AR")}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[var(--color-fg)] font-mono text-xs">{row.path}</span>
                      </td>
                      <td className="py-2.5 px-4 text-[var(--color-fg-muted)] max-w-[260px]">
                        <span className="truncate inline-block max-w-full align-middle text-xs">
                          {cleanReferrer(row.referrer) || ARROW_URL + " directo"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-[var(--color-fg-muted)] whitespace-nowrap">
                        {browser} <span className="opacity-50">·</span> {os}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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
