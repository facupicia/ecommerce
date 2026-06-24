import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getMercadoPagoPayment,
  verifyMercadoPagoSignature,
} from "@/lib/mercadopago";
import {
  createOrderLog,
  deductStockForOrder,
  upsertPayment,
} from "@/lib/order-helpers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * Mercado Pago requiere una respuesta 200/201 para dejar de reintentar.
 * Devolvemos 200 incluso ante errores internos, pero logueamos todo.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    let paymentId: string | null =
      searchParams.get("data.id") || searchParams.get("id");
    let topic: string | null =
      searchParams.get("type") || searchParams.get("topic");

    let body: Record<string, any> = {};
    try {
      body = await request.json();
    } catch {
      // Body vacío o no JSON.
    }

    if (body.data?.id) {
      paymentId = String(body.data.id);
    }
    if (body.type) {
      topic = body.type;
    }

    console.log(
      `Mercado Pago webhook. Topic: "${topic}", ID: "${paymentId}"`
    );

    if (topic !== "payment" || !paymentId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Verificación de firma (opcional pero recomendada).
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signatureHeader = request.headers.get("x-signature");
      const isValid = verifyMercadoPagoSignature(
        signatureHeader,
        paymentId,
        webhookSecret
      );
      if (!isValid) {
        console.warn(
          `Firma de webhook inválida para payment ${paymentId}. Ignorando.`
        );
        return NextResponse.json({ received: true }, { status: 200 });
      }
    } else {
      console.warn(
        "MERCADOPAGO_WEBHOOK_SECRET no está configurado. El webhook se procesará sin verificar firma."
      );
    }

    // Obtener el pago desde Mercado Pago.
    const paymentClient = getMercadoPagoPayment();
    const payment = await paymentClient.get({ id: Number(paymentId) });
    const orderId = payment.external_reference;
    const status = payment.status;

    console.log(
      `Mercado Pago payment ${paymentId} status: "${status}" (Order: "${orderId}")`
    );

    if (!orderId) {
      console.warn(`Payment ${paymentId} sin external_reference.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Buscar la orden actual.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("shop_orders")
      .select("id, estado, items, mp_payment_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(`Orden ${orderId} no encontrada:`, orderError);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Guardar o actualizar el pago en shop_payments.
    await upsertPayment({
      order_id: orderId,
      mp_payment_id: String(paymentId),
      mp_status: status ?? null,
      mp_status_detail: payment.status_detail ?? null,
      monto_pagado:
        status === "approved" ? Number(payment.transaction_amount) : null,
      metodo_pago: payment.payment_method_id ?? null,
      cuotas: payment.installments ?? null,
      fecha_pago: payment.date_approved ?? null,
      raw_response: payment as unknown as Record<string, any>,
    });

    // Idempotencia: si ya está pagada, solo guardamos el payment_id.
    if (order.estado === "paid") {
      if (!order.mp_payment_id || order.mp_payment_id !== String(paymentId)) {
        await supabaseAdmin
          .from("shop_orders")
          .update({ mp_payment_id: String(paymentId) })
          .eq("id", orderId);
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (status === "approved") {
      // Descontar stock una sola vez al aprobarse el pago.
      const stockResult = await deductStockForOrder(orderId, order.items);
      if (!stockResult.ok) {
        console.error(
          `Error descontando stock para orden ${orderId}:`,
          stockResult.error
        );
        // Continuamos igual para no perder la venta; se puede revisar manualmente.
      }

      const { error: updateError } = await supabaseAdmin
        .from("shop_orders")
        .update({
          estado: "paid",
          mp_payment_id: String(paymentId),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error(`Error actualizando orden ${orderId}:`, updateError);
      } else {
        await createOrderLog({
          order_id: orderId,
          estado_anterior: order.estado,
          estado_nuevo: "paid",
          tipo: "webhook",
          metadata: {
            mp_payment_id: String(paymentId),
            mp_status: status,
            source: "mercadopago_webhook",
          },
        });
        console.log(`Orden ${orderId} marcada como paid`);
      }
    } else {
      // Guardar el payment_id para trazabilidad aunque no esté aprobado.
      await supabaseAdmin
        .from("shop_orders")
        .update({ mp_payment_id: String(paymentId) })
        .eq("id", orderId);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error crítico en webhook de Mercado Pago:", error);
    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
