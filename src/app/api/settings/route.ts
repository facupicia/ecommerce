import { NextResponse } from "next/server";
import { getShopSettings, updateShopSettings } from "@/lib/settings";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";

async function isAdmin() {
  return isAdminFromCookies();
}

export async function GET() {
  // Publicly readable so the client-side/middleware can query it if needed, or layout checks
  const settings = await getShopSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: "Configuración requerida" }, { status: 400 });
    }

    const success = await updateShopSettings(settings);
    if (!success) {
      return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
