import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("shop_products")
      .select("marca, indumentaria")
      .neq("slug", "__shop_settings__");

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const marcas = new Set<string>();
    const indumentarias = new Set<string>();

    for (const row of data || []) {
      if (row.marca) marcas.add(row.marca);
      if (row.indumentaria) indumentarias.add(row.indumentaria);
    }

    return Response.json({
      marcas: Array.from(marcas).sort(),
      indumentarias: Array.from(indumentarias).sort(),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
