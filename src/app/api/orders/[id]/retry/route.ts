import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { getMercadoPagoPreference, getSiteUrl } from "@/lib/mercadopago";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === ADMIN_PASSWORD;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data: order, error } = await supabaseAdmin
      .from("shop_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      return NextResponse.json(
        { error: "La orden no tiene items" },
        { status: 400 }
      );
    }

    const preference = getMercadoPagoPreference();
    const siteUrl = getSiteUrl();

    const mpItems = order.items.map((item: any) => ({
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
          name: order.cliente_nombre,
          email: order.cliente_email,
          phone: {
            number: order.cliente_telefono,
          },
          address: {
            street_name: order.cliente_direccion,
          },
        },
        back_urls: {
          success: `${siteUrl}/checkout/confirmado`,
          failure: `${siteUrl}/checkout/confirmado`,
          pending: `${siteUrl}/checkout/confirmado`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        external_reference: order.id,
        metadata: {
          order_id: order.id,
          retry: true,
        },
      },
    });

    const mp_preference_id = prefResponse.id || null;
    const mp_init_point = prefResponse.init_point || null;

    if (mp_preference_id) {
      await supabaseAdmin
        .from("shop_orders")
        .update({ mp_preference_id })
        .eq("id", order.id);
    }

    return NextResponse.json({
      mp_init_point,
      mp_preference_id,
      message: "Nueva preferencia generada exitosamente.",
    });
  } catch (err) {
    console.error("Error retrying payment:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
