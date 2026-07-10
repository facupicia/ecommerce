import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/client-auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/encargos — Listar encargos del usuario autenticado
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));

  let query = supabaseAdmin
    .from("shop_encargos")
    .select("*, producto:shop_products(*)", { count: "exact" })
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (estado) {
    query = query.eq("estado", estado);
  }

  const fromRange = (page - 1) * limit;
  const toRange = fromRange + limit - 1;
  query = query.range(fromRange, toRange);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching encargos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    encargos: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
    },
  });
}

/**
 * POST /api/encargos — Crear un nuevo encargo
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const {
      tipo,
      producto_id,
      imagen_url,
      descripcion,
      categoria,
      talle,
      cantidad,
      precio_total,
    } = body;

    // Validaciones
    if (!tipo || !["catalogo", "personalizado"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo inválido (catalogo o personalizado)" },
        { status: 400 }
      );
    }

    if (!categoria || !talle || !cantidad) {
      return NextResponse.json(
        { error: "Categoría, talle y cantidad son requeridos" },
        { status: 400 }
      );
    }

    if (cantidad < 1) {
      return NextResponse.json(
        { error: "La cantidad debe ser al menos 1" },
        { status: 400 }
      );
    }

    if (tipo === "catalogo" && !producto_id) {
      return NextResponse.json(
        { error: "Para encargo de catálogo, el producto es requerido" },
        { status: 400 }
      );
    }

    if (tipo === "personalizado" && !imagen_url) {
      return NextResponse.json(
        { error: "Para encargo personalizado, la imagen es requerida" },
        { status: 400 }
      );
    }

    // Para catálogo: obtener precio del producto
    let finalPrecio = precio_total || 0;
    if (tipo === "catalogo" && producto_id) {
      const { data: product } = await supabaseAdmin
        .from("shop_products")
        .select("precio_ars")
        .eq("id", producto_id)
        .single();

      if (!product) {
        return NextResponse.json(
          { error: "Producto no encontrado" },
          { status: 404 }
        );
      }
      finalPrecio = product.precio_ars * cantidad;
    }

    // Estado inicial
    const estadoInicial =
      tipo === "catalogo" ? "pendiente" : "pendiente_presupuesto";

    const { data, error } = await supabaseAdmin
      .from("shop_encargos")
      .insert({
        user_id: auth.user.id,
        tipo,
        estado: estadoInicial,
        producto_id: tipo === "catalogo" ? producto_id : null,
        imagen_url: tipo === "personalizado" ? imagen_url : null,
        descripcion: descripcion || null,
        categoria,
        talle,
        cantidad,
        precio_total: finalPrecio,
        presupuesto_enviado: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating encargo:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Registrar en historial
    await supabaseAdmin.from("shop_encargo_status_history").insert({
      encargo_id: data.id,
      estado_anterior: null,
      estado_nuevo: estadoInicial,
      notas: tipo === "personalizado" ? "Esperando presupuesto del admin" : "Encargo creado",
    });

    return NextResponse.json({ encargo: data }, { status: 201 });
  } catch (err) {
    console.error("Error creating encargo:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
