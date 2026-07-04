import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderEmail, type OrderEmailType } from "@/lib/email";
import { getMercadoPagoPreference, getSiteUrl } from "@/lib/mercadopago";
import { createOrderLog } from "@/lib/order-helpers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


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
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

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

  if (q) {
    // Sanitizar comillas para el filtro OR de PostgREST.
    const safe = q.replace(/"/g, '\\"');
    const orFilter = `id.ilike."%${safe}%",cliente_nombre.ilike."%${safe}%",cliente_email.ilike."%${safe}%",mp_payment_id.ilike."%${safe}%"`;
    query = query.or(orFilter);
  }

  const fromRange = (page - 1) * limit;
  const toRange = fromRange + limit - 1;
  query = query.range(fromRange, toRange);

  const { data: orders, error, count } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    orders: orders || [],
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

    // Obtener estado anterior y datos del cliente para el log y el email.
    const { data: previousOrder, error: previousError } = await supabaseAdmin
      .from("shop_orders")
      .select("estado, cliente_nombre, cliente_email, total_ars, items")
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

    // Mapear estado -> tipo de email (solo cuando es un cambio real).
    const stateEmailMap: Record<string, OrderEmailType> = {
      shipped: "order_shipped",
      delivered: "order_delivered",
      cancelled: "order_cancelled",
    };
    const emailType = stateEmailMap[estado];
    if (
      emailType &&
      previousOrder.estado !== estado &&
      previousOrder.cliente_email
    ) {
      const orderForEmail = {
        ...(data as any),
        cliente_nombre: previousOrder.cliente_nombre,
        cliente_email: previousOrder.cliente_email,
        total_ars: previousOrder.total_ars,
        items: previousOrder.items,
      };
      sendOrderEmail({
        order: orderForEmail,
        type: emailType,
        metadata: {
          estado_anterior: previousOrder.estado,
          estado_nuevo: estado,
          nota: nota || null,
          source: "admin_panel",
        },
      }).catch((emailErr) => {
        console.error(
          `[Orders PATCH] Error enviando email ${emailType} a orden ${id}:`,
          emailErr
        );
      });
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
      payment_method,
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
        payment_method: payment_method || "mercadopago",
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
        payment_method: payment_method || "mercadopago",
        source: "checkout",
      },
    });

    // Mercado Pago — solo si el método elegido es Mercado Pago
    let mp_init_point: string | null = null;
    let mp_preference_id: string | null = null;

    if (payment_method !== "transferencia") {
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
