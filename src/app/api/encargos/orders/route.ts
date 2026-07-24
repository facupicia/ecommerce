import { supabaseAdmin } from "@/lib/supabase";
import { sendEncargoNotification, sendEncargoStatusEmail, cnyToUsd } from "@/lib/encargos-email";
import type { EncargoOrder } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      product_id,
      product_title,
      product_image,
      variante_nombre,
      variante_imagen,
      talle,
      precio_cny,
      cantidad,
      cliente_nombre,
      cliente_email,
      cliente_telefono,
      cliente_direccion,
      cliente_notas,
    } = body;

    // Validation
    if (!product_id || !cliente_nombre || !cliente_email) {
      return Response.json(
        { error: "Faltan campos requeridos: product_id, cliente_nombre, cliente_email" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente_email)) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    // Verify product exists
    const { data: product } = await supabaseAdmin
      .from("encargos_products")
      .select("id")
      .eq("id", product_id)
      .eq("activo", true)
      .single();

    if (!product) {
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const precio_usd = precio_cny ? cnyToUsd(Number(precio_cny)) : null;

    const { data, error } = await supabaseAdmin
      .from("encargos_orders")
      .insert({
        product_id,
        product_title: String(product_title || "").slice(0, 500),
        product_image: product_image || null,
        variante_nombre: variante_nombre || null,
        variante_imagen: variante_imagen || null,
        talle: talle || null,
        precio_cny: precio_cny ? Number(precio_cny) : null,
        precio_usd,
        cantidad: Math.max(1, parseInt(String(cantidad), 10) || 1),
        cliente_nombre: String(cliente_nombre).slice(0, 200),
        cliente_email: String(cliente_email).slice(0, 200),
        cliente_telefono: cliente_telefono ? String(cliente_telefono).slice(0, 50) : null,
        cliente_direccion: cliente_direccion ? String(cliente_direccion).slice(0, 500) : null,
        cliente_notas: cliente_notas ? String(cliente_notas).slice(0, 1000) : null,
        estado: "pending",
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Send email notification to admin and confirmation email to customer
    sendEncargoNotification(data as EncargoOrder).catch((err) =>
      console.error("[encargos] Error sending admin email:", err)
    );
    sendEncargoStatusEmail(data as EncargoOrder).catch((err) =>
      console.error("[encargos] Error sending client status email:", err)
    );

    return Response.json({ order: data });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
