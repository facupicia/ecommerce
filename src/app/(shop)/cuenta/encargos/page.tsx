"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { ShopEncargo, EncargoEstado } from "@/lib/types";
import { ENCARGO_ESTADO_LABELS } from "@/lib/types";
import { Badge, EstadoBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBag, Plus, Eye, Clock } from "lucide-react";
import Link from "next/link";

const ESTADOS_FILTER = [
  "",
  "pendiente_presupuesto",
  "pendiente",
  "confirmado",
  "en_camino",
  "listo",
  "entregado",
  "cancelado",
] as const;

const ESTADO_BADGE_MAP: Record<string, string> = {
  pendiente_presupuesto: "info",
  pendiente: "pending",
  confirmado: "paid",
  en_camino: "shipped",
  listo: "delivered",
  entregado: "success",
  cancelado: "cancelled",
};

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default function EncargosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [estado, setEstado] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/cuenta/auth");
    }
  }, [user, loading, router]);

  const qs = new URLSearchParams();
  if (estado) qs.set("estado", estado);
  qs.set("limit", "50");

  const { data, isLoading } = useSWR<{
    encargos: ShopEncargo[];
    pagination: { total: number };
  }>(user ? `/api/encargos?${qs.toString()}` : null, fetcher);

  const encargos = data?.encargos ?? [];

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mis encargos</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {data?.pagination.total || 0} encargo
            {(data?.pagination.total || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/encargos/nuevo">
          <Button icon={<Plus className="h-4 w-4" />}>Nuevo encargo</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {ESTADOS_FILTER.map((e) => (
          <button
            key={e}
            onClick={() => setEstado(e)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              estado === e
                ? "bg-[var(--color-fg)] text-[var(--color-fg-inverse)]"
                : "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            }`}
          >
            {e ? ENCARGO_ESTADO_LABELS[e as EncargoEstado] : "Todos"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : encargos.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" strokeWidth={1.2} />}
          title="No tenés encargos"
          description="Hacé tu primer encargo desde el catálogo o subí una foto de lo que buscás."
          action={
            <Link href="/encargos/nuevo">
              <Button>Hacer encargo</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {encargos.map((encargo) => (
            <Link key={encargo.id} href={`/cuenta/encargos/${encargo.id}`}>
              <Card
                padding="md"
                className="hover:border-[var(--color-border-focus)] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-[var(--color-fg-muted)]">
                        #{encargo.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge variant={(ESTADO_BADGE_MAP[encargo.estado] as any) || "neutral"} dot size="sm">
                        {ENCARGO_ESTADO_LABELS[encargo.estado]}
                      </Badge>
                    </div>

                    <p className="font-medium text-sm truncate">
                      {encargo.categoria} — Talle {encargo.talle}
                    </p>

                    {encargo.descripcion && (
                      <p className="text-xs text-[var(--color-fg-muted)] mt-1 truncate">
                        {encargo.descripcion}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-fg-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(encargo.created_at).toLocaleDateString(
                          "es-AR",
                          { day: "2-digit", month: "short" }
                        )}
                      </span>
                      <span>x{encargo.cantidad}</span>
                      {Number(encargo.precio_total) > 0 && (
                        <span className="font-semibold text-[var(--color-fg)]">
                          {formatARS(Number(encargo.precio_total))}
                        </span>
                      )}
                    </div>
                  </div>

                  <Eye className="h-4 w-4 text-[var(--color-fg-subtle)] flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
