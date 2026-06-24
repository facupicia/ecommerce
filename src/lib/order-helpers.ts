import { supabaseAdmin } from "./supabase";

interface OrderItem {
  product_id: string;
  nombre: string;
  cantidad: number;
}

export async function createOrderLog(params: {
  order_id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  tipo: "webhook" | "manual" | "system";
  metadata?: Record<string, any>;
}) {
  const { error } = await supabaseAdmin.from("shop_order_logs").insert({
    order_id: params.order_id,
    estado_anterior: params.estado_anterior,
    estado_nuevo: params.estado_nuevo,
    tipo: params.tipo,
    metadata: params.metadata || {},
  });

  if (error) {
    console.error("Error creating order log:", error);
  }
}

export async function upsertPayment(params: {
  order_id: string;
  mp_payment_id: string;
  mp_status?: string | null;
  mp_status_detail?: string | null;
  monto_pagado?: number | null;
  metodo_pago?: string | null;
  cuotas?: number | null;
  fecha_pago?: string | null;
  raw_response?: Record<string, any> | null;
}) {
  const { data: existing } = await supabaseAdmin
    .from("shop_payments")
    .select("id")
    .eq("mp_payment_id", params.mp_payment_id)
    .maybeSingle();

  const payload = {
    order_id: params.order_id,
    mp_payment_id: params.mp_payment_id,
    mp_status: params.mp_status || null,
    mp_status_detail: params.mp_status_detail || null,
    monto_pagado: params.monto_pagado || null,
    metodo_pago: params.metodo_pago || null,
    cuotas: params.cuotas || null,
    fecha_pago: params.fecha_pago || null,
    raw_response: params.raw_response || null,
  };

  if (existing) {
    const { error } = await supabaseAdmin
      .from("shop_payments")
      .update(payload)
      .eq("id", existing.id);
    if (error) console.error("Error updating payment:", error);
  } else {
    const { error } = await supabaseAdmin.from("shop_payments").insert(payload);
    if (error) console.error("Error inserting payment:", error);
  }
}

export async function createStockMovement(params: {
  product_id: string;
  cantidad: number;
  tipo: "sale" | "restock" | "adjustment";
  order_id?: string | null;
  motivo?: string | null;
}) {
  const { error } = await supabaseAdmin.from("shop_stock_movements").insert({
    product_id: params.product_id,
    cantidad: params.cantidad,
    tipo: params.tipo,
    order_id: params.order_id || null,
    motivo: params.motivo || null,
  });

  if (error) {
    console.error("Error creating stock movement:", error);
  }
}

export async function deductStockForOrder(
  orderId: string,
  items: OrderItem[]
): Promise<{ ok: boolean; error?: string }> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: true };
  }

  const productIds = items.map((item) => item.product_id);
  const { data: products, error } = await supabaseAdmin
    .from("shop_products")
    .select("id, stock, nombre")
    .in("id", productIds);

  if (error) {
    return { ok: false, error: error.message };
  }

  const stockMap = new Map(
    products?.map((p) => [p.id, (p.stock || 0) as number])
  );

  // Validar stock suficiente.
  for (const item of items) {
    const available = stockMap.get(item.product_id) || 0;
    const qty = item.cantidad || 1;
    if (available < qty) {
      return {
        ok: false,
        error: `Stock insuficiente para "${item.nombre}" (disponible: ${available}, requerido: ${qty})`,
      };
    }
  }

  // Descontar stock y registrar movimientos.
  for (const item of items) {
    const current = stockMap.get(item.product_id) || 0;
    const qty = item.cantidad || 1;

    const { error: updateError } = await supabaseAdmin
      .from("shop_products")
      .update({ stock: current - qty })
      .eq("id", item.product_id);

    if (updateError) {
      return {
        ok: false,
        error: `Error actualizando stock de "${item.nombre}": ${updateError.message}`,
      };
    }

    await createStockMovement({
      product_id: item.product_id,
      cantidad: -qty,
      tipo: "sale",
      order_id: orderId,
      motivo: `Venta orden ${orderId}`,
    });
  }

  return { ok: true };
}
