import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ShopCotizacion, Cotizacion } from "@/lib/types";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";

async function isAdmin() {
  return isAdminFromCookies();
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
  if (!(await isAdmin())) return unauthorized();

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
  if (!(await isAdmin())) return unauthorized();

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
