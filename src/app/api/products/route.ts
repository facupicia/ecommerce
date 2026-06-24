import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("shop_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    const filtered = (data || []).filter((p) => p.slug !== "__shop_settings__");
    return Response.json({ products: filtered });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, slug, nombre, descripcion, precio_ars, precio_original_ars, fotos, categoria, stock, publicado, cssbuy_oid, peso_g, marca, indumentaria } = body;

    if (!slug || !nombre) return Response.json({ error: "slug y nombre requeridos" }, { status: 400 });

    const { data, error } = await supabaseAdmin.from("shop_products").insert({
      id: id || undefined,
      slug,
      nombre,
      descripcion: descripcion || "",
      precio_ars: precio_ars || 0,
      precio_original_ars: precio_original_ars || null,
      fotos: fotos || [],
      categoria: categoria || "",
      stock: stock || 0,
      publicado: publicado ?? false,
      cssbuy_oid: cssbuy_oid || null,
      peso_g: peso_g || 0,
      marca: marca || null,
      indumentaria: indumentaria || null,
    }).select();

    if (error) {
      if (error.code === "23505") {
        return Response.json({ error: "El slug ya existe" }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ product: data?.[0] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
