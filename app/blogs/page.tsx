export const dynamic = "force-dynamic";
import { getBlogs } from "@/lib/data-fetcher";
import BlogsClient from "./BlogsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Hardware Guides | Jinnah Hardware Store",
  description: "Read expert articles, installation guides, and modern architectural hardware trends from Jinnah Hardware Store Pakistan.",
  alternates: {
    canonical: "https://jinnah-hardwarestore.com/blogs",
  },
  openGraph: {
    title: "Blogs & Hardware Guides | Jinnah Hardware Store",
    description: "Read expert articles, installation guides, and modern architectural hardware trends.",
    url: "https://jinnah-hardwarestore.com/blogs",
    siteName: "Jinnah Hardware Store",
    images: [{ url: "/jinnah-bottom.png", width: 1200, height: 630, alt: "Blogs & Hardware Guides - Jinnah Hardware Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogs & Hardware Guides | Jinnah Hardware Store",
    description: "Read expert articles, installation guides, and modern architectural hardware trends.",
    images: ["/jinnah-bottom.png"],
  },
};

export default async function BlogsServerPage() {
  const blogs = await getBlogs();
  const publishedBlogs = blogs.filter((b: any) => b.published !== false);
  const siteUrl = "https://jinnah-hardwarestore.com";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blogs",
        "item": `${siteUrl}/blogs`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BlogsClient initialBlogs={publishedBlogs} />
    </>
  );
}

