"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast";
import { CreditCard, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ShopEncargo } from "@/lib/types";

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default function PagoEncargoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [encargo, setEncargo] = useState<ShopEncargo | null>(null);
  const [loadingEncargo, setLoadingEncargo] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/cuenta/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      fetcher<{ encargo: ShopEncargo }>(`/api/encargos/${id}`)
        .then((data) => setEncargo(data.encargo))
        .catch(() => toast.error("Error cargando encargo"))
        .finally(() => setLoadingEncargo(false));
    }
  }, [user, id]);

  async function handlePay(tipo: "sena" | "resto") {
    setPaying(true);
    try {
      const res = await fetch(`/api/encargos/${id}/pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Error", { description: data.error });
        return;
      }

      if (data.mp_init_point) {
        window.location.href = data.mp_init_point;
      }
    } catch {
      toast.error("Error al generar el pago");
    } finally {
      setPaying(false);
    }
  }

  if (loading || !user || loadingEncargo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!encargo) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Card padding="lg" className="text-center">
          <p className="text-[var(--color-fg-muted)]">Encargo no encontrado</p>
          <Link href="/cuenta/encargos" className="mt-3 inline-block">
            <Button variant="ghost" size="sm">
              Volver
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const precioTotal = Number(encargo.precio_total);
  const senaPagada = Number(encargo.sena_pagada);
  const montoSena = precioTotal * 0.5;
  const montoRestante = precioTotal - senaPagada;

  const canPaySena = encargo.estado === "pendiente" && senaPagada === 0;
  const canPayResto = encargo.estado === "listo" && montoRestante > 0;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/cuenta/encargos/${id}`}
          className="p-1.5 hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Pagar encargo</h1>
      </div>

      <Card padding="md" className="mb-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-fg-muted)]">Encargo</span>
            <span className="font-mono">#{encargo.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-fg-muted)]">Total</span>
            <span className="font-semibold">{formatARS(precioTotal)}</span>
          </div>
          <div className="border-t border-[var(--color-border)] pt-2" />
          <div className="flex justify-between">
            <span className="text-[var(--color-fg-muted)]">Seña (50%)</span>
            <span>{formatARS(montoSena)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-fg-muted)]">Ya pagado</span>
            <span>{formatARS(senaPagada)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Restante</span>
            <span>{formatARS(montoRestante)}</span>
          </div>
        </div>
      </Card>

      {canPaySena && (
        <Button
          onClick={() => handlePay("sena")}
          className="w-full"
          disabled={paying}
        >
          {paying ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Generando link...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar seña ({formatARS(montoSena)})
            </>
          )}
        </Button>
      )}

      {canPayResto && (
        <Button
          onClick={() => handlePay("resto")}
          className="w-full"
          disabled={paying}
        >
          {paying ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Generando link...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar restante ({formatARS(montoRestante)})
            </>
          )}
        </Button>
      )}

      {!canPaySena && !canPayResto && (
        <Card padding="md" className="text-center">
          <p className="text-sm text-[var(--color-fg-muted)]">
            {encargo.estado === "confirmado"
              ? "La seña ya fue pagada. Esperando preparación del pedido."
              : encargo.estado === "entregado"
                ? "Este encargo ya fue entregado."
                : encargo.estado === "cancelado"
                  ? "Este encargo fue cancelado."
                  : "No hay pagos pendientes en este momento."}
          </p>
        </Card>
      )}

      <div className="mt-4 text-center">
        <Link
          href={`/cuenta/encargos/${id}`}
          className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          Volver al detalle del encargo
        </Link>
      </div>
    </div>
  );
}
