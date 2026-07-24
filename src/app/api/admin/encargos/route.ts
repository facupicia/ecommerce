import { supabaseAdmin } from "@/lib/supabase";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";

export async function GET(req: Request) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado");
    const q = searchParams.get("q")?.trim().toLowerCase();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("encargos_orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (estado) {
      query = query.eq("estado", estado);
    }

    if (q) {
      const safe = q.replace(/"/g, '\\"');
      query = query.or(
        `cliente_nombre.ilike.%${safe}%,cliente_email.ilike.%${safe}%,product_title.ilike.%${safe}%,cliente_telefono.ilike.%${safe}%`
      );
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ orders: data || [], count: count || 0 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
