import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/client-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  // Obtener perfil
  const { data: profile } = await supabaseAdmin
    .from("shop_client_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      profile: profile || null,
    },
  });
}
