import { Resend } from "resend";
import { supabaseAdmin } from "./supabase";
import type { EncargoOrder } from "./types";

/** CNY → USD rate (fallback, should match pricing config) */
const CNY_USD_RATE = 7.2;

export function cnyToUsd(cny: number): number {
  return Math.round((cny / CNY_USD_RATE) * 100) / 100;
}

export function formatUSD(n: number): string {
  return `US$${n.toFixed(2)}`;
}

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
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getAdminEmail(): string {
  // Send notification to the shop owner; defaults to the EMAIL_FROM if not set
  return process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "noreply@plugrosario.xyz";
}

function buildEncargoNotificationHtml(order: EncargoOrder): {
  subject: string;
  html: string;
  text: string;
} {
  const shop = getShopName();
  const siteUrl = getSiteUrl();
  const priceDisplay = order.precio_usd
    ? `US$${Number(order.precio_usd).toFixed(2)}`
    : order.precio_cny
      ? `¥${Number(order.precio_cny)} (~US$${cnyToUsd(Number(order.precio_cny)).toFixed(2)})`
      : "No especificado";

  const subject = `📦 Nuevo encargo · ${shop} — ${order.product_title}`;

  const html = `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#7c3aed;padding:20px 24px;color:#fff;">
          <p style="margin:0;font-size:14px;opacity:0.9;">${shop}</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;">📦 Nuevo pedido de encargo</h1>
        </div>

        <div style="padding:24px;">
          <div style="display:flex;gap:16px;margin-bottom:20px;">
            ${order.product_image ? `<img src="${order.product_image}" alt="" width="80" height="80" style="border-radius:8px;object-fit:cover;background:#f3f4f6;" />` : ""}
            <div>
              <h2 style="margin:0;font-size:16px;font-weight:600;">${order.product_title}</h2>
              ${order.variante_nombre ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Variante: ${order.variante_nombre}</p>` : ""}
              ${order.talle ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Talle: ${order.talle}</p>` : ""}
              <p style="margin:4px 0 0;font-size:14px;font-weight:600;">${priceDisplay} × ${order.cantidad}</p>
            </div>
          </div>

          <div style="background:#f9fafb;border:1px solid #f0f0f0;border-radius:8px;padding:16px;margin-bottom:16px;">
            <h3 style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">Datos del cliente</h3>
            <table style="width:100%;font-size:13px;color:#374151;">
              <tr><td style="padding:3px 0;font-weight:500;width:100px;">Nombre</td><td>${order.cliente_nombre}</td></tr>
              <tr><td style="padding:3px 0;font-weight:500;">Email</td><td><a href="mailto:${order.cliente_email}">${order.cliente_email}</a></td></tr>
              ${order.cliente_telefono ? `<tr><td style="padding:3px 0;font-weight:500;">Teléfono</td><td>${order.cliente_telefono}</td></tr>` : ""}
              ${order.cliente_direccion ? `<tr><td style="padding:3px 0;font-weight:500;">Dirección</td><td>${order.cliente_direccion}</td></tr>` : ""}
            </table>
            ${order.cliente_notas ? `<p style="margin:10px 0 0;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px;"><strong>Notas:</strong> ${order.cliente_notas}</p>` : ""}
          </div>

          <div style="text-align:center;margin:20px 0 8px;">
            <a href="${siteUrl}/admin/encargos" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Ver en el panel</a>
          </div>
        </div>
      </div>

      <p style="text-align:center;margin:16px 0 0;font-size:11px;color:#9ca3af;">
        ${shop} · ${siteUrl.replace(/^https?:\/\//, "")}
      </p>
    </div>
  </body>
</html>`;

  const text = [
    `Nuevo encargo — ${shop}`,
    "",
    `Producto: ${order.product_title}`,
    order.variante_nombre ? `Variante: ${order.variante_nombre}` : "",
    order.talle ? `Talle: ${order.talle}` : "",
    `Precio: ${priceDisplay}`,
    `Cantidad: ${order.cantidad}`,
    "",
    "--- Cliente ---",
    `Nombre: ${order.cliente_nombre}`,
    `Email: ${order.cliente_email}`,
    order.cliente_telefono ? `Teléfono: ${order.cliente_telefono}` : "",
    order.cliente_direccion ? `Dirección: ${order.cliente_direccion}` : "",
    order.cliente_notas ? `Notas: ${order.cliente_notas}` : "",
    "",
    `Ver en el panel: ${siteUrl}/admin/encargos`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export async function sendEncargoNotification(
  order: EncargoOrder
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[encargos-email] RESEND_API_KEY no configurado");
    return { ok: false, error: "RESEND_API_KEY no configurado" };
  }

  const adminEmail = getAdminEmail();
  const { subject, html, text } = buildEncargoNotificationHtml(order);

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: adminEmail,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error("[encargos-email] Error:", result.error.message);
      return { ok: false, error: result.error.message };
    }

    console.log(`[encargos-email] Notificación enviada a ${adminEmail} (id=${result.data?.id})`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error enviando email";
    console.error("[encargos-email] Excepción:", err);
    return { ok: false, error: msg };
  }
}

// ── Notificación de Cambio de Estado al Cliente ─────────────────

const ENCARGO_STATUS_CONFIG: Record<
  string,
  { subject: string; emoji: string; intro: string; tone: "good" | "bad" | "info" | "accent" }
