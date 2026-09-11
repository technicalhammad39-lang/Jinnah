import { getProductBySlug, getProducts } from "@/lib/data-fetcher";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStockInfo } from "@/lib/inventory-engine";
import { getPublicUploadUrl } from "@/lib/utils";

const siteUrl = "https://jinnah-hardwarestore.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found | Jinnah Hardware Store",
      description: "The requested hardware product is not available in our catalog.",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${siteUrl}/shop/${product.slug || slug}`;
  const rawImg = product.images?.[0];
  const resolvedPath = rawImg ? getPublicUploadUrl(rawImg) : null;
  const imageUrl = resolvedPath
    ? (resolvedPath.startsWith("http") ? resolvedPath : `${siteUrl}${resolvedPath}`)
    : `${siteUrl}/jinnah-bottom.png`;

  const brandPrefix = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())
    ? ` by ${product.brand}`
    : "";

  const title = `${product.name}${brandPrefix} | Jinnah Hardware Store`;
  const description = product.shortDescription
    ? product.shortDescription.slice(0, 160)
    : product.description
    ? product.description.slice(0, 160)
    : `Shop ${product.name}${brandPrefix}${product.category ? ` from ${product.category}` : ""} at Jinnah Hardware Store. View specifications, available options, pricing, and order online in Pakistan.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand,
      product.category,
      "Jinnah Hardware Store",
      "Architectural Hardware",
      "Hardware Pakistan",
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Jinnah Hardware Store",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${product.name} - Jinnah Hardware Store`,
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const stockInfo = getStockInfo(product);
  const isAvailable = stockInfo?.isAvailable;

  const productImages = product.images && product.images.length > 0
    ? product.images.map((img: string) => {
        const p = getPublicUploadUrl(img);
        return p.startsWith("http") ? p : `${siteUrl}${p}`;
      })
    : [`${siteUrl}/jinnah-bottom.png`];

  const sellingPrice = product.salePrice && product.salePrice < product.price 
    ? product.salePrice 
    : product.price;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": productImages,
    "description": product.shortDescription || product.description || product.name,
    "url": `${siteUrl}/shop/${product.slug || slug}`,
  };

  if (product.sku) {
    jsonLd.sku = String(product.sku);
  }

  if (product.gtin) {
    jsonLd.gtin = String(product.gtin);
  }

  if (product.mpn) {
    jsonLd.mpn = String(product.mpn);
  }

  if (product.category) {
    jsonLd.category = product.category;
  }

  if (product.brand) {
    jsonLd.brand = {
      "@type": "Brand",
      "name": product.brand,
    };
  }

  if (product.reviewCount && product.reviewCount > 0 && product.rating && product.rating > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Number(product.rating).toFixed(1),
      "reviewCount": Number(product.reviewCount),
    };
  }

  jsonLd.offers = {
    "@type": "Offer",
    "url": `${siteUrl}/shop/${product.slug || slug}`,
    "priceCurrency": "PKR",
    "price": sellingPrice,
    "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    "itemCondition": "https://schema.org/NewCondition",
    "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": "Jinnah Hardware Store",
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "PK",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 7,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn",
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": String(product.shippingFee || 200),
        "currency": "PKR",
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "PK",
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 2,
          "maxValue": 5,
          "unitCode": "DAY",
        },
      },
    },
  };

  const breadcrumbElements: Array<{ "@type": string; position: number; name: string; item: string }> = [
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
  ];

  if (product.category) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": product.category,
      "item": `${siteUrl}/shop?category=${encodeURIComponent(product.category.toLowerCase())}`,
    });
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 4,
      "name": product.name,
      "item": `${siteUrl}/shop/${product.slug || slug}`,
    });
  } else {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": product.name,
      "item": `${siteUrl}/shop/${product.slug || slug}`,
    });
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailClient initialProduct={product} allProducts={allProducts} />
    </>
  );
}
