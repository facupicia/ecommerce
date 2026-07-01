import { Resend } from "resend";
import { supabaseAdmin } from "./supabase";
import type { ShopOrder, ShopOrderItem } from "./types";

export type OrderEmailType =
  | "payment_approved"
  | "payment_rejected"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled";

interface SendOrderEmailParams {
  order: ShopOrder;
  type: OrderEmailType;
  metadata?: Record<string, unknown>;
}

const TYPE_CONFIG: Record<
  OrderEmailType,
  { subject: string; emoji: string; intro: string; tone: "good" | "bad" | "info" }
> = {
  payment_approved: {
    subject: "Pago confirmado",
    emoji: "✅",
    intro: "Recibimos tu pago correctamente. Tu pedido ya está en marcha.",
    tone: "good",
  },
  payment_rejected: {
    subject: "Tu pago no se pudo procesar",
    emoji: "⚠️",
    intro:
      "No pudimos procesar el pago de tu pedido. Podés reintentar con el mismo link o un medio de pago distinto.",
    tone: "bad",
  },
  order_shipped: {
    subject: "Tu pedido fue despachado",
    emoji: "📦",
    intro: "¡Buenas noticias! Despachamos tu pedido y ya está en camino.",
    tone: "good",
  },
  order_delivered: {
    subject: "Tu pedido fue entregado",
    emoji: "🎉",
    intro: "Tu pedido fue entregado. Esperamos que lo disfrutes.",
    tone: "good",
  },
  order_cancelled: {
    subject: "Tu pedido fue cancelado",
    emoji: "❌",
    intro: "Tu pedido fue cancelado. Si tenés dudas, respondé este email.",
    tone: "bad",
  },
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getFromAddress(): string {
  const from = process.env.EMAIL_FROM;
  if (from) return from;
  const name = process.env.EMAIL_FROM_NAME || process.env.SHOP_NAME || "Tienda";
  return `${name} <onboarding@resend.dev>`;
}

function getShopName(): string {
  return process.env.SHOP_NAME || "Tienda";
}

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://theplug.com.ar";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function formatARS(value: number): string {
  return `$${(value || 0).toLocaleString("es-AR")}`;
}

