import { getProductBySlug, getProducts } from "@/lib/data-fetcher";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";
import { getStockInfo } from "@/lib/inventory-engine";
import { getPublicUploadUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found | Jinnah Hardware Store" };

  const siteUrl = "https://jinnah-hardwarestore.com";
  const canonicalUrl = `${siteUrl}/shop/${slug}`;
  const rawImg = product.images?.[0];
  const resolvedPath = rawImg ? getPublicUploadUrl(rawImg) : null;
  const imageUrl = resolvedPath
    ? (resolvedPath.startsWith("http") ? resolvedPath : `${siteUrl}${resolvedPath}`)
    : `${siteUrl}/jinnah-bottom.png`;

  return {
    title: `${product.name} - Buy Online in Pakistan | Jinnah Hardware Store`,
    description: product.shortDescription || product.description || `Buy ${product.name} at best price in Pakistan. Premium quality architectural fittings with nationwide delivery.`,
    keywords: [
      product.name,
      product.brand,
      product.category,
      "Hardware Store Pakistan",
      "Buy Online Pakistan",
      "Architectural Fittings",
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | Jinnah Hardware Store`,
      description: product.shortDescription || product.description || `Buy ${product.name} at best price in Pakistan.`,
      url: canonicalUrl,
      siteName: "Jinnah Hardware Store",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Jinnah Hardware Store`,
      description: product.shortDescription || product.description || `Buy ${product.name} at best price in Pakistan.`,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const allProducts = await getProducts(); // For related products

  const siteUrl = "https://jinnah-hardwarestore.com";
  const stockInfo = product ? getStockInfo(product) : null;

  const productImages = product?.images?.map((img: string) => {
    const p = getPublicUploadUrl(img);
    return p.startsWith("http") ? p : `${siteUrl}${p}`;
  }) || [`${siteUrl}/jinnah-bottom.png`];

  const jsonLd = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": productImages,
    "description": product.shortDescription || product.description || product.name,
    "sku": product.id,
    "mpn": product.id,
    "category": product.category || "Architectural Hardware",
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Jinnah Hardware"
    },
    ...(product.rating > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount || 1
      }
    } : {}),
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/shop/${slug}`,
      "priceCurrency": "PKR",
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": stockInfo?.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Jinnah Hardware Store"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "PK",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "200",
          "currency": "PKR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "PK"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
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
        "name": "Shop Products",
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
