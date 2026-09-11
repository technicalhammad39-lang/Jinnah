import { CategoriesClient } from "./CategoriesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hardware Categories - Architectural & Door Fittings | Jinnah Hardware Store",
  description: "Browse hardware by category: architectural hardware, smart locks, door hardware, kitchen fittings, cabinet handles, and tools at Jinnah Hardware Store.",
  alternates: {
    canonical: "https://jinnah-hardwarestore.com/categories",
  },
  openGraph: {
    title: "Hardware Categories | Jinnah Hardware Store",
    description: "Browse architectural hardware, smart locks, door fittings, and kitchen accessories.",
    url: "https://jinnah-hardwarestore.com/categories",
    siteName: "Jinnah Hardware Store",
    images: [{ url: "/jinnah-bottom.png", width: 1200, height: 630, alt: "Hardware Categories - Jinnah Hardware Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hardware Categories | Jinnah Hardware Store",
    description: "Browse hardware by category at Jinnah Hardware Store.",
    images: ["/jinnah-bottom.png"],
  },
};

export default function CategoriesPage() {
  const siteUrl = "https://jinnah-hardwarestore.com";
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
        "name": "Categories",
        "item": `${siteUrl}/categories`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CategoriesClient />
    </>
  );
}
