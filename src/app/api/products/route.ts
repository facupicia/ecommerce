import { supabaseAdmin } from "@/lib/supabase";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";

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

function sanitizePostgrestOr(q: string): string {
  return q.replace(/"/g, '\\"');
}

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
      const safe = sanitizePostgrestOr(q);
      query = query.or(
        `nombre.ilike.%${safe}%,categoria.ilike.%${safe}%,marca.ilike.%${safe}%,indumentaria.ilike.%${safe}%,cssbuy_oid.ilike.%${safe}%`
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
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const body = await req.json();
    const { id, slug, nombre, descripcion, precio_ars, precio_original_ars, fotos, categoria, stock, publicado, cssbuy_oid, peso_g, marca, indumentaria } = body;

    if (!slug || !nombre) return Response.json({ error: "slug y nombre requeridos" }, { status: 400 });

    // Sanitizar slug: solo minúsculas, números y guiones
    const safeSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 100);
    if (!safeSlug) return Response.json({ error: "slug inválido" }, { status: 400 });

    // Sanitizar fotos: acepta URLs o public IDs de Cloudinary
    const safeFotos = Array.isArray(fotos)
      ? fotos.filter((u: unknown) => {
          if (typeof u !== "string" || !u.trim()) return false;
          if (u.startsWith("http")) {
            try {
              const parsed = new URL(u);
              return parsed.protocol === "https:" || parsed.protocol === "http:";
            } catch {
              return false;
            }
          }
          return true;
        })
      : [];

    const { data, error } = await supabaseAdmin.from("shop_products").insert({
      id: id || undefined,
      slug: safeSlug,
      nombre: String(nombre).slice(0, 200),
      descripcion: String(descripcion || "").slice(0, 5000),
      precio_ars: Math.max(0, Number(precio_ars) || 0),
      precio_original_ars: precio_original_ars != null ? Math.max(0, Number(precio_original_ars)) : null,
      fotos: safeFotos,
      categoria: String(categoria || "").slice(0, 100),
      stock: Math.max(0, parseInt(String(stock), 10) || 0),
      publicado: Boolean(publicado),
      cssbuy_oid: cssbuy_oid ? String(cssbuy_oid).slice(0, 50) : null,
      peso_g: Math.max(0, parseInt(String(peso_g), 10) || 0),
      marca: marca ? String(marca).slice(0, 50) : null,
      indumentaria: indumentaria ? String(indumentaria).slice(0, 50) : null,
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
