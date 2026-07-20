import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/client-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { nombre, telefono, direccion } = await request.json();

    const { error } = await supabaseAdmin
      .from("shop_client_profiles")
      .upsert({
        id: auth.user.id,
        nombre: nombre || "",
        telefono: telefono || "",
        direccion: direccion || "",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { data, error } = await supabaseAdmin
    .from("shop_client_profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data || null });
}
