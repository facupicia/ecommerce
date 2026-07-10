"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import useSWR from "swr";
import { fetcher, fetcherPatch } from "@/lib/fetcher";
import type { ShopEncargo, ShopEncargoStatusHistory, ShopEncargoPayment } from "@/lib/types";
import { ENCARGO_ESTADO_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

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

interface EncargoDetail extends ShopEncargo {
  historial: ShopEncargoStatusHistory[];
  pagos: ShopEncargoPayment[];
}

export default function EncargoDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, mutate } = useSWR<{
    encargo: EncargoDetail;
  }>(user ? `/api/encargos/${id}` : null, fetcher);

  const encargo = data?.encargo;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/cuenta/auth");
    }
  }, [user, loading, router]);

  async function handleAction(action: string) {
    try {
      await fetcherPatch(`/api/encargos/${id}`, { action });
      toast.success("Acción realizada");
      mutate();
    } catch (e: any) {
      toast.error("Error", {
        description: e.info?.error || e.message,
      });
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!encargo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <EmptyStateCard />
      </div>
    );
  }

  const needsPayment =
    encargo.estado === "pendiente" &&
    Number(encargo.sena_pagada) === 0 &&
    Number(encargo.precio_total) > 0;

  const canCancel = !["entregado", "cancelado"].includes(encargo.estado);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/cuenta/encargos"
          className="p-1.5 hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">
            Encargo #{encargo.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {new Date(encargo.created_at).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Estado */}
      <Card padding="md" className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-fg-muted)] mb-1">Estado</p>
            <Badge
              variant={(ESTADO_BADGE_MAP[encargo.estado] as any) || "neutral"}
              dot
              size="md"
            >
              {ENCARGO_ESTADO_LABELS[encargo.estado]}
            </Badge>
          </div>
          {encargo.tipo === "personalizado" && (
            <Badge variant="neutral">
              Personalizado
            </Badge>
          )}
          {encargo.tipo === "catalogo" && (
            <Badge variant="neutral">
              Catálogo
            </Badge>
          )}
        </div>
      </Card>

      {/* Detalle del producto */}
      <Card padding="md" className="mb-4">
        <h2 className="font-semibold mb-3">Detalle del producto</h2>

        <div className="space-y-3">
          {encargo.imagen_url && (
            <div className="w-full max-w-xs rounded-lg overflow-hidden border border-[var(--color-border)]">
              <CloudinaryImage
                src={encargo.imagen_url}
                alt="Imagen del encargo"
                width={320}
                height={320}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--color-fg-muted)]">Categoría</p>
              <p className="font-medium">{encargo.categoria}</p>
            </div>
            <div>
              <p className="text-[var(--color-fg-muted)]">Talle</p>
              <p className="font-medium">{encargo.talle}</p>
            </div>
            <div>
              <p className="text-[var(--color-fg-muted)]">Cantidad</p>
              <p className="font-medium">{encargo.cantidad}</p>
            </div>
            {Number(encargo.precio_total) > 0 && (
              <div>
                <p className="text-[var(--color-fg-muted)]">Precio total</p>
                <p className="font-semibold">
                  {formatARS(Number(encargo.precio_total))}
                </p>
              </div>
            )}
          </div>

          {encargo.descripcion && (
            <div>
              <p className="text-sm text-[var(--color-fg-muted)] mb-1">
                Descripción
              </p>
              <p className="text-sm">{encargo.descripcion}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Presupuesto (caso personalizado) */}
      {encargo.tipo === "personalizado" &&
        encargo.presupuesto_enviado &&
        encargo.estado === "pendiente_presupuesto" && (
          <Card padding="md" className="mb-4 border-[var(--color-info)]/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Presupuesto disponible</h3>
                <p className="text-sm text-[var(--color-fg-muted)] mb-3">
                  Total:{" "}
                  <span className="font-semibold text-[var(--color-fg)]">
                    {formatARS(Number(encargo.precio_total))}
                  </span>{" "}
                  — Seña (50%):{" "}
                  <span className="font-semibold text-[var(--color-fg)]">
                    {formatARS(Number(encargo.precio_total) * 0.5)}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAction("aceptar_presupuesto")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Aceptar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction("rechazar_presupuesto")}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

      {/* Pago pendiente */}
      {needsPayment && (
        <Card padding="md" className="mb-4 border-[var(--color-warning)]/30">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Pago pendiente</h3>
              <p className="text-sm text-[var(--color-fg-muted)] mb-3">
                Seña:{" "}
                <span className="font-semibold text-[var(--color-fg)]">
                  {formatARS(Number(encargo.precio_total) * 0.5)}
                </span>
              </p>
              <Link href={`/encargos/${encargo.id}/pago`}>
                <Button size="sm">Pagar seña</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Historial */}
      <Card padding="md" className="mb-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Historial
        </h2>

        <div className="space-y-0">
          {encargo.historial.map((h, i) => (
            <div
              key={h.id}
              className="flex gap-3 pb-3 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                    i === encargo.historial.length - 1
                      ? "bg-[var(--color-fg)]"
                      : "bg-[var(--color-border)]"
                  }`}
                />
                {i < encargo.historial.length - 1 && (
                  <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-sm font-medium">
                  {ENCARGO_ESTADO_LABELS[h.estado_nuevo as keyof typeof ENCARGO_ESTADO_LABELS] || h.estado_nuevo}
                </p>
                {h.notas && (
                  <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
                    {h.notas}
                  </p>
                )}
                <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">
                  {new Date(h.created_at).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cancelar */}
      {canCancel && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("cancelar")}
            className="text-[var(--color-danger)] hover:text-[var(--color-danger)]"
          >
            Cancelar encargo
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyStateCard() {
  return (
    <Card padding="lg" className="text-center">
      <p className="text-[var(--color-fg-muted)]">Encargo no encontrado</p>
      <Link href="/cuenta/encargos" className="mt-3 inline-block">
        <Button variant="ghost" size="sm">
          Volver a encargos
        </Button>
      </Link>
    </Card>
  );
}
