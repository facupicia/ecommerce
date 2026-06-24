import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getMercadoPagoPreference, getSiteUrl } from "@/lib/mercadopago";
import { createOrderLog } from "@/lib/order-helpers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const estado = searchParams.get("estado") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));

  let query = supabaseAdmin
    .from("shop_orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (estado) {
    query = query.eq("estado", estado);
  }

  if (from) {
    query = query.gte("created_at", from);
  }

  if (to) {
    // Incluir todo el día.
    const toEnd = to.includes("T") ? to : `${to}T23:59:59.999Z`;
    query = query.lte("created_at", toEnd);
  }

  const { data: allOrders, error, count } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let orders = allOrders || [];

  if (q) {
    orders = orders.filter((order) => {
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesName = (order.cliente_nombre || "").toLowerCase().includes(q);
      const matchesEmail = (order.cliente_email || "").toLowerCase().includes(q);
      const matchesPayment = (order.mp_payment_id || "").toLowerCase().includes(q);
      return matchesId || matchesName || matchesEmail || matchesPayment;
    });
  }

  const total = count || orders.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedOrders = orders.slice(start, start + limit);

  return NextResponse.json({
    orders: paginatedOrders,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, estado, nota } = await request.json();

    if (!id || !estado) {
      return NextResponse.json(
        { error: "id y estado requeridos" },
        { status: 400 }
      );
    }

    // Obtener estado anterior para el log.
    const { data: previousOrder, error: previousError } = await supabaseAdmin
      .from("shop_orders")
      .select("estado")
      .eq("id", id)
      .single();

    if (previousError) {
      console.error("Error fetching previous order:", previousError);
      return NextResponse.json({ error: previousError.message }, { status: 500 });
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

    await createOrderLog({
      order_id: id,
      estado_anterior: previousOrder.estado,
      estado_nuevo: estado,
      tipo: "manual",
      metadata: {
        nota: nota || null,
        source: "admin_panel",
      },
    });

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

    await createOrderLog({
      order_id: data.id,
      estado_anterior: null,
      estado_nuevo: "pending",
      tipo: "system",
      metadata: {
        total_ars: total_ars,
        items_count: items.length,
        cliente_email,
        source: "checkout",
      },
    });

    // Mercado Pago Preference Creation
    let mp_init_point: string | null = null;
    let mp_preference_id: string | null = null;

    try {
      const preference = getMercadoPagoPreference();
      const siteUrl = getSiteUrl();

      const mpItems = items.map((item: any) => ({
        id: item.product_id,
        title: item.nombre,
        quantity: Number(item.cantidad || 1),
        unit_price: Number(item.precio_ars),
        currency_id: "ARS",
      }));

      const prefResponse = await preference.create({
        body: {
          items: mpItems,
          payer: {
            name: cliente_nombre,
            email: cliente_email,
            phone: {
              number: cliente_telefono,
            },
            address: {
              street_name: cliente_direccion,
            },
          },
          back_urls: {
            success: `${siteUrl}/checkout/confirmado`,
            failure: `${siteUrl}/checkout/confirmado`,
            pending: `${siteUrl}/checkout/confirmado`,
          },
          auto_return: "approved",
          notification_url: `${siteUrl}/api/webhooks/mercadopago`,
          external_reference: data.id,
          metadata: {
            order_id: data.id,
          },
        },
      });

      mp_preference_id = prefResponse.id || null;
      mp_init_point = prefResponse.init_point || null;

      if (mp_preference_id) {
        await supabaseAdmin
          .from("shop_orders")
          .update({ mp_preference_id })
          .eq("id", data.id);
      }
    } catch (mpError) {
      console.error("Error creating Mercado Pago preference:", mpError);
      // Fall back to a manual-order flow so the order is not lost.
    }

    return NextResponse.json({
      order_id: data.id,
      mp_init_point,
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
