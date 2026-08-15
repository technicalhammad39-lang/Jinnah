import { getProductBySlug, getProducts } from "@/lib/data-fetcher";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Jinnah Hardware Store`,
    description: product.description || "View details for this premium hardware product at Jinnah Hardware Store.",
  };
}

export default async function ProductDetailServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const allProducts = await getProducts(); // For related products

  const jsonLd = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.[0] ? `https://jinnah-hardwarestore.com/node/uploads/${product.images[0]}` : undefined,
    "description": product.description || product.name,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Jinnah Hardware"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://jinnah-hardwarestore.com/shop/${slug}`,
      "priceCurrency": product.currency || "PKR",
      "price": product.price,
      "availability": product.availability === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient initialProduct={product} allProducts={allProducts} />
    </>
  );
}
