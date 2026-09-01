import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-cts/'],
    },
    sitemap: 'https://jinnah-hardwarestore.com/sitemap.xml',
  };
}
