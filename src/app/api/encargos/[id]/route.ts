import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/client-auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/encargos/[id] — Detalle de un encargo
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("shop_encargos")
    .select("*, producto:shop_products(*)")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Encargo no encontrado" },
      { status: 404 }
    );
  }

  // Obtener historial
  const { data: historial } = await supabaseAdmin
    .from("shop_encargo_status_history")
    .select("*")
    .eq("encargo_id", id)
    .order("created_at", { ascending: true });

  // Obtener pagos
  const { data: pagos } = await supabaseAdmin
    .from("shop_encargo_payments")
    .select("*")
    .eq("encargo_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    encargo: {
      ...data,
      historial: historial || [],
      pagos: pagos || [],
    },
  });
}

/**
 * PATCH /api/encargos/[id] — Actualizar encargo (cliente)
 * Solo puede cancelar o aceptar presupuesto
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

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

    // Acciones permitidas para el cliente
    if (action === "cancelar") {
      if (["entregado", "cancelado"].includes(encargo.estado)) {
        return NextResponse.json(
          { error: "No se puede cancelar un encargo en este estado" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("shop_encargos")
        .update({ estado: "cancelado" })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabaseAdmin.from("shop_encargo_status_history").insert({
        encargo_id: id,
        estado_anterior: encargo.estado,
        estado_nuevo: "cancelado",
        notas: "Cancelado por el cliente",
      });

      return NextResponse.json({ encargo: data });
    }

    if (action === "aceptar_presupuesto") {
      if (encargo.estado !== "pendiente_presupuesto" || !encargo.presupuesto_enviado) {
        return NextResponse.json(
          { error: "Este encargo no tiene un presupuesto pendiente de aceptar" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("shop_encargos")
        .update({
          estado: "pendiente",
          presupuesto_aceptado: true,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabaseAdmin.from("shop_encargo_status_history").insert({
        encargo_id: id,
        estado_anterior: "pendiente_presupuesto",
        estado_nuevo: "pendiente",
        notas: "Cliente aceptó el presupuesto",
      });

      return NextResponse.json({ encargo: data });
    }

    if (action === "rechazar_presupuesto") {
      if (encargo.estado !== "pendiente_presupuesto") {
        return NextResponse.json(
          { error: "Este encargo no tiene un presupuesto pendiente" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("shop_encargos")
        .update({
          estado: "cancelado",
          presupuesto_aceptado: false,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabaseAdmin.from("shop_encargo_status_history").insert({
        encargo_id: id,
        estado_anterior: "pendiente_presupuesto",
        estado_nuevo: "cancelado",
        notas: "Cliente rechazó el presupuesto",
      });

      return NextResponse.json({ encargo: data });
    }

    return NextResponse.json(
      { error: "Acción no válida" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Error updating encargo:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
