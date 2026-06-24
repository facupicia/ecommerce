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

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("shop_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, estado } = await request.json();

    if (!id || !estado) {
      return NextResponse.json(
        { error: "id y estado requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("shop_orders")
      .update({ estado })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

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

    // Validar stock disponible
    const productIds = items.map((item: any) => item.product_id);
    const { data: products, error: stockError } = await supabaseAdmin
      .from("shop_products")
      .select("id, stock, nombre")
      .in("id", productIds);

    if (stockError) {
      console.error("Error fetching stock:", stockError);
      return NextResponse.json({ error: stockError.message }, { status: 500 });
    }

    const stockMap = new Map(
      products?.map((p) => [p.id, (p.stock || 0) as number])
    );

    for (const item of items) {
      const available = stockMap.get(item.product_id) || 0;
      const qty = item.cantidad || 1;
      if (available < qty) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${item.nombre}"` },
          { status: 400 }
        );
      }
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

    // Descontar stock de los productos vendidos
    for (const item of items) {
      const current = stockMap.get(item.product_id) || 0;
      const qty = item.cantidad || 1;
      const { error: updateError } = await supabaseAdmin
        .from("shop_products")
        .update({ stock: current - qty })
        .eq("id", item.product_id);

      if (updateError) {
        console.error("Error updating stock:", updateError);
      }
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
