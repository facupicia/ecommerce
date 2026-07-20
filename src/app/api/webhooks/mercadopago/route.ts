import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getMercadoPagoPayment,
  verifyMercadoPagoSignature,
} from "@/lib/mercadopago";
import {
  createOrderLog,
  deductStockForOrder,
  upsertPayment,
} from "@/lib/order-helpers";
import { sendOrderEmail } from "@/lib/email";
import { sendEncargoEmail } from "@/lib/email-encargos";

/**
 * Convierte la respuesta del SDK de Mercado Pago en un objeto plano
 * seguro para guardar en Supabase (evita referencias circulares, getters, etc.).
 */
function safePaymentResponse(payment: any): Record<string, any> | null {
  try {
    return JSON.parse(JSON.stringify(payment));
  } catch (serializationError) {
    console.error("Error serializando pago de MP:", serializationError);
    return null;
  }
}

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
      `[MP Webhook] Topic: "${topic}", Action: "${body.action}", ID: "${paymentId}"`
    );

    if (topic !== "payment" || !paymentId) {
      console.log(`[MP Webhook] Ignorado: topic no es payment o sin ID`);
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
          `[MP Webhook] Firma inválida para payment ${paymentId}. Ignorando.`
        );
        return NextResponse.json({ received: true }, { status: 200 });
      }
    } else {
      console.warn(
        "[MP Webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado. Procesando sin verificar firma."
      );
    }

    // Obtener el pago desde Mercado Pago.
    let payment: any;
    try {
      const paymentClient = getMercadoPagoPayment();
      payment = await paymentClient.get({ id: Number(paymentId) });
    } catch (mpError) {
      console.error(
        `[MP Webhook] Error obteniendo pago ${paymentId} desde MP:`,
        mpError
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const orderId = payment.external_reference;
    const status = payment.status;

    console.log(
      `[MP Webhook] Payment ${paymentId} status: "${status}" (Order: "${orderId}")`
    );

    if (!orderId) {
      console.warn(`[MP Webhook] Payment ${paymentId} sin external_reference.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Detectar si es un pago de encargo
    const isEncargo = payment.metadata?.es_encargo === true || 
                      payment.metadata?.es_encargo === "true" ||
                      searchParams.get("encargo") !== null;

    if (isEncargo) {
      return await handleEncargoPayment(paymentId, payment, orderId, searchParams);
    }

    // Buscar la orden actual.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("shop_orders")
      .select("id, estado, items, mp_payment_id, total_ars, cliente_nombre, cliente_email")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(`[MP Webhook] Orden ${orderId} no encontrada:`, orderError);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Guardar o actualizar el pago en shop_payments (no bloquea el flujo).
    try {
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
        raw_response: safePaymentResponse(payment),
      });
    } catch (paymentError) {
      console.error(
        `[MP Webhook] Error guardando pago ${paymentId} en DB:`,
        paymentError
      );
    }

    // Idempotencia: si ya está pagada, solo guardamos el payment_id.
    if (order.estado === "paid") {
      console.log(`[MP Webhook] Orden ${orderId} ya estaba paid`);
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
          `[MP Webhook] Error descontando stock para orden ${orderId}:`,
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
        console.error(
          `[MP Webhook] Error actualizando orden ${orderId}:`,
          updateError
        );
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
        console.log(`[MP Webhook] Orden ${orderId} marcada como paid`);

        // Notificar al cliente por email (no bloqueante: el resultado ya está
        // persistido, un fallo de email no debe revertir el pago).
        sendOrderEmail({
          order: order as any,
          type: "payment_approved",
          metadata: {
            mp_payment_id: String(paymentId),
            mp_status: status,
            source: "mercadopago_webhook",
          },
        }).catch((emailErr) => {
          console.error(
            `[MP Webhook] Error enviando email de pago aprobado a orden ${orderId}:`,
            emailErr
          );
        });
      }
    } else {
      // Guardar el payment_id para trazabilidad aunque no esté aprobado.
      console.log(
        `[MP Webhook] Payment ${paymentId} no aprobado (${status}). Guardando mp_payment_id.`
      );
      await supabaseAdmin
        .from("shop_orders")
        .update({ mp_payment_id: String(paymentId) })
        .eq("id", orderId);

      // Si el pago fue rechazado y la orden sigue pendiente, avisar al cliente
      // para que pueda reintentar desde /checkout/retry.
      const isRejected =
        status === "rejected" ||
        status === "cancelled" ||
        status === "refused" ||
        status === "chargeback";
      if (isRejected && order.estado === "pending") {
        sendOrderEmail({
          order: order as any,
          type: "payment_rejected",
          metadata: {
            mp_payment_id: String(paymentId),
            mp_status: status,
            mp_status_detail: payment.status_detail ?? null,
            source: "mercadopago_webhook",
          },
        }).catch((emailErr) => {
          console.error(
            `[MP Webhook] Error enviando email de pago rechazado a orden ${orderId}:`,
            emailErr
          );
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[MP Webhook] Error crítico:", error);
    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}

/**
 * Maneja pagos de encargos (seña y restante).
 */
async function handleEncargoPayment(
  paymentId: string,
  payment: any,
  encargoId: string,
  searchParams: URLSearchParams
) {
  const tipo = payment.metadata?.tipo_pago || searchParams.get("tipo") || "sena";
  const status = payment.status;

  console.log(
    `[MP Webhook] Encargo payment ${paymentId} status: "${status}" (Encargo: "${encargoId}", tipo: "${tipo}")`
  );

  // Buscar el encargo
  const { data: encargo, error: encargoError } = await supabaseAdmin
    .from("shop_encargos")
    .select("*")
    .eq("id", encargoId)
    .single();

  if (encargoError || !encargo) {
    console.error(`[MP Webhook] Encargo ${encargoId} no encontrado:`, encargoError);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Actualizar pago en shop_encargo_payments
  const { data: existingPayment } = await supabaseAdmin
    .from("shop_encargo_payments")
    .select("id")
    .eq("mp_payment_id", String(paymentId))
    .maybeSingle();

  const paymentData = {
    mp_payment_id: String(paymentId),
    mp_preference_id: payment.preference_id || null,
    estado: status === "approved" ? "aprobado" : status === "rejected" ? "rechazado" : "pendiente",
    metodo_pago: payment.payment_method_id || null,
    raw_response: safePaymentResponse(payment),
  };

  if (existingPayment) {
    await supabaseAdmin
      .from("shop_encargo_payments")
      .update(paymentData)
      .eq("id", existingPayment.id);
  } else {
    await supabaseAdmin.from("shop_encargo_payments").insert({
      encargo_id: encargoId,
      ...paymentData,
      monto: Number(payment.transaction_amount) || 0,
      tipo,
    });
  }

  if (status === "approved") {
    const updates: Record<string, any> = {};

    if (tipo === "sena") {
      updates.sena_pagada = Number(payment.transaction_amount);
      updates.estado = "confirmado";
    } else if (tipo === "resto") {
      updates.estado = "entregado";
    }

    const { error: updateError } = await supabaseAdmin
      .from("shop_encargos")
      .update(updates)
      .eq("id", encargoId);

    if (updateError) {
      console.error(`[MP Webhook] Error actualizando encargo ${encargoId}:`, updateError);
    } else {
      // Registrar cambio de estado
      const nuevoEstado = updates.estado;
      if (nuevoEstado && nuevoEstado !== encargo.estado) {
        await supabaseAdmin.from("shop_encargo_status_history").insert({
          encargo_id: encargoId,
          estado_anterior: encargo.estado,
          estado_nuevo: nuevoEstado,
          notas: `Pago ${tipo === "sena" ? "de seña" : "restante"} aprobado (MP: ${paymentId})`,
        });
      }

      console.log(`[MP Webhook] Encargo ${encargoId} actualizado: ${nuevoEstado || encargo.estado}`);

      // Email al cliente
      const emailType = tipo === "sena" ? "encargo_confirmado" : "encargo_entregado";
      if (encargo.user_id) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(encargo.user_id);
        const { data: clientProfile } = await supabaseAdmin
          .from("shop_client_profiles")
          .select("nombre")
          .eq("id", encargo.user_id)
          .single();

        if (authUser?.user?.email) {
          sendEncargoEmail({
            encargo: { ...encargo, ...updates, cliente_nombre: clientProfile?.nombre || "" },
            to: authUser.user.email,
            type: emailType as any,
          }).catch((err) =>
            console.error(`[MP Webhook] Error enviando email ${emailType}:`, err)
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
