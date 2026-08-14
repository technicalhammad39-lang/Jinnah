"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Tag, Share2 } from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";

export default function BlogDetailClient({ initialBlog }: { initialBlog: any }) {
  const router = useRouter();
  const [blog, setBlog] = useState<any>(initialBlog);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialBlog) {
      router.push("/blogs");
    }
  }, [initialBlog, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* HERO SECTION */}
        <div className="relative w-full pt-24 lg:pt-32 pb-16 px-6">
          <div className="max-w-[1000px] mx-auto text-center relative z-10">
            <Link 
              href="/blogs"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Journal</span>
            </Link>

            <div className="flex items-center justify-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-primary mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                <Tag className="h-3 w-3" />
                {blog.category || "Uncategorized"}
              </span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{blog.createdAt ? new Date(blog.createdAt.seconds ? blog.createdAt.toDate() : blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently"}</span>
              </div>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#1a1917] leading-tight mb-8"
            >
              {blog.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 text-sm font-bold text-muted-foreground"
            >
              <span className="w-8 h-[2px] bg-primary/30 rounded-full" />
              <span>By {blog.author || "Jinnah Hardware"}</span>
              <span className="w-8 h-[2px] bg-primary/30 rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* COVER IMAGE */}
        {blog.coverImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="w-full max-w-[1200px] mx-auto px-6 mb-16"
          >
            <div className="relative w-full aspect-[21/9] md:aspect-[2.5/1] rounded-[2rem] overflow-hidden shadow-2xl border border-black/5 bg-black/5">
              <Image 
                src={getPublicUploadUrl(blog.coverImage)} 
                alt={blog.title} 
                fill 
                className="object-cover" 
                priority
              />
            </div>
          </motion.div>
        )}

        {/* CONTENT */}
        <div className="max-w-[800px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[#1a1917] prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl prose-img:shadow-lg prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-[#1a1917]"
            dangerouslySetInnerHTML={{ __html: (blog.content || "").replace(/src="([^"]+)"/g, (match: string, p1: string) => `src="${getPublicUploadUrl(p1)}"`) }}
          />

          {/* SHARE FOOTER */}
          <div className="mt-16 pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Share this article:</span>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors" title="Copy Link">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Link 
              href="/blogs"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full"
            >
              <span>More Articles</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
