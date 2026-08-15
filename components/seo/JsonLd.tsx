export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    "name": "Jinnah Hardware Store",
    "description": "Premium architectural and industrial hardware experience. Elite door hardware, security, smart locks, cabinet fittings, and professional power tools.",
    "url": "https://jinnah-hardwarestore.com/",
    "telephone": "+923000421772",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Hardware Bazaar",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 31.5401,
      "longitude": 74.3259
    },
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
