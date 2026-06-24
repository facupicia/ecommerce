import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === ADMIN_PASSWORD;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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
