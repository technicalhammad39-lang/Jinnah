import { getBlogBySlug } from "@/lib/data-fetcher";
import BlogDetailClient from "./BlogDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: `${blog.title} | Jinnah Hardware Store`,
    description: blog.seoDescription || blog.excerpt || "Read the latest article on Jinnah Hardware Store.",
  };
}

export default async function BlogDetailServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  return <BlogDetailClient initialBlog={blog} />;
}