function buildItemsHtml(items: ShopOrderItem[]): string {
  if (!Array.isArray(items) || items.length === 0) {
    return '<tr><td colspan="3" style="padding:8px 0;color:#888;">Sin items</td></tr>';
  }
  return items
    .map((it) => {
      const subtotal = (it.precio_ars || 0) * (it.cantidad || 1);
      const talle = it.talle ? ` <span style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px;color:#555;">${it.talle}</span>` : "";
      const img = it.imagen
        ? `<img src="${it.imagen}" alt="" width="48" height="48" style="border-radius:6px;object-fit:cover;background:#f3f4f6;" />`
        : "";
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">${img}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;">
            ${it.nombre || "Producto"}${talle}
            <div style="font-size:12px;color:#666;margin-top:2px;">x${it.cantidad || 1}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#111;white-space:nowrap;">
            ${formatARS(subtotal)}
          </td>
        </tr>`;
    })
    .join("");
}

function buildEmailHtml(args: {
  order: ShopOrder;
  type: OrderEmailType;
}): { subject: string; html: string; text: string } {
  const { order, type } = args;
  const cfg = TYPE_CONFIG[type];
  const shop = getShopName();
  const siteUrl = getSiteUrl();
  const retryUrl = `${siteUrl}/checkout/retry?order=${order.id}`;

  const headerColor =
    cfg.tone === "good" ? "#10b981" : cfg.tone === "bad" ? "#ef4444" : "#3b82f6";

  const subject = `${cfg.subject} · ${shop} #${order.id.slice(0, 8).toUpperCase()}`;

  const html = `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:${headerColor};padding:20px 24px;color:#fff;">
          <p style="margin:0;font-size:14px;opacity:0.9;">${shop}</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;">${cfg.emoji} ${cfg.subject}</h1>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 8px;font-size:15px;">Hola <strong>${order.cliente_nombre || ""}</strong>,</p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.5;">${cfg.intro}</p>

          <div style="background:#f9fafb;border:1px solid #f0f0f0;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#374151;">
            <strong>Orden:</strong> #${order.id.slice(0, 8).toUpperCase()}<br/>
            <strong>Total:</strong> ${formatARS(order.total_ars)}
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tbody>${buildItemsHtml(order.items || [])}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 0 0;text-align:right;font-size:14px;color:#111;font-weight:600;">Total</td>
                <td style="padding:12px 0 0;text-align:right;font-size:16px;color:#111;font-weight:700;">${formatARS(order.total_ars)}</td>
              </tr>
            </tfoot>
          </table>

          ${
            type === "payment_rejected"
              ? `<div style="text-align:center;margin:24px 0 8px;">
                  <a href="${retryUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Reintentar pago</a>
                </div>`
              : ""
          }

          <p style="margin:24px 0 0;font-size:12px;color:#6b7280;line-height:1.5;">
            Si tenés alguna duda, respondé este email y te ayudamos.
          </p>
        </div>
      </div>

      <p style="text-align:center;margin:16px 0 0;font-size:11px;color:#9ca3af;">
        ${shop} · ${siteUrl.replace(/^https?:\/\//, "")}
      </p>
    </div>
  </body>
</html>`;

  const text = [
    `Hola ${order.cliente_nombre || ""},`,
    "",
    cfg.intro,
    "",
    `Orden: #${order.id.slice(0, 8).toUpperCase()}`,
    `Total: ${formatARS(order.total_ars)}`,
    "",
    ...(order.items || []).map(
      (it) => `- ${it.nombre} x${it.cantidad || 1} = ${formatARS((it.precio_ars || 0) * (it.cantidad || 1))}`
    ),
    "",
    type === "payment_rejected" ? `Reintentar pago: ${retryUrl}` : "",
    "",
    `Gracias por tu compra,`,
    shop,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

async function logEmail(params: {
  orderId: string | null;
  type: OrderEmailType;
  to: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  providerId?: string | null;
  error?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("shop_email_logs").insert({
      order_id: params.orderId,
      tipo: params.type,
      to_email: params.to,
      subject: params.subject,
      provider: "resend",
      provider_id: params.providerId || null,
      status: params.status,
      error: params.error || null,
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.error("[email] Error guardando log:", err);
  }
}

export async function sendOrderEmail({
  order,
  type,
  metadata,
}: SendOrderEmailParams): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!order?.cliente_email) {
    console.warn(`[email] Orden ${order?.id} sin email; se omite envío.`);
    return { ok: false, skipped: true, error: "Orden sin email" };
  }

  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurado; se omite envío.");
    await logEmail({
      orderId: order.id,
      type,
      to: order.cliente_email,
      subject: "(no enviado)",
      status: "skipped",
      error: "RESEND_API_KEY no configurado",
      metadata,
    });
    return { ok: false, skipped: true, error: "RESEND_API_KEY no configurado" };
  }

  const { subject, html, text } = buildEmailHtml({ order, type });

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: order.cliente_email,
      subject,
      html,
      text,
    });

    if (result.error) {
      const errMsg = result.error.message || "Error desconocido de Resend";
      console.error(`[email] Error enviando ${type} a ${order.cliente_email}:`, errMsg);
      await logEmail({
        orderId: order.id,
        type,
        to: order.cliente_email,
        subject,
        status: "failed",
        error: errMsg,
        metadata,
      });
      return { ok: false, error: errMsg };
    }

    console.log(
      `[email] ${type} enviado a ${order.cliente_email} (order ${order.id}) id=${result.data?.id}`
    );
    await logEmail({
      orderId: order.id,
      type,
      to: order.cliente_email,
      subject,
      status: "sent",
      providerId: result.data?.id || null,
      metadata,
    });
    return { ok: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Error enviando email";
    console.error(`[email] Excepción enviando ${type}:`, err);
    await logEmail({
      orderId: order.id,
      type,
      to: order.cliente_email,
      subject,
      status: "failed",
      error: errMsg,
      metadata,
    });
    return { ok: false, error: errMsg };
  }
}
