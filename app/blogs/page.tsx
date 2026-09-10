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
    images: [{ url: "/jinnah-bottom.png", width: 1200, height: 630, alt: "Jinnah Hardware Blogs" }],
  },
};

export default async function BlogsServerPage() {
  const blogs = await getBlogs();
  const publishedBlogs = blogs.filter((b: any) => b.published !== false);

  return <BlogsClient initialBlogs={publishedBlogs} />;
}

