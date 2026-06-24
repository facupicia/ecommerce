import { createHmac, timingSafeEqual } from "crypto";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export function getMercadoPagoAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return token;
}

export function getMercadoPagoClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: getMercadoPagoAccessToken() });
}

export function getMercadoPagoPreference(): Preference {
  return new Preference(getMercadoPagoClient());
}

export function getMercadoPagoPayment(): Payment {
  return new Payment(getMercadoPagoClient());
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://theplug.com.ar";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Verifica la firma HMAC-SHA256 que Mercado Pago envía en el header
 * `x-signature` para webhooks.
 *
 * Formato del header: timestamp=<ts>,signature=<sig>
 * Template a hashear: `<timestamp>.<dataId>`
 */
export function verifyMercadoPagoSignature(
  signatureHeader: string | null,
  dataId: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !dataId || !secret) return false;

  const parts = signatureHeader.split(",").map((p) => p.trim());
  const timestampPart = parts.find((p) => p.startsWith("timestamp="));
  const signaturePart = parts.find((p) => p.startsWith("signature="));

  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.split("=")[1];
  const signature = signaturePart.split("=")[1];

  if (!timestamp || !signature) return false;

  const template = `${timestamp}.${dataId}`;
  const expected = createHmac("sha256", secret).update(template).digest("hex");

  try {
    return timingSafeEqualString(expected, signature);
  } catch {
    return false;
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
