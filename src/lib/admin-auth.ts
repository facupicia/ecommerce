import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_token";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export async function isAdminFromCookies(): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === ADMIN_PASSWORD;
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export const isAdminError = { error: "No autorizado" };
