export const dynamic = "force-dynamic";
import { getProducts, getBrands } from "@/lib/data-fetcher";
import ShopClientPage from "./ShopClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Products - Premium Architectural Hardware & Tools | Jinnah Hardware Store",
  description: "Shop Pakistan's premier catalog of architectural door handles, biometric smart locks, luxury cabinet fittings, and professional power tools. Nationwide express delivery.",
  keywords: [
    "Shop Products",
    "Hardware Products Pakistan",
    "Architectural Hardware",
    "Smart Locks Pakistan",
    "Door Handles",
    "Cabinet Handles",
    "Jinnah Hardware Catalog",
  ],
  alternates: {
    canonical: "https://jinnah-hardwarestore.com/shop",
  },
  openGraph: {
    title: "Shop Products | Jinnah Hardware Store",
    description: "Explore our extensive catalog of architectural hardware, biometric smart locks, cabinet fittings, and power tools.",
    url: "https://jinnah-hardwarestore.com/shop",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/jinnah-bottom.png",
        width: 1200,
        height: 630,
        alt: "Shop Products - Jinnah Hardware Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Products | Jinnah Hardware Store",
    description: "Explore our extensive catalog of architectural hardware and biometric smart locks.",
    images: ["/jinnah-bottom.png"],
  },
};

export default async function ShopServerPage() {
  const [products, brands] = await Promise.all([
    getProducts(),
    getBrands(),
  ]);

  const siteUrl = "https://jinnah-hardwarestore.com";

  // ItemList schema for Google Catalog indexing
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Shop Products - Jinnah Hardware Store",
    "description": "Catalog of architectural hardware, smart locks, and tools.",
    "url": `${siteUrl}/shop`,
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 24).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${siteUrl}/shop/${product.slug || product.id}`,
      "name": product.name,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": `${siteUrl}/shop`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ShopClientPage initialProducts={products} initialBrands={brands} />
    </>
  );
}


