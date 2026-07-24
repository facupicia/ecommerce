import { supabaseAdmin } from "@/lib/supabase";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";

export async function GET(req: Request) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("encargos_products")
      .select("*", { count: "exact" })
      .order("synced_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,item_id.ilike.%${q}%`);
    }

    if (category) {
      query = query.eq("category", category);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({
      products: data || [],
      count: count || 0,
      page,
      limit,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const body = await req.json();
    const {
      title,
      price_cny,
      category,
      image_urls,
      desc_images,
      variants,
      activo,
    } = body;

    if (!title) {
      return Response.json({ error: "El título es obligatorio" }, { status: 400 });
    }

    const newProduct = {
      scraper_id: Math.floor(Date.now() / 1000), // Random timestamp ID if manual
      source_type: "manual",
      item_id: `manual_${Date.now()}`,
      title,
      price_cny: price_cny != null ? parseFloat(price_cny) : null,
      category: category || null,
      image_urls: image_urls || [],
      desc_images: desc_images || [],
      variants: variants || [],
      activo: activo !== false,
      synced_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("encargos_products")
      .insert(newProduct)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ product: data });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
