import { supabaseAdmin } from "@/lib/supabase";

// GET single product by slug or id
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return Response.json({ error: "ID requerido" }, { status: 400 });

    const { data, error } = await supabaseAdmin.from("shop_products").select("*").eq("id", id).single();
    if (error) return Response.json({ error: error.message }, { status: 404 });
    return Response.json({ product: data });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

// PATCH update product
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return Response.json({ error: "ID requerido" }, { status: 400 });

    const body = await req.json();
    const update: Record<string, unknown> = {};

    // Sanitización por campo
    if (typeof body.slug === "string") {
      const safe = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 100);
      if (safe) update.slug = safe;
    }
    if (typeof body.nombre === "string") update.nombre = body.nombre.slice(0, 200);
    if (typeof body.descripcion === "string") update.descripcion = body.descripcion.slice(0, 5000);
    if (typeof body.categoria === "string") update.categoria = body.categoria.slice(0, 100);
    if (typeof body.marca === "string" || body.marca === null) update.marca = body.marca ? body.marca.slice(0, 50) : null;
    if (typeof body.indumentaria === "string" || body.indumentaria === null) update.indumentaria = body.indumentaria ? body.indumentaria.slice(0, 50) : null;
    if (body.precio_ars !== undefined) update.precio_ars = Math.max(0, Number(body.precio_ars) || 0);
    if (body.precio_original_ars !== undefined) update.precio_original_ars = body.precio_original_ars == null ? null : Math.max(0, Number(body.precio_original_ars));
    if (body.stock !== undefined) update.stock = Math.max(0, parseInt(String(body.stock), 10) || 0);
    if (body.peso_g !== undefined) update.peso_g = Math.max(0, parseInt(String(body.peso_g), 10) || 0);
    if (body.publicado !== undefined) update.publicado = Boolean(body.publicado);
    if (body.cssbuy_oid !== undefined) update.cssbuy_oid = body.cssbuy_oid ? String(body.cssbuy_oid).slice(0, 50) : null;
    if (Array.isArray(body.fotos)) {
      update.fotos = body.fotos.filter((u: unknown) => {
        if (typeof u !== "string") return false;
        try {
          const parsed = new URL(u);
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      });
    }
    if (Array.isArray(body.talles)) {
      update.talles = body.talles.filter((t: unknown) => typeof t === "string").map((t: string) => t.slice(0, 20));
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin.from("shop_products").update(update).eq("id", id).select();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ product: data?.[0] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return Response.json({ error: "ID requerido" }, { status: 400 });

    const { error } = await supabaseAdmin.from("shop_products").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
