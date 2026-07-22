import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";

  // Base paths
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/categorias`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    // Fetch all published products
    const { data: products } = await supabasePublic
      .from("shop_products")
      .select("slug, updated_at")
      .eq("publicado", true);

    if (products) {
      products.forEach((product) => {
        // Exclude internal configurations like settings row if any
        if (product.slug.startsWith("__")) return;

        routes.push({
          url: `${siteUrl}/producto/${product.slug}`,
          lastModified: new Date(product.updated_at || Date.now()),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      });
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
  }

  return routes;
}
