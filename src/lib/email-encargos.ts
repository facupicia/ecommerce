import { Resend } from "resend";
import { supabaseAdmin } from "./supabase";
import type { ShopEncargo } from "./types";

export type EncargoEmailType =
  | "encargo_creado"
  | "encargo_presupuesto"
  | "encargo_confirmado"
  | "encargo_en_camino"
  | "encargo_listo"
  | "encargo_entregado"
  | "encargo_cancelado"
  | "encargo_recordatorio_pago";

interface SendEncargoEmailParams {
  encargo: ShopEncargo & { cliente_nombre?: string };
  to: string;
  type: EncargoEmailType;
}

const TYPE_CONFIG: Record<
  EncargoEmailType,
  {
    subject: string;
    emoji: string;
    intro: string;
    tone: "good" | "bad" | "info";
  }
> = {
  encargo_creado: {
    subject: "Encargo recibido",
    emoji: "📋",
    intro: "Recibimos tu encargo correctamente. Te avisamos cuando haya novedades.",
    tone: "info",
  },
  encargo_presupuesto: {
    subject: "Presupuesto listo",
    emoji: "💰",
    intro:
      "Ya tenemos el presupuesto de tu encargo. Revisalo y decidí si querés avanzar.",
    tone: "info",
  },
  encargo_confirmado: {
    subject: "Encargo confirmado",
    emoji: "✅",
    intro:
      "Confirmamos tu encargo. Ya lo estamos preparando para la importación.",
    tone: "good",
  },
  encargo_en_camino: {
    subject: "Tu encargo está en camino",
    emoji: "📦",
    intro: "¡Buenas noticias! Tu encargo ya está en camino desde China.",
    tone: "good",
  },
  encargo_listo: {
    subject: "Tu encargo está listo",
    emoji: "🎉",
    intro:
      "Tu encargo llegó y está listo para retiro. Coordiná con nosotros.",
    tone: "good",
  },
  encargo_entregado: {
    subject: "Encargo entregado",
    emoji: "✨",
    intro: "Tu encargo fue entregado. ¡Esperamos que lo disfrutes!",
    tone: "good",
  },
  encargo_cancelado: {
    subject: "Encargo cancelado",
    emoji: "❌",
    intro: "Tu encargo fue cancelado. Si tenés dudas, contactanos.",
    tone: "bad",
  },
  encargo_recordatorio_pago: {
    subject: "Recordatorio de pago",
    emoji: "⏰",
    intro:
      "Tu encargo tiene un pago pendiente. Tenés 24 horas para completarlo.",
    tone: "info",
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
  return process.env.SHOP_NAME || "The Plug Rosario";
}

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function formatARS(value: number): string {
  return `$${(value || 0).toLocaleString("es-AR")}`;
}

function buildEncargoEmailHtml(args: {
  encargo: ShopEncargo & { cliente_nombre?: string };
  type: EncargoEmailType;
}): { subject: string; html: string; text: string } {
  const { encargo, type } = args;
  const cfg = TYPE_CONFIG[type];
  const shop = getShopName();
  const siteUrl = getSiteUrl();
  const encargoUrl = `${siteUrl}/cuenta/encargos`;

  const headerColor =
    cfg.tone === "good"
      ? "#10b981"
      : cfg.tone === "bad"
        ? "#ef4444"
        : "#3b82f6";

  const subject = `${cfg.subject} · ${shop} #${encargo.id.slice(0, 8).toUpperCase()}`;

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
          <p style="margin:0 0 8px;font-size:15px;">Hola <strong>${encargo.cliente_nombre || ""}</strong>,</p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.5;">${cfg.intro}</p>

          <div style="background:#f9fafb;border:1px solid #f0f0f0;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#374151;">
            <strong>Encargo:</strong> #${encargo.id.slice(0, 8).toUpperCase()}<br/>
            <strong>Tipo:</strong> ${encargo.tipo === "catalogo" ? "Catálogo" : "Personalizado"}<br/>
            <strong>Categoría:</strong> ${encargo.categoria}<br/>
            <strong>Talle:</strong> ${encargo.talle}<br/>
            <strong>Cantidad:</strong> ${encargo.cantidad}<br/>
            ${
              Number(encargo.precio_total) > 0
                ? `<strong>Total:</strong> ${formatARS(Number(encargo.precio_total))}<br/>
                   <strong>Seña (50%):</strong> ${formatARS(Number(encargo.precio_total) * 0.5)}`
                : ""
            }
          </div>

          ${
            type === "encargo_presupuesto"
              ? `<div style="text-align:center;margin:24px 0 8px;">
                  <a href="${encargoUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Ver presupuesto</a>
                </div>`
              : ""
          }

          ${
            type === "encargo_recordatorio_pago"
              ? `<div style="text-align:center;margin:24px 0 8px;">
                  <a href="${encargoUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Pagar ahora</a>
                </div>`
              : ""
          }

          <p style="margin:24px 0 0;font-size:12px;color:#6b7280;line-height:1.5;">
            Si tenés alguna duda, respondé este email o escribinos por WhatsApp.
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
    `Hola ${encargo.cliente_nombre || ""},`,
    "",
    cfg.intro,
    "",
    `Encargo: #${encargo.id.slice(0, 8).toUpperCase()}`,
    `Tipo: ${encargo.tipo === "catalogo" ? "Catálogo" : "Personalizado"}`,
    `Categoría: ${encargo.categoria}`,
    `Talle: ${encargo.talle}`,
    `Cantidad: ${encargo.cantidad}`,
    Number(encargo.precio_total) > 0
      ? `Total: ${formatARS(Number(encargo.precio_total))}`
      : "",
    "",
    `Ver encargos: ${encargoUrl}`,
    "",
    shop,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

async function logEmail(params: {
  encargoId: string;
  type: EncargoEmailType;
  to: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  providerId?: string | null;
  error?: string | null;
}) {
  try {
    await supabaseAdmin.from("shop_email_logs").insert({
      order_id: params.encargoId,
      tipo: params.type,
      to_email: params.to,
      subject: params.subject,
      provider: "resend",
      provider_id: params.providerId || null,
      status: params.status,
      error: params.error || null,
      metadata: { source: "encargos" },
    });
  } catch (err) {
    console.error("[email] Error guardando log:", err);
  }
}

export async function sendEncargoEmail({
  encargo,
  to,
  type,
}: SendEncargoEmailParams): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurado");
    return { ok: false, skipped: true, error: "RESEND_API_KEY no configurado" };
  }

  const { subject, html, text } = buildEncargoEmailHtml({ encargo, type });

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject,
      html,
      text,
    });

    if (result.error) {
      const errMsg = result.error.message || "Error desconocido de Resend";
      console.error(`[email] Error enviando ${type} a ${to}:`, errMsg);
      await logEmail({
        encargoId: encargo.id,
        type,
        to,
        subject,
        status: "failed",
        error: errMsg,
      });
      return { ok: false, error: errMsg };
    }

    console.log(`[email] ${type} enviado a ${to} (encargo ${encargo.id})`);
    await logEmail({
      encargoId: encargo.id,
      type,
      to,
      subject,
      status: "sent",
      providerId: result.data?.id || null,
    });
    return { ok: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Error enviando email";
    console.error(`[email] Excepción enviando ${type}:`, err);
    await logEmail({
      encargoId: encargo.id,
      type,
      to,
      subject,
      status: "failed",
      error: errMsg,
    });
    return { ok: false, error: errMsg };
  }
}
