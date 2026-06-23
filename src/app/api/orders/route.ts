import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      items,
      total_ars,
      cliente_nombre,
      cliente_email,
      cliente_telefono,
      cliente_direccion,
      cliente_notas,
    } = body;

    // Basic validation
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !cliente_nombre ||
      !cliente_email ||
      !cliente_telefono ||
      !cliente_direccion
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos del pedido." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("shop_orders")
      .insert({
        items,
        total_ars,
        estado: "pending",
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        cliente_direccion,
        cliente_notas: cliente_notas || "",
        mp_preference_id: null,
        mp_payment_id: null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return NextResponse.json(
        { error: "Error al crear el pedido. Intentalo de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: data.id,
      message: "Pedido creado exitosamente.",
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
