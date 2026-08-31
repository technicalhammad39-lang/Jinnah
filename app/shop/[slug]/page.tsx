import { getProductBySlug, getProducts } from "@/lib/data-fetcher";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const siteUrl = "https://jinnah-hardwarestore.com";
  const canonicalUrl = `${siteUrl}/shop/${slug}`;
  const imageUrl = product.images?.[0] ? `${siteUrl}/node/uploads/${product.images[0]}` : undefined;

  return {
    title: `${product.name} | Jinnah Hardware Store`,
    description: product.description || "View details for this premium hardware product at Jinnah Hardware Store.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.name,
      description: product.description || "View details for this premium hardware product at Jinnah Hardware Store.",
      url: canonicalUrl,
      siteName: "Jinnah Hardware Store",
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 800,
          height: 1000,
          alt: product.name,
        }
      ] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || "View details for this premium hardware product at Jinnah Hardware Store.",
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const allProducts = await getProducts(); // For related products

  const siteUrl = "https://jinnah-hardwarestore.com";

  const jsonLd = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map((img: string) => `${siteUrl}/node/uploads/${img}`) || [],
    "description": product.description || product.name,
    "sku": product.id,
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Jinnah Hardware"
    },
    ...(product.rating > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount || 0
      }
    } : {}),
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/shop/${slug}`,
      "priceCurrency": "PKR",
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Jinnah Hardware Store"
      }
    }
  } : null;

  const breadcrumbLd = product ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": `${siteUrl}/shop`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `${siteUrl}/shop/${slug}`
      }
    ]
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <ProductDetailClient initialProduct={product} allProducts={allProducts} />
    </>
  );
}
