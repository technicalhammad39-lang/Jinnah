import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://jinnah-hardwarestore.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/categories',
          '/brands',
          '/blogs',
          '/about',
          '/contact',
          '/gallery',
          '/uploads/',
          '/_next/static/',
          '/_next/image',
        ],
        disallow: [
          '/admin-cts',
          '/admin-cts/',
          '/api/',
          '/checkout',
          '/checkout/',
          '/cart',
          '/cart/',
          '/account',
          '/account/',
          '/track-order/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

