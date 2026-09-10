import { MetadataRoute } from 'next';
import { getProducts, getBlogs, getBrands } from '@/lib/data-fetcher';
import { CATEGORIES } from '@/data/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jinnah-hardwarestore.com';

  const [products, blogs, brands] = await Promise.all([
    getProducts(),
    getBlogs(),
    getBrands(),
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
    // Policy & Trust Pages (important for Google Merchant & TrustRank)
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/shipping-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/return-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/warranty`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Category routes (boost search rankings for queries like "architectural hardware hasilpur")
  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}/shop?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Brand routes
  const brandUrls: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${baseUrl}/shop?brand=${encodeURIComponent(brand.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // All individual products (Amazon/Daraz level product indexing)
  const productUrls: MetadataRoute.Sitemap = products.map((product) => {
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
    .filter((b: any) => b.published !== false)
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

