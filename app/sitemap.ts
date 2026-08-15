import { MetadataRoute } from 'next';
import { getProducts, getBlogs } from '@/lib/data-fetcher';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jinnah-hardwarestore.com';

  const products = await getProducts();
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/shop/${product.slug || product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogs = await getBlogs();
  const blogUrls = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug || blog.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticRoutes = [
    '',
    '/about',
    '/shop',
    '/blogs',
    '/contact',
    '/gallery',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.9,
  }));

  return [...staticRoutes, ...productUrls, ...blogUrls];
}
