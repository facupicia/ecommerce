import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plugrosario.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "plug🔌 — Tienda de ropa",
    template: "%s | plug🔌",
  },
  description: "Ropa importada premium. El mejor style streetwear desde Rosario a todo el país.",
  keywords: ["ropa importada", "streetwear rosario", "ropa streetwear", "tienda ropa argentina", "plug", "theplug rosario"],
  authors: [{ name: "plug" }],
  creator: "plug",
  publisher: "plug",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "plug",
    title: "plug — Rosario, Argentina",
    description: "Ropa importada premium. El mejor style streetwear desde Rosario a todo el país.",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "plug Rosario",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "plug — Rosario, Argentina",
    description: "Ropa importada premium. El mejor style streetwear desde Rosario a todo el país.",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>{children}</body>
    </html>
  );
}
