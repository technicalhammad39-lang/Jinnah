"use client";

import { CATEGORIES } from "@/data/products";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function CategorySection() {
  return (
    <section id="categories-section" className="pt-16 pb-8 md:pt-24 md:pb-12 max-w-[1740px] mx-auto px-6 md:px-8 xl:px-12 relative z-10">
      {/* Background Accent */}
      <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.25]" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-4">
        <div className="space-y-4 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Browse Collections</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] max-w-2xl leading-[0.95]">
            Everything For Your <br />
            <span className="text-primary font-stylish text-[1.1em]">Next Big Project</span>
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
            <div
              key={category.id}
              className={`${gridSpanClass} h-[280px] md:h-[380px] rounded-3xl overflow-hidden relative group border border-black/5 bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-500 premium-transform`}
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
                <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-end text-left overflow-hidden">
                  <div className="flex items-end justify-between w-full relative z-30">
                    <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-20 lg:group-hover:-translate-y-[6.5rem] max-w-[80%]">
                      <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase block mb-1">
                        {category.count} Products
                      </span>
                      <h3 className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-tight leading-tight">
                        {category.name}
                      </h3>
                    </div>
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-primary group-hover:text-white text-white backdrop-blur-md transition-all duration-500 shrink-0 relative z-30">
                      <ArrowUpRight className="h-5 w-5 group-hover:rotate-45 transition-transform duration-500" />
                    </div>
                  </div>

                  <p className="absolute bottom-6 md:bottom-8 left-6 md:left-8 pr-16 text-xs md:text-sm text-white/80 font-medium leading-relaxed max-w-sm opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform translate-y-6 group-hover:translate-y-0 pointer-events-none line-clamp-3">
                    {category.description}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
