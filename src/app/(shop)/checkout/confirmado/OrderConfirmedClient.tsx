"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Props {
  paymentId: string;
  orderId: string;
  initialStatus: string;
}

type OrderState = {
  estado: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "unknown";
  mp_status?: string;
  reconciled?: boolean;
};

export default function OrderConfirmedClient({
  paymentId,
  orderId,
  initialStatus,
}: Props) {
  const initialEstado: OrderState["estado"] =
    initialStatus === "approved" || !initialStatus
      ? "pending"
      : (initialStatus as OrderState["estado"]);

  const [state, setState] = useState<OrderState>({
    estado: initialEstado,
  });
  const [reconciling, setReconciling] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!orderId) {
      // Marcar como fallido en un microtask para evitar setState síncrono en effect.
      const t = setTimeout(() => {
        setReconciling(false);
        setFailed(true);
      }, 0);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    async function reconcile() {
      try {
        const url = new URL(`/api/orders/status/${orderId}`, window.location.origin);
        if (paymentId) url.searchParams.set("payment_id", paymentId);
        const res = await fetch(url.toString(), { method: "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        setState({
          estado: data.estado,
          mp_status: data.mp_status,
          reconciled: data.reconciled,
        });

        if (data.estado && data.estado !== "pending") {
          setReconciling(false);
          return true;
        }
        return false;
      } catch (err) {
        console.error("[confirmado] Error reconciliando:", err);
        if (cancelled) return false;
        attempts++;
        if (attempts >= maxAttempts) {
          setReconciling(false);
          setFailed(true);
        }
        return false;
      }
    }

    async function poll() {
      const settled = await reconcile();
      if (settled || cancelled) return;
      const interval = setInterval(async () => {
        if (cancelled) return clearInterval(interval);
        const ok = await reconcile();
        if (ok) clearInterval(interval);
      }, 2500);
      // Auto-stop después de 30s para no pegarle a la API indefinidamente.
      setTimeout(() => {
        clearInterval(interval);
        if (!cancelled) {
          setReconciling((r) => {
            if (r) setFailed(true);
            return false;
          });
        }
      }, 30000);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentId]);

  const isApproved = state.estado === "paid";
  const isPending =
    reconciling || (!isApproved && state.estado === "pending" && !failed);
  const isRejected = state.estado === "cancelled";

  const title = isApproved
    ? "¡Pago aprobado!"
    : isPending
      ? "Confirmando tu pago..."
      : isRejected
        ? "Pago no procesado"
        : "Pago en proceso";

  const message = isApproved
    ? "Tu pago se procesó con éxito. Te enviamos un email con el detalle. Comenzaremos a preparar tu pedido pronto."
    : isPending
      ? "Estamos confirmando tu pago con Mercado Pago. Esto puede tardar unos segundos."
      : isRejected
        ? "No pudimos completar tu pago. Podés intentar nuevamente o contactarnos si el problema persiste."
        : "Mercado Pago está procesando tu pago. Te avisaremos por email cuando se confirme.";

  const iconColor = isApproved
    ? "text-emerald-500"
    : isPending
      ? "text-amber-500"
      : isRejected
        ? "text-red-500"
        : "text-amber-500";

  const iconPath = isApproved
    ? "M5 13l4 4L19 7"
    : isPending
      ? "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      : isRejected
        ? "M6 18L18 6M6 6l12 12"
        : "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z";

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 border ${
          isApproved
            ? "border-emerald-500"
            : isPending
              ? "border-amber-500"
              : isRejected
                ? "border-red-500"
                : "border-[#1a1a1a]"
        } mb-6`}
      >
        {isPending ? (
          <Loader2 className={`w-8 h-8 ${iconColor} animate-spin`} />
        ) : (
          <svg
            className={`w-8 h-8 ${iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={iconPath}
            />
          </svg>
        )}
      </div>

      <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-3">
        {title}
      </h1>
      <p className="text-[14px] text-[var(--plug-gray)] mb-4 max-w-md mx-auto">
        {message}
      </p>

      {state.reconciled && (
        <p className="text-[11px] text-emerald-600 mb-4">
          Tu pago se confirmó correctamente.
        </p>
      )}

      <div className="space-y-1 mb-8">
        {paymentId && (
          <p className="text-[12px] text-neutral-400 font-mono">
            ID de Pago: {paymentId}
          </p>
        )}
        {orderId && (
          <p className="text-[12px] text-neutral-400 font-mono">
            ID de Pedido: {orderId}
          </p>
        )}
      </div>

      <p className="text-[12px] text-[var(--plug-gray)] mb-8">
        Si tenés alguna duda, escribinos a hola@theplug.com.ar
      </p>

      <Link href="/" className="plug-btn">
        Volver a la tienda
      </Link>
    </div>
  );
}
