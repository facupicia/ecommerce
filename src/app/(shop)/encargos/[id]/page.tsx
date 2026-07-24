import { supabaseAdmin } from "@/lib/supabase";
import type { EncargoProduct } from "@/lib/types";
import { EncargoDetailView } from "@/components/shop/EncargoDetailView";
import { getShopSettings } from "@/lib/settings";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EncargoProductDetailPage({ params }: PageProps) {
  const settings = await getShopSettings();
  if (settings.encargosEnabled === false) {
    notFound();
  }

  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("encargos_products")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (!data) {
    notFound();
  }

  const product: EncargoProduct = {
    ...data,
    variants: typeof data.variants === "string" ? JSON.parse(data.variants) : (data.variants || []),
  } as EncargoProduct;

  return <EncargoDetailView product={product} />;
}
