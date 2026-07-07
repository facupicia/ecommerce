"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, Calculator, Calendar, Package, DollarSign, TrendingUp, Eye } from "lucide-react";
import { Cotizacion } from "@/lib/types";
import { fmtUSD, fmtARS, fmtPct } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { fetcher, fetcherDelete } from "@/lib/fetcher";
import { cn } from "@/lib/cn";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Fecha inválida";
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Fecha inválida";
  }
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Cotizacion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function fetchCotizaciones() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher<{ cotizaciones: Cotizacion[] }>("/api/cotizaciones");
      setCotizaciones(data.cotizaciones || []);
    } catch (err: any) {
      setError(err.info?.error || err.message || "Error al cargar las cotizaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  async function deleteCotizacion() {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await fetcherDelete(`/api/cotizaciones/${confirmDeleteId}`);
      setCotizaciones((prev) => prev.filter((c) => c.id !== confirmDeleteId));
      if (selected?.id === confirmDeleteId) setSelected(null);
      toast.success("Cotización eliminada");
      setConfirmDeleteId(null);
    } catch (err: any) {
      toast.error("No se pudo eliminar", { description: err.info?.error || err.message });
    } finally {
      setDeletingId(null);
    }
  }

  function loadIntoCalculator(cot: Cotizacion) {
    if (!confirm(`¿Cargar "${cot.nombre}" en la calculadora? Se reemplazará el trabajo actual.`)) return;
    localStorage.setItem("cssbuy-cotizacion-cargar", JSON.stringify(cot));
    toast.info("Cotización cargada. Redirigiendo...");
    setTimeout(() => {
      window.location.href = "/admin/modulos/calculadora";
    }, 500);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cotizaciones guardadas"
        description={`${cotizaciones.length} guardada${cotizaciones.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/admin/modulos/calculadora">
            <Button variant="primary" icon={<Calculator className="h-3.5 w-3.5" />}>
              Calculadora
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 rounded-[var(--radius)] text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : cotizaciones.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<Calculator className="h-10 w-10" strokeWidth={1.2} />}
            title="No hay cotizaciones guardadas"
            description="Andá a la calculadora, cargá productos y guardá la cotización."
            action={
              <Link href="/admin/modulos/calculadora">
                <Button variant="primary" icon={<Calculator className="h-3.5 w-3.5" />}>
                  Ir a la calculadora
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-3">
            {cotizaciones.map((cot) => (
              <button
                key={cot.id}
                onClick={() => setSelected(cot)}
                className={cn(
                  "block w-full text-left rounded-[var(--radius-lg)] border p-4 transition-colors",
                  selected?.id === cot.id
                    ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30 bg-[var(--color-bg-elevated)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-accent-border)]"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium text-[var(--color-fg)] truncate">{cot.nombre}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-fg-muted)] mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(cot.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {cot.productos.length} producto{cot.productos.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {fmtUSD(cot.resultados.costoTotalUSD)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadIntoCalculator(cot);
                      }}
                      className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
                      title="Cargar en calculadora"
                    >
                      <Calculator className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(cot.id);
                      }}
                      disabled={deletingId === cot.id}
                      className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-fg-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === cot.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <Stat label="Costo puesto" value={fmtUSD(cot.resultados.costoTotalUSD)} />
                  <Stat label="Ingreso" value={fmtUSD(cot.resultados.ingresoTotalUSD)} />
                  <Stat
                    label="Ganancia"
                    value={fmtUSD(cot.resultados.gananciaTotalUSD)}
                    tone={cot.resultados.gananciaTotalUSD >= 0 ? "positive" : "negative"}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-20">
              {selected ? (
                <Card padding="lg" className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-[var(--color-fg)]">{selected.nombre}</h3>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-1">{formatDate(selected.fecha)}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Productos" value={`${selected.productos.length}`} />
                    <Row label="Peso total" value={`${selected.resultados.pesoTotalG} g`} />
                    <Row label="Dólar blue" value={`$${selected.fx.blue.toLocaleString("es-AR")}`} />
                    <Row label="CNY/USD" value={`${selected.fx.cny}`} />
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border)] space-y-2 text-sm">
                    <Row label="Costo del paquete" value={fmtUSD(selected.resultados.costoPaqueteUSD)} />
                    <Row label="Impuestos" value={fmtUSD(selected.resultados.impuestosUSD)} />
                    <Row label="Costo final puesto" value={fmtUSD(selected.resultados.costoTotalUSD)} bold />
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border)] space-y-2 text-sm">
                    <Row label="Ingreso total" value={fmtUSD(selected.resultados.ingresoTotalUSD)} />
                    <Row
                      label="Ganancia neta"
                      value={fmtUSD(selected.resultados.gananciaTotalUSD)}
                      valueClass={selected.resultados.gananciaTotalUSD >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}
                    />
                    <Row label="Margen" value={fmtPct(selected.resultados.margenTotalPct)} />
                  </div>

                  <Button
                    fullWidth
                    variant="primary"
                    icon={<Calculator className="h-3.5 w-3.5" />}
                    onClick={() => loadIntoCalculator(selected)}
                  >
                    Cargar en calculadora
                  </Button>
                </Card>
              ) : (
                <Card padding="lg">
                  <EmptyState
                    icon={<Eye className="h-8 w-8" strokeWidth={1.2} />}
                    title="Seleccioná una cotización"
                    description="Hacé click en una cotización de la lista para ver el detalle."
                  />
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => !o && setConfirmDeleteId(null)}
        title="Eliminar cotización"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={deleteCotizacion}
      />
    </div>
  );
}

function Row({ label, value, bold, valueClass }: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-fg-muted)]">{label}</span>
      <span className={`tabular-nums ${bold ? "font-bold text-[var(--color-fg)]" : ""} ${valueClass || ""}`}>{value}</span>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] p-2",
        tone === "positive" && "bg-[var(--color-success-soft)]",
        tone === "negative" && "bg-[var(--color-danger-soft)]",
        !tone && "bg-[var(--color-bg-subtle)]"
      )}
    >
      <p className="text-[10px] text-[var(--color-fg-muted)]">{label}</p>
      <p
        className={cn(
          "font-medium tabular-nums text-[12px]",
          tone === "positive" && "text-[var(--color-success)]",
          tone === "negative" && "text-[var(--color-danger)]"
        )}
      >
        {value}
      </p>
    </div>
  );
}
