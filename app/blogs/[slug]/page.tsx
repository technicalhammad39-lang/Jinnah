import { getBlogBySlug } from "@/lib/data-fetcher";
import BlogDetailClient from "./BlogDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicUploadUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) {
    return {
      title: "Article Not Found | Jinnah Hardware Store",
      description: "The requested article is not available.",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = "https://jinnah-hardwarestore.com";
  const canonicalUrl = `${siteUrl}/blogs/${slug}`;
  const rawImg = blog.image || blog.coverImage;
  const resolvedPath = rawImg ? getPublicUploadUrl(rawImg) : null;
  const imageUrl = resolvedPath
    ? (resolvedPath.startsWith("http") ? resolvedPath : `${siteUrl}${resolvedPath}`)
    : `${siteUrl}/jinnah-bottom.png`;

  return {
    title: `${blog.title} | Jinnah Hardware Store`,
    description: blog.seoDescription || blog.excerpt || "Read the latest article on Jinnah Hardware Store.",
    keywords: [
      blog.title,
      blog.category || "Hardware Guides",
      "Hardware Tips Pakistan",
      "Architectural Design",
      "Jinnah Hardware Blogs",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${blog.title} | Jinnah Hardware Store`,
      description: blog.seoDescription || blog.excerpt || "Read the latest article on Jinnah Hardware Store.",
      url: canonicalUrl,
      siteName: "Jinnah Hardware Store",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${blog.title} | Jinnah Hardware Store`,
      description: blog.seoDescription || blog.excerpt || "Read the latest article on Jinnah Hardware Store.",
      images: [imageUrl],
    },
  };
}

export default async function BlogDetailServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const siteUrl = "https://jinnah-hardwarestore.com";
  const rawImg = blog?.image || blog?.coverImage;
  const resolvedPath = rawImg ? getPublicUploadUrl(rawImg) : null;
  const imageUrl = resolvedPath
    ? (resolvedPath.startsWith("http") ? resolvedPath : `${siteUrl}${resolvedPath}`)
    : `${siteUrl}/jinnah-bottom.png`;

  const datePublished = blog?.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString();
  const dateModified = blog?.updatedAt ? new Date(blog.updatedAt).toISOString() : datePublished;

  const articleLd = blog ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.seoDescription || blog.excerpt || blog.title,
    "image": [imageUrl],
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": blog.author || "Jinnah Hardware Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jinnah Hardware Store",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/jinnah-logo.webp`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blogs/${slug}`
    }
  } : null;

  const breadcrumbLd = blog ? {
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
        "name": "Blogs",
        "item": `${siteUrl}/blogs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": `${siteUrl}/blogs/${slug}`
      }
    ]
  } : null;

  return (
    <>
      {articleLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <BlogDetailClient initialBlog={blog} />
    </>
  );
}

