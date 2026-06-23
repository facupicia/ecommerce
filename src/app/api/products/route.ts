import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ products: data });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, nombre, descripcion, precio_ars, precio_original_ars, fotos, categoria, stock, publicado, cssbuy_oid, peso_g } = body;
    
    if (!slug || !nombre) return Response.json({ error: "slug y nombre requeridos" }, { status: 400 });

    const { data, error } = await supabase.from("shop_products").upsert({
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
    }, { onConflict: "slug" }).select();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ product: data?.[0] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
