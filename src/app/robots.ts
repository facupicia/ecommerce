import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/carrito",
        "/checkout",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
