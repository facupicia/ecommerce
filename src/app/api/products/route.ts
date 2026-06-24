import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_LIST_FIELDS = [
  "id",
  "slug",
  "nombre",
  "categoria",
  "marca",
  "indumentaria",
  "precio_ars",
  "precio_original_ars",
  "stock",
  "publicado",
  "fotos",
  "cssbuy_oid",
  "created_at",
  "updated_at",
].join(",");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "0", 10) || undefined;
    const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;
    const q = searchParams.get("q")?.trim().toLowerCase();
    const publicado = searchParams.get("publicado");
    const fields = searchParams.get("fields");

    // Lightweight list by default for admin; full data only when explicitly requested
    const selectColumns = fields === "all" ? "*" : ADMIN_LIST_FIELDS;

    let query = supabaseAdmin
      .from("shop_products")
      .select(selectColumns, { count: limit ? "exact" : undefined })
      .neq("slug", "__shop_settings__")
      .order("created_at", { ascending: false });

    if (publicado === "true") query = query.eq("publicado", true);
    if (publicado === "false") query = query.eq("publicado", false);

    if (q) {
      query = query.or(
        `nombre.ilike.%${q}%,categoria.ilike.%${q}%,marca.ilike.%${q}%,indumentaria.ilike.%${q}%,cssbuy_oid.ilike.%${q}%`
      );
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) return Response.json({ error: error.message }, { status: 500 });
    const rows = (data || []) as { slug?: string }[];
    const filtered = rows.filter((p) => p.slug !== "__shop_settings__");
    return Response.json({ products: filtered, count: count ?? filtered.length });
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
