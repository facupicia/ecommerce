import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getMercadoPagoPayment } from "@/lib/mercadopago";
import {
  createOrderLog,
  deductStockForOrder,
  upsertPayment,
} from "@/lib/order-helpers";
import { sendOrderEmail } from "@/lib/email";

/**
 * Endpoint público de reconciliación.
 *
 * El cliente llega a /checkout/confirmado con ?payment_id=...&external_reference=...
 * desde la back_url de Mercado Pago. Este endpoint:
 *   1. Lee la orden por external_reference.
 *   2. Consulta el pago a la API de MP.
 *   3. Si MP reporta approved y la orden está pending, la marca como paid
 *      y dispara el email (es el mismo flujo que el webhook, pero ejecutado
 *      on-demand desde el navegador del cliente como fallback).
 *
 * Seguridad: solo expone el estado. Para reconciliar exige conocer el
 * payment_id que MP devolvió en la back_url, por lo que un atacante
 * necesitaría adivinar UUIDs de orden.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");
  const { id: orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: "order id requerido" }, { status: 400 });
  }

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from("shop_orders")
      .select(
        "id, estado, mp_payment_id, mp_preference_id, cliente_email, items, total_ars, cliente_nombre"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const baseResponse = {
      order_id: order.id,
      estado: order.estado,
      payment_id: order.mp_payment_id,
    };

    // Si ya está pagada (o más avanzada), no hace falta reconciliar.
    if (order.estado !== "pending") {
      return NextResponse.json(baseResponse);
    }

    // Sin payment_id no podemos consultar MP.
    if (!paymentId && !order.mp_payment_id) {
      return NextResponse.json(baseResponse);
    }

    const idToFetch = paymentId || order.mp_payment_id;

    let payment: any;
    try {
      const paymentClient = getMercadoPagoPayment();
      payment = await paymentClient.get({ id: Number(idToFetch) });
    } catch (mpError) {
      console.error(
        `[reconcile] Error consultando pago ${idToFetch} en MP:`,
        mpError
      );
      return NextResponse.json(baseResponse);
    }

    // Persistir el pago (no bloquea).
    try {
      await upsertPayment({
        order_id: orderId,
        mp_payment_id: String(idToFetch),
        mp_status: payment.status ?? null,
        mp_status_detail: payment.status_detail ?? null,
        monto_pagado:
          payment.status === "approved"
            ? Number(payment.transaction_amount)
            : null,
        metodo_pago: payment.payment_method_id ?? null,
        cuotas: payment.installments ?? null,
        fecha_pago: payment.date_approved ?? null,
        raw_response: safePaymentResponse(payment),
      });
    } catch (e) {
      console.error("[reconcile] Error guardando pago:", e);
    }

    if (payment.status === "approved") {
      const stockResult = await deductStockForOrder(orderId, order.items);
      if (!stockResult.ok) {
        console.error(
          `[reconcile] Error descontando stock para ${orderId}:`,
          stockResult.error
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("shop_orders")
        .update({ estado: "paid", mp_payment_id: String(idToFetch) })
        .eq("id", orderId);

      if (!updateError) {
        await createOrderLog({
          order_id: orderId,
          estado_anterior: order.estado,
          estado_nuevo: "paid",
          tipo: "system",
          metadata: {
            mp_payment_id: String(idToFetch),
            source: "client_reconcile",
            note: "Reconciliado desde /checkout/confirmado (webhook no llegó)",
          },
        });

        sendOrderEmail({
          order: order as any,
          type: "payment_approved",
          metadata: {
            mp_payment_id: String(idToFetch),
            source: "client_reconcile",
          },
        }).catch((emailErr) => {
          console.error(
            `[reconcile] Error enviando email a orden ${orderId}:`,
            emailErr
          );
        });

        return NextResponse.json({
          order_id: order.id,
          estado: "paid",
          payment_id: String(idToFetch),
          reconciled: true,
        });
      }
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      // Guardar payment_id para trazabilidad.
      await supabaseAdmin
        .from("shop_orders")
        .update({ mp_payment_id: String(idToFetch) })
        .eq("id", orderId);
    }

    return NextResponse.json({
      order_id: order.id,
      estado: payment.status === "approved" ? "paid" : order.estado,
      payment_id: String(idToFetch),
      mp_status: payment.status,
    });
  } catch (err) {
    console.error("[reconcile] Error crítico:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

function safePaymentResponse(payment: any): Record<string, unknown> | null {
  try {
    return JSON.parse(JSON.stringify(payment));
  } catch {
    return null;
  }
}
