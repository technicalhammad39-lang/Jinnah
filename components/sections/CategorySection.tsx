"use client";

import { CATEGORIES } from "@/data/products";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function CategorySection() {
  return (
    <section id="categories-section" className="py-24 md:py-32 max-w-7xl mx-auto px-6 relative z-10">
      {/* Background Accent */}
      <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.25]" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-4">
        <div className="space-y-4 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Browse Collections</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
            Everything for Your <br className="hidden sm:inline" />
            <span className="text-primary">Next Big Project</span>
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm text-left leading-relaxed font-medium">
          Whether you are a builder drafting high-end residences or a homeowner remodeling cabinet systems, explore our heavy-duty products.
        </p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {CATEGORIES.map((category, index) => {
          // Asymmetric column widths
          // index 0: wide (3 cols), index 1: narrow (3 cols)
          // index 2: small (2 cols), index 3: small (2 cols), index 4: small (2 cols)
          let gridSpanClass = "md:col-span-2";
          if (index === 0) gridSpanClass = "md:col-span-3";
          if (index === 1) gridSpanClass = "md:col-span-3";

          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              key={category.id}
              className={`${gridSpanClass} h-[280px] md:h-[380px] rounded-3xl overflow-hidden relative group border border-black/5 bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-500`}
              data-cursor="view"
            >
              <Link href={`/shop?category=${category.slug}`} className="block w-full h-full relative">
                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Content */}
                <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-end text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase">
                        {category.count} Products
                      </span>
                      <h3 className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-tight mt-1 leading-tight transition-transform duration-500 group-hover:-translate-y-1">
                        {category.name}
                      </h3>
                    </div>
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-primary group-hover:text-white text-white backdrop-blur-md transition-all duration-300">
                      <ArrowUpRight className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </div>

                  <p className="text-xs text-white/70 font-medium leading-relaxed mt-3 max-w-sm line-clamp-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
