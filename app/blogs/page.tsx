export const dynamic = "force-dynamic";
import { getBlogs } from "@/lib/data-fetcher";
import BlogsClient from "./BlogsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & News | Jinnah Hardware Store",
  description: "Read our latest articles, guides, and news about hardware and architecture.",
};

export default async function BlogsServerPage() {
  const blogs = await getBlogs();
  const publishedBlogs = blogs.filter((b: any) => b.published !== false);

  return <BlogsClient initialBlogs={publishedBlogs} />;
}

