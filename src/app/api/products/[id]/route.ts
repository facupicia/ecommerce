import { supabase } from "@/lib/supabase";

// GET single product by slug or id
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return Response.json({ error: "ID requerido" }, { status: 400 });

    const { data, error } = await supabase.from("shop_products").select("*").eq("id", id).single();
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
    const { data, error } = await supabase.from("shop_products").update(body).eq("id", id).select();
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

    const { error } = await supabase.from("shop_products").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
