import { NextResponse } from "next/server";
import { ADMIN_PASSWORD } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD no está configurado en el servidor" },
        { status: 500 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // Set httpOnly cookie server-side. El cliente NO manipula el token.
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
