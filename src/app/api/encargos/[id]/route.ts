import { supabaseAdmin } from "@/lib/supabase";
import type { EncargoProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("encargos_products")
      .select("*")
      .eq("id", id)
      .eq("activo", true)
      .single();

    if (error || !data) {
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const product: EncargoProduct = {
      ...data,
      variants: typeof data.variants === "string" ? JSON.parse(data.variants) : (data.variants || []),
    } as EncargoProduct;

    return Response.json({ product });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
