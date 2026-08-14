import { getBlogBySlug } from "@/lib/data-fetcher";
import BlogDetailClient from "./BlogDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: `${blog.title} | Jinnah Hardware Store`,
    description: blog.seoDescription || blog.excerpt || "Read the latest article on Jinnah Hardware Store.",
  };
}

export default async function BlogDetailServerPage({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug);

  return <BlogDetailClient initialBlog={blog} />;
}
