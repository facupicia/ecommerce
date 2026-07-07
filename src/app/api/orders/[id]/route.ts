import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";

async function isAdmin() {
  return isAdminFromCookies();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;

  try {
    const [
      { data: order, error: orderError },
      { data: logs, error: logsError },
      { data: payments, error: paymentsError },
      { data: stockMovements, error: stockError },
    ] = await Promise.all([
      supabaseAdmin.from("shop_orders").select("*").eq("id", id).single(),
      supabaseAdmin
        .from("shop_order_logs")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("shop_payments")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("shop_stock_movements")
        .select("*, shop_products(nombre)")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    if (logsError) console.error("Error fetching logs:", logsError);
    if (paymentsError) console.error("Error fetching payments:", paymentsError);
    if (stockError) console.error("Error fetching stock movements:", stockError);

    return NextResponse.json({
      order,
      logs: logs || [],
      payments: payments || [],
      stockMovements: stockMovements || [],
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
