import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // Return token so client can set cookie
    return NextResponse.json({ ok: true, token: ADMIN_PASSWORD });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
