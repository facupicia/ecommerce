import { supabaseAdmin } from "@/lib/supabase";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";
import { sendEncargoStatusEmail } from "@/lib/encargos-email";
import type { EncargoOrder } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const { estado, admin_notas } = body;

    const updates: Record<string, unknown> = {};
    if (estado) updates.estado = estado;
    if (admin_notas !== undefined) updates.admin_notas = admin_notas;

    const { data, error } = await supabaseAdmin
      .from("encargos_orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Send email notification to client on status update
    if (estado && data) {
      try {
        await sendEncargoStatusEmail(data as EncargoOrder);
      } catch (emailErr) {
        console.error("[encargos-status-email] Error enviando email de estado:", emailErr);
      }
    }

    return Response.json({ order: data });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("encargos_orders")
      .delete()
      .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
