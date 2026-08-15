"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Tag, ChevronRight } from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";
import { DustParticles } from "@/components/hero/DustParticles";

export default function BlogsClient({ initialBlogs = [] }: { initialBlogs: any[] }) {
  const [blogs, setBlogs] = useState<any[]>(initialBlogs);
  const [loading, setLoading] = useState(false);



  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-24">
        {/* HERO SECTION */}
        <section className="relative px-6 py-12 md:py-16 text-center overflow-hidden">
          {/* Top Orange Dotted Gradient */}
          <div 
            className="absolute top-0 left-0 right-0 h-full pointer-events-none -z-10" 
            style={{
              backgroundImage: 'radial-gradient(circle at center, #FF6A2A 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px',
              opacity: 0.3,
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            }}
          />
          <div className="noise-texture absolute inset-0 opacity-100 mix-blend-overlay pointer-events-none -z-10" />
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <DustParticles />
          </div>
          <div className="max-w-[1740px] mx-auto space-y-6 relative z-10">
            {/* Side Glows */}
            <div className="absolute top-1/2 left-0 md:left-10 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10" />
            <div className="absolute top-1/2 right-0 md:right-10 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          {/* Left Shape */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute left-0 top-0 bottom-0 w-[150px] md:w-[250px] lg:w-[400px] z-0 pointer-events-none -translate-x-[30%] opacity-60 rotate-12"
          >
            <Image src="/hero-shape.svg" alt="Shape Left" fill className="object-contain object-left scale-x-[-1]" priority />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter text-foreground leading-none"
          >
            Our <span className="text-primary font-stylish normal-case text-[1.1em]">Blogs</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Insights, architecture trends, and updates from the world of premium hardware.
          </motion.p>
          </div>
        </section>

        {/* BLOGS GRID */}
        <section className="max-w-[1740px] mx-auto px-6 md:px-8 xl:px-12 mt-8 md:mt-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, idx) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <Link href={`/blogs/${blog.slug || blog.id}`} className="block relative h-64 overflow-hidden bg-black/5">
                    {blog.coverImage ? (
                      <Image 
                        src={getPublicUploadUrl(blog.coverImage)} 
                        alt={blog.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Image src="/hero-shape.svg" alt="Placeholder" width={100} height={100} className="opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-primary shadow-sm backdrop-blur-md">
                        <Tag className="h-3 w-3" />
                        {blog.category || "Uncategorized"}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-col flex-1 p-6 md:p-8">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{blog.createdAt ? new Date(blog.createdAt.seconds ? blog.createdAt.toDate() : blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}</span>
                      </div>
                      {blog.author && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-black/20" />
                          <span>By {blog.author}</span>
                        </>
                      )}
                    </div>
                    
                    <Link href={`/blogs/${blog.slug || blog.id}`}>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-[#1a1917] mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3 mb-6 flex-1">
                      {blog.excerpt || "Read more about this topic..."}
                    </p>

                    <Link 
                      href={`/blogs/${blog.slug || blog.id}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1a1917] group-hover:text-primary transition-colors mt-auto"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>No blogs found at this time.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
