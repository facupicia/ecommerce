import { supabaseAdmin } from "@/lib/supabase";
import { isAdminFromCookies, unauthorized } from "@/lib/admin-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "title",
      "price_cny",
      "category",
      "activo",
      "image_urls",
      "desc_images",
      "variants",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from("encargos_products")
      .update(updates)
      .eq("id", id)
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminFromCookies())) return unauthorized();

  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("encargos_products")
      .delete()
      .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
