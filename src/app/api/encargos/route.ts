import { supabaseAdmin } from "@/lib/supabase";
import type { EncargoProduct, EncargoProductVariant } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let query = supabaseAdmin
      .from("encargos_products")
      .select("*")
      .eq("activo", true)
      .order("synced_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Parse variants from JSON string if needed
    const products: EncargoProduct[] = (data || []).map((p: Record<string, unknown>) => ({
      ...p,
      variants: typeof p.variants === "string" ? JSON.parse(p.variants as string) : (p.variants || []),
    })) as EncargoProduct[];

    // Get unique categories for filters
    const { data: catData } = await supabaseAdmin
      .from("encargos_products")
      .select("category")
      .eq("activo", true)
      .not("category", "is", null);

    const categories = [...new Set((catData || []).map((c: { category: string }) => c.category))].sort();

    return Response.json({ products, categories, count: products.length });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
