import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/client-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getMercadoPagoPreference, getSiteUrl } from "@/lib/mercadopago";

/**
 * POST /api/encargos/[id]/pago — Crear preferencia de pago MP para seña o restante
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const { tipo } = await request.json(); // "sena" o "resto"

    if (!tipo || !["sena", "resto"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de pago inválido (sena o resto)" },
        { status: 400 }
      );
    }

    // Verificar que el encargo pertenece al usuario
    const { data: encargo, error: fetchError } = await supabaseAdmin
      .from("shop_encargos")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .single();

    if (fetchError || !encargo) {
      return NextResponse.json(
        { error: "Encargo no encontrado" },
        { status: 404 }
      );
    }

    // Validar estado
    if (tipo === "sena" && encargo.estado !== "pendiente") {
      return NextResponse.json(
        { error: "Este encargo no está pendiente de pago de seña" },
        { status: 400 }
      );
    }

    if (tipo === "resto" && encargo.estado !== "listo") {
      return NextResponse.json(
        { error: "Este encargo no está listo para pago del restante" },
        { status: 400 }
      );
    }

    const precioTotal = Number(encargo.precio_total);
    if (precioTotal <= 0) {
      return NextResponse.json(
        { error: "El encargo no tiene precio asignado" },
        { status: 400 }
      );
    }

    const monto = tipo === "sena" ? precioTotal * 0.5 : precioTotal - Number(encargo.sena_pagada);

    if (monto <= 0) {
      return NextResponse.json(
        { error: "No hay monto pendiente de pago" },
        { status: 400 }
      );
    }

    // Crear preferencia MP
    const preference = getMercadoPagoPreference();
    const siteUrl = getSiteUrl();

    const prefResponse = await preference.create({
      body: {
        items: [
          {
            id: `encargo-${id}-${tipo}`,
            title: `Encargo #${id.slice(0, 8).toUpperCase()} — ${tipo === "sena" ? "Seña (50%)" : "Restante (50%)"}`,
            quantity: 1,
            unit_price: monto,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${siteUrl}/cuenta/encargos/${id}`,
          failure: `${siteUrl}/cuenta/encargos/${id}`,
          pending: `${siteUrl}/cuenta/encargos/${id}`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/webhooks/mercadopago?encargo=${id}&tipo=${tipo}`,
        external_reference: id,
        metadata: {
          encargo_id: id,
          tipo_pago: tipo,
          es_encargo: true,
        },
      },
    });

    // Registrar pago pendiente
    await supabaseAdmin.from("shop_encargo_payments").insert({
      encargo_id: id,
      mp_preference_id: prefResponse.id,
      monto,
      tipo,
      estado: "pendiente",
    });

    return NextResponse.json({
      mp_init_point: prefResponse.init_point,
      preference_id: prefResponse.id,
    });
  } catch (err) {
    console.error("Error creating encargo payment:", err);
    return NextResponse.json(
      { error: "Error al crear el pago" },
      { status: 500 }
    );
  }
}
