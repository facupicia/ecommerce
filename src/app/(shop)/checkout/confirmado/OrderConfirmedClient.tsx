"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Props {
  paymentId: string;
  orderId: string;
  initialStatus: string;
  paymentMethod: string;
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
  paymentMethod,
}: Props) {
  const isTransferencia = paymentMethod === "transferencia";
  const initialEstado: OrderState["estado"] =
    initialStatus === "approved" || !initialStatus
      ? "pending"
      : (initialStatus as OrderState["estado"]);

  const [state, setState] = useState<OrderState>({
    estado: initialEstado,
  });
  const [reconciling, setReconciling] = useState(!isTransferencia);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Transferencia: no hace polling, ya está confirmada
    if (isTransferencia) {
      setReconciling(false);
      return;
    }

    if (!orderId) {
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
  }, [orderId, paymentId, isTransferencia]);

  // ── Transferencia: UI fija ──
  if (isTransferencia) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 border border-amber-500 mb-6">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>

        <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-3">
          ¡Pedido registrado!
        </h1>
        <p className="text-[14px] text-[var(--plug-gray)] mb-2 max-w-md mx-auto">
          Recibimos tu pedido. Para confirmarlo, necesitamos que completes la transferencia.
        </p>
        <p className="text-[13px] text-[#1a1a1a] font-medium mb-6 max-w-md mx-auto">
          Te enviamos los datos de pago por email y WhatsApp.
        </p>

        {orderId && (
          <p className="text-[12px] text-neutral-400 font-mono mb-8">
            ID de Pedido: {orderId}
          </p>
        )}

        <p className="text-[12px] text-[var(--plug-gray)] mb-8">
          Una vez que recibamos tu transferencia, procesaremos el pedido y te avisaremos.
        </p>

        <Link href="/" className="plug-btn">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  // ── Mercado Pago: UI original con polling ──

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
        Si tenés alguna duda, escribinos a hola@plugrosario.xyz
      </p>

      <Link href="/" className="plug-btn">
        Volver a la tienda
      </Link>
    </div>
  );
}
