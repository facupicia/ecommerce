import { NextResponse } from "next/server";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/admin/encargos/[id] — Detalle de un encargo (admin)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminFromCookies())) return unauthorized();

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("shop_encargos")
    .select("*, producto:shop_products(*), cliente:shop_client_profiles(*)")
    .eq("id", id)
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

  // Obtener email del usuario
  let clienteEmail = "";
  if (data.user_id) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      data.user_id
    );
    clienteEmail = authUser?.user?.email || "";
  }

  return NextResponse.json({
    encargo: {
      ...data,
      cliente_email: clienteEmail,
      historial: historial || [],
      pagos: pagos || [],
    },
  });
}
