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

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { data, error } = await supabaseAdmin
      .from("shop_cotizaciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cotizaciones:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const cotizaciones = (data || []).map((row) => mapToClient(row as ShopCotizacion));
    return NextResponse.json({ cotizaciones });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await request.json();
    const { nombre, fx, envio, aduana, productos, resultados } = body;

    if (!nombre || !fx || !envio || !aduana || !productos || !resultados) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("shop_cotizaciones")
      .insert({
        nombre,
        fx,
        envio,
        aduana,
        productos,
        resultados,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving cotizacion:", error);
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
