"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Loader2, Calculator, Calendar, Package, DollarSign, TrendingUp, Eye } from "lucide-react";
import { Cotizacion } from "@/lib/types";
import { fmtUSD, fmtARS, fmtPct } from "@/lib/utils";

const COTIZACIONES_KEY = "cssbuy-cotizaciones";

function loadCotizaciones(): Cotizacion[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COTIZACIONES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCotizaciones(items: Cotizacion[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COTIZACIONES_KEY, JSON.stringify(items));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cotizacion | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCotizaciones(loadCotizaciones());
    setLoading(false);
  }, []);

  function deleteCotizacion(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    const updated = cotizaciones.filter((c) => c.id !== id);
    setCotizaciones(updated);
    saveCotizaciones(updated);
    if (selected?.id === id) setSelected(null);
  }

  function clearAll() {
    if (!confirm("¿Eliminar TODAS las cotizaciones guardadas?")) return;
    setCotizaciones([]);
    saveCotizaciones([]);
    setSelected(null);
  }

  function loadIntoCalculator(cot: Cotizacion) {
    if (!confirm(`¿Cargar "${cot.nombre}" en la calculadora? Se reemplazará el trabajo actual.`)) return;
    // Guardar la cotización como "current" para que la calculadora la cargue al volver
    localStorage.setItem("cssbuy-cotizacion-cargar", JSON.stringify(cot));
    router.push("/admin/modulos/calculadora");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/modulos/calculadora"
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" />
              Cotizaciones guardadas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cotizaciones.length} guardada{cotizaciones.length !== 1 ? "s" : ""} en este navegador
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cotizaciones.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </button>
          )}
          <Link
            href="/admin/modulos/calculadora"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Calculadora
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : cotizaciones.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Calculator className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-sm mt-4">No hay cotizaciones guardadas.</p>
          <Link
            href="/admin/modulos/calculadora"
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
          >
            Ir a la calculadora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* List */}
          <div className="xl:col-span-2 space-y-3">
            {cotizaciones.map((cot) => (
              <div
                key={cot.id}
                onClick={() => setSelected(cot)}
                className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${
                  selected?.id === cot.id
                    ? "border-primary ring-1 ring-primary/50"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{cot.nombre}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(cot.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {cot.productos.length} producto{cot.productos.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
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
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Cargar en calculadora"
                    >
                      <Calculator className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCotizacion(cot.id);
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Costo puesto</p>
                    <p className="font-medium tabular-nums">{fmtUSD(cot.resultados.costoTotalUSD)}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Ingreso</p>
                    <p className="font-medium tabular-nums">{fmtUSD(cot.resultados.ingresoTotalUSD)}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${cot.resultados.gananciaTotalUSD >= 0 ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
                    <p className="text-muted-foreground">Ganancia</p>
                    <p className={`font-medium tabular-nums ${cot.resultados.gananciaTotalUSD >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                      {fmtUSD(cot.resultados.gananciaTotalUSD)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="xl:col-span-1">
            <div className="sticky top-20">
              {selected ? (
                <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                  <div>
                    <h3 className="font-semibold text-foreground">{selected.nombre}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(selected.fecha)}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Productos" value={`${selected.productos.length}`} />
                    <Row label="Peso total" value={`${selected.resultados.pesoTotalG} g`} />
                    <Row label="Dólar blue" value={`$${selected.fx.blue.toLocaleString("es-AR")}`} />
                    <Row label="CNY/USD" value={`${selected.fx.cny}`} />
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-sm">
                    <Row label="Costo del paquete" value={fmtUSD(selected.resultados.costoPaqueteUSD)} />
                    <Row label="Impuestos" value={fmtUSD(selected.resultados.impuestosUSD)} />
                    <Row label="Costo final puesto" value={fmtUSD(selected.resultados.costoTotalUSD)} bold />
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-sm">
                    <Row label="Ingreso total" value={fmtUSD(selected.resultados.ingresoTotalUSD)} />
                    <Row label="Ganancia neta" value={fmtUSD(selected.resultados.gananciaTotalUSD)} valueClass={selected.resultados.gananciaTotalUSD >= 0 ? "text-emerald-400" : "text-destructive"} />
                    <Row label="Margen" value={fmtPct(selected.resultados.margenTotalPct)} />
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Productos</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selected.resultados.productosCalc.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs bg-secondary/30 rounded-lg p-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.nombre || "Sin nombre"}</p>
                            <p className="text-muted-foreground">{p.cantidad} × ${p.precioCNY} ¥</p>
                          </div>
                          <div className="text-right tabular-nums">
                            <p>{fmtUSD(p.ventaUSD / p.cantidad)}</p>
                            <p className="text-muted-foreground">{fmtARS(p.ventaUnitARS)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => loadIntoCalculator(selected)}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    Cargar en calculadora
                  </button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Seleccioná una cotización para ver el detalle.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, valueClass }: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${bold ? "font-bold text-foreground" : ""} ${valueClass || ""}`}>{value}</span>
    </div>
  );
}
