"use client";

import { BRANDS } from "@/data/products";
import { motion } from "motion/react";
import { ArrowUpRight, Shield, Award, Sparkles, Drill } from "lucide-react";
import Link from "next/link";

export function BrandsSection() {
  return (
    <section id="brands-section" className="py-24 md:py-32 max-w-7xl mx-auto px-6 relative z-10">
      <div className="absolute bottom-[10%] left-[5%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.2]" />

      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>Global Alliances</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
          Trusted <span className="text-primary">Brands We Carry</span>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          We partner exclusively with top-tier global manufacturers representing Italian luxury design, German extreme durability, and revolutionary biometric technology.
        </p>
      </div>

      {/* Grid Layout of Premium Brand Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BRANDS.map((brand, index) => {
          // Select beautiful icons based on brand theme
          let BrandIcon = Award;
          if (brand.id === "krypter") BrandIcon = Shield;
          if (brand.id === "aurum") BrandIcon = Sparkles;
          if (brand.id === "apex") BrandIcon = Drill;

          return (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              key={brand.id}
              className="group relative p-8 rounded-3xl bg-white border border-black/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 text-left flex flex-col justify-between h-[240px]"
            >
              <div>
                {/* Logo Badge & Icon Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black/[0.03] group-hover:bg-primary/5 flex items-center justify-center text-primary text-xl font-black font-mono transition-colors duration-500">
                      {brand.logoText}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-foreground uppercase tracking-tight group-hover:text-primary transition-colors duration-300">
                        {brand.name}
                      </h3>
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
                        Certified Partner
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/[0.02] text-muted-foreground group-hover:text-primary transition-colors">
                    <BrandIcon className="h-5 w-5" />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-2">
                  {brand.description}
                </p>
              </div>

              {/* Supported Categories as chips */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-black/[0.03]">
                {brand.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/5 text-black/60 group-hover:bg-primary/5 group-hover:text-primary transition-colors duration-500"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
