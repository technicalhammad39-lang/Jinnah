export function JsonLd() {
  const siteUrl = "https://jinnah-hardwarestore.com";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": `${siteUrl}/`,
        "name": "Jinnah Hardware Store",
        "description": "Pakistan's premium architectural hardware, biometric smart locks, cabinet fittings, and professional tools.",
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${siteUrl}/shop?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "en-PK"
      },
      {
        "@type": ["HardwareStore", "HomeGoodsStore", "Organization"],
        "@id": `${siteUrl}/#organization`,
        "name": "Jinnah Hardware Store",
        "alternateName": ["Jinnah Hardware", "Jinnah Hardware Store Hasilpur"],
        "legalName": "Jinnah Hardware Store",
        "description": "Premium modern hardware showroom and architectural materials partner in Pakistan. Curating solid-brass locksets, biometric smart locks, luxury cabinet handles, and industrial fittings.",
        "url": `${siteUrl}/`,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/jinnah-logo.webp`,
          "width": 500,
          "height": 500
        },
        "image": `${siteUrl}/jinnah-bottom.png`,
        "telephone": "+923000421772",
        "email": "info@hammadgfx.online",
        "priceRange": "PKR",
        "currenciesAccepted": "PKR",
        "paymentAccepted": "Cash on Delivery, Bank Transfer, Online Payment",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Opposite Gulberg Town, Bahawalpur Road",
          "addressLocality": "Hasilpur",
          "addressRegion": "Punjab",
          "postalCode": "63000",
          "addressCountry": "PK"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 29.6974,
          "longitude": 72.5539
        },
        "areaServed": [
          {
            "@type": "Country",
            "name": "Pakistan"
          }
        ],
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ],
            "opens": "09:00",
            "closes": "21:00"
          }
        ],
        "sameAs": [
          "https://wa.me/923000421772"
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

