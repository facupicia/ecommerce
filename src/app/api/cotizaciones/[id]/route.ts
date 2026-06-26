import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { ShopCotizacion, Cotizacion } from "@/lib/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === ADMIN_PASSWORD;
}

function mapToClient(row: ShopCotizacion): Cotizacion {
  return {
    id: row.id,
    fecha: row.created_at,
    nombre: row.nombre,
    fx: row.fx,
    envio: row.envio,
    aduana: row.aduana,
    productos: row.productos,
    resultados: row.resultados,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data, error } = await supabaseAdmin
      .from("shop_cotizaciones")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching cotizacion:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cotizacion: mapToClient(data as ShopCotizacion) });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { error } = await supabaseAdmin.from("shop_cotizaciones").delete().eq("id", id);

    if (error) {
      console.error("Error deleting cotizacion:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
