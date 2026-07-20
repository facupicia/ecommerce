import { NextResponse } from "next/server";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEncargoEmail } from "@/lib/email-encargos";

/**
 * GET /api/admin/encargos — Listar todos los encargos (admin)
 */
export async function GET(request: Request) {
  if (!(await isAdminFromCookies())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const estado = searchParams.get("estado") || "";
  const tipo = searchParams.get("tipo") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));

  let query = supabaseAdmin
    .from("shop_encargos")
    .select("*, producto:shop_products(*), cliente:shop_client_profiles(*)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (estado) {
    query = query.eq("estado", estado);
  }

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  if (q) {
    const safe = q.replace(/"/g, '\\"');
    const orFilter = `id.ilike."%${safe}%",descripcion.ilike."%${safe}%",categoria.ilike."%${safe}%",talle.ilike."%${safe}%"`;
    query = query.or(orFilter);
  }

  const fromRange = (page - 1) * limit;
  const toRange = fromRange + limit - 1;
  query = query.range(fromRange, toRange);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching encargos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    encargos: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
    },
  });
}

/**
 * PATCH /api/admin/encargos — Actualizar encargo (admin)
 */
export async function PATCH(request: Request) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const body = await request.json();
    const { id, estado, notas_admin, precio_total, presupuesto_enviado } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Obtener estado actual
    const { data: current, error: currentError } = await supabaseAdmin
      .from("shop_encargos")
      .select("*")
      .eq("id", id)
      .single();

    if (currentError || !current) {
      return NextResponse.json(
        { error: "Encargo no encontrado" },
        { status: 404 }
      );
    }

    // Construir update payload
    const updates: Record<string, any> = {};
    if (estado !== undefined) updates.estado = estado;
    if (notas_admin !== undefined) updates.notas_admin = notas_admin;
    if (precio_total !== undefined) updates.precio_total = precio_total;
    if (presupuesto_enviado !== undefined)
      updates.presupuesto_enviado = presupuesto_enviado;

    const { data, error } = await supabaseAdmin
      .from("shop_encargos")
      .update(updates)
      .eq("id", id)
      .select("*, producto:shop_products(*), cliente:shop_client_profiles(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Registrar cambio de estado
    if (estado && estado !== current.estado) {
      await supabaseAdmin.from("shop_encargo_status_history").insert({
        encargo_id: id,
        estado_anterior: current.estado,
        estado_nuevo: estado,
        notas: notas_admin || "",
      });

      // Enviar email al cliente
      const emailTypes: Record<string, string> = {
        confirmado: "encargo_confirmado",
        en_camino: "encargo_en_camino",
        listo: "encargo_listo",
        entregado: "encargo_entregado",
        cancelado: "encargo_cancelado",
      };

      const emailType = emailTypes[estado];
      if (emailType && current.user_id) {
        // Obtener datos del cliente para el email
        const { data: clientProfile } = await supabaseAdmin
          .from("shop_client_profiles")
          .select("nombre")
          .eq("id", current.user_id)
          .single();

        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
          current.user_id
        );

        if (authUser?.user?.email) {
          sendEncargoEmail({
            encargo: { ...data, cliente_nombre: clientProfile?.nombre || "" },
            to: authUser.user.email,
            type: emailType as any,
          }).catch((err) =>
            console.error(`Error enviando email ${emailType}:`, err)
          );
        }
      }
    }

    // Enviar email de presupuesto si se marca como enviado
    if (
      presupuesto_enviado &&
      !current.presupuesto_enviado &&
      current.user_id
    ) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        current.user_id
      );
      const { data: clientProfile } = await supabaseAdmin
        .from("shop_client_profiles")
        .select("nombre")
        .eq("id", current.user_id)
        .single();

      if (authUser?.user?.email) {
        sendEncargoEmail({
          encargo: {
            ...data,
            cliente_nombre: clientProfile?.nombre || "",
          },
          to: authUser.user.email,
          type: "encargo_presupuesto",
        }).catch((err) =>
          console.error("Error enviando email de presupuesto:", err)
        );
      }
    }

    return NextResponse.json({ encargo: data });
  } catch (err) {
    console.error("Error updating encargo:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
