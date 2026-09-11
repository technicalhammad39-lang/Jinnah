import { MetadataRoute } from 'next';
import { getProducts, getBlogs, getBrands, getCategories } from '@/lib/data-fetcher';
import { CATEGORIES } from '@/data/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jinnah-hardwarestore.com';

  const [products, blogs, brands, dbCategories] = await Promise.all([
    getProducts(),
    getBlogs(),
    getBrands(),
    getCategories(true),
  ]);

  // All core store pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.75 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    // Policy & Trust Pages
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/shipping-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/return-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/warranty`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Dynamic Categories - combine DB categories with fallback definitions without duplicates
  const categoryMap = new Map<string, string>();
  CATEGORIES.forEach((c) => {
    if (c.slug) categoryMap.set(c.slug.toLowerCase(), c.slug);
  });
  dbCategories.forEach((c) => {
    const slug = (c.slug || c.name || "").toLowerCase().replace(/\s+/g, '-');
    if (slug) categoryMap.set(slug, slug);
  });

  const categoryUrls: MetadataRoute.Sitemap = Array.from(categoryMap.values()).map((slug) => ({
    url: `${baseUrl}/shop?category=${encodeURIComponent(slug)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Dynamic Brands
  const brandUrls: MetadataRoute.Sitemap = brands
    .map((brand) => brand.brandName || brand.name)
    .filter(Boolean)
    .map((name) => ({
      url: `${baseUrl}/shop?brand=${encodeURIComponent(String(name).toLowerCase().replace(/\s+/g, '-'))}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // All individual products
  const productUrls: MetadataRoute.Sitemap = products
    .filter((p) => p && (p.slug || p.id))
    .map((product) => {
      const lastMod = product.updatedAt
        ? new Date(product.updatedAt)
        : product.createdAt
        ? new Date(product.createdAt)
        : new Date();

      return {
        url: `${baseUrl}/shop/${product.slug || product.id}`,
        lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
        changeFrequency: 'daily',
        priority: 0.9,
      };
    });

  // All published blog articles
  const blogUrls: MetadataRoute.Sitemap = blogs
    .filter((b: any) => b && b.published !== false && (b.slug || b.id))
    .map((blog) => {
      const lastMod = blog.updatedAt
        ? new Date(blog.updatedAt)
        : blog.createdAt
        ? new Date(blog.createdAt)
        : new Date();

      return {
        url: `${baseUrl}/blogs/${blog.slug || blog.id}`,
        lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });

  return [...staticRoutes, ...categoryUrls, ...brandUrls, ...productUrls, ...blogUrls];
}