> = {
  pending: {
    subject: "Solicitud de encargo recibida",
    emoji: "⏳",
    intro: "Recibimos tu solicitud de encargo. Estamos revisando disponibilidad para confirmarte los detalles.",
    tone: "info",
  },
  confirmed: {
    subject: "Encargo confirmado",
    emoji: "✅",
    intro: "¡Tu encargo fue confirmado! En breve nos pondremos en contacto para gestionar el pago y procesar la importación.",
    tone: "good",
  },
  ordered: {
    subject: "Encargo pedido en origen",
    emoji: "✈️",
    intro: "¡Buenas noticias! Tu producto ya fue solicitado al proveedor en origen y se encuentra en camino a nuestro depósito.",
    tone: "accent",
  },
  received: {
    subject: "Encargo recibido en depósito",
    emoji: "📦",
    intro: "Tu producto ya llegó a nuestro depósito y está siendo preparado para ser entregado o despachado.",
    tone: "good",
  },
  delivered: {
    subject: "Encargo entregado / despachado",
    emoji: "🎉",
    intro: "Tu pedido por encargo fue completado y entregado con éxito. ¡Esperamos que lo disfrutes!",
    tone: "good",
  },
  cancelled: {
    subject: "Encargo cancelado",
    emoji: "❌",
    intro: "Tu solicitud de encargo ha sido cancelada. Si tenés dudas o querés realizar otra consulta, respondé a este correo.",
    tone: "bad",
  },
};

function buildEncargoStatusEmailHtml(order: EncargoOrder): {
  subject: string;
  html: string;
  text: string;
} {
  const shop = getShopName();
  const siteUrl = getSiteUrl();
  const config = ENCARGO_STATUS_CONFIG[order.estado] || {
    subject: `Actualización de tu encargo (${order.estado})`,
    emoji: "📦",
    intro: `El estado de tu encargo ha cambiado a "${order.estado}".`,
    tone: "info",
  };

  const headerBg =
    config.tone === "good"
      ? "#10b981"
      : config.tone === "bad"
        ? "#ef4444"
        : config.tone === "accent"
          ? "#8b5cf6"
          : "#3b82f6";

  const priceDisplay = order.precio_usd
    ? `US$${Number(order.precio_usd).toFixed(2)}`
    : order.precio_cny
      ? `¥${Number(order.precio_cny)} (~US$${cnyToUsd(Number(order.precio_cny)).toFixed(2)})`
      : "No especificado";

  const subject = `${config.subject} · ${shop} — ${order.product_title}`;

  const html = `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:${headerBg};padding:20px 24px;color:#fff;">
          <p style="margin:0;font-size:14px;opacity:0.9;">${shop}</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;">${config.emoji} ${config.subject}</h1>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;">Hola <strong>${order.cliente_nombre || ""}</strong>,</p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.5;">${config.intro}</p>

          <div style="display:flex;gap:16px;background:#f9fafb;border:1px solid #f0f0f0;border-radius:10px;padding:16px;margin-bottom:20px;">
            ${order.product_image ? `<img src="${order.product_image}" alt="" width="72" height="72" style="border-radius:8px;object-fit:cover;background:#e5e7eb;" />` : ""}
            <div>
              <h3 style="margin:0;font-size:15px;font-weight:600;color:#111;">${order.product_title}</h3>
              ${order.variante_nombre ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Variante: ${order.variante_nombre}</p>` : ""}
              ${order.talle ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Talle: ${order.talle}</p>` : ""}
              <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#111;">${priceDisplay} × ${order.cantidad}</p>
            </div>
          </div>

          ${
            order.admin_notas
              ? `<div style="background:#fffbebf0;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:#92400e;">
                  <strong>Nota de la tienda:</strong>
                  <p style="margin:4px 0 0;line-height:1.4;">${order.admin_notas}</p>
                </div>`
              : ""
          }

          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
            Si tenés alguna consulta adicional, podés responder directamente a este email y te responderemos a la brevedad.
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
    config.intro,
    "",
    `Producto: ${order.product_title}`,
    order.variante_nombre ? `Variante: ${order.variante_nombre}` : "",
    order.talle ? `Talle: ${order.talle}` : "",
    `Precio: ${priceDisplay}`,
    `Cantidad: ${order.cantidad}`,
    order.admin_notas ? `Nota de la tienda: ${order.admin_notas}` : "",
    "",
    `Gracias por confiar en ${shop}.`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export async function sendEncargoStatusEmail(
  order: EncargoOrder
): Promise<{ ok: boolean; error?: string }> {
  if (!order?.cliente_email) {
    console.warn(`[encargos-email] Encargo ${order?.id} sin cliente_email; se omite envío.`);
    return { ok: false, error: "Cliente sin email" };
  }

  const resend = getResend();
  if (!resend) {
    console.warn("[encargos-email] RESEND_API_KEY no configurado");
    return { ok: false, error: "RESEND_API_KEY no configurado" };
  }

  const { subject, html, text } = buildEncargoStatusEmailHtml(order);

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: order.cliente_email,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error(`[encargos-email] Error enviando cambio de estado a ${order.cliente_email}:`, result.error.message);
      return { ok: false, error: result.error.message };
    }

    console.log(`[encargos-email] Estado (${order.estado}) enviado a ${order.cliente_email} (id=${result.data?.id})`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error enviando email";
    console.error("[encargos-email] Excepción en cambio de estado:", err);
    return { ok: false, error: msg };
  }
}
