import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("cssbuy_warehouse")
      .select("*")
      .order("fecha_pedido", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ orders: data, lastSync: new Date().toISOString() });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orders = Array.isArray(body?.orders) ? body.orders : Array.isArray(body) ? body : [];
    if (orders.length === 0) return Response.json({ error: "No orders" }, { status: 400 });

    const { data, error } = await supabaseAdmin.from("cssbuy_warehouse").upsert(orders, { onConflict: "oid" }).select("oid");
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true, upserted: data?.length || 0, lastSync: new Date().toISOString() });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
