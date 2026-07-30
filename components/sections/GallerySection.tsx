"use client";

import { useState } from "react";
import { GALLERY_ITEMS } from "@/data/products";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function GallerySection() {
  const [activeItem, setActiveItem] = useState(GALLERY_ITEMS[0].id);

  return (
    <section id="gallery-section" className="py-24 md:py-32 w-full relative z-10 bg-transparent">
      <div className="absolute bottom-[10%] right-[5%] w-[45vw] h-[45vw] rounded-full glow-blob-orange opacity-[0.1]" />

      <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Interactive Spaces</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
              The Architectural <br />
              <span className="text-primary">Showroom Gallery</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm text-left md:text-right leading-relaxed font-medium">
            Explore our curated hardware deployed in high-end residential, commercial, and industrial projects worldwide.
          </p>
        </div>
      </div>

      {/* Interactive Expandable Panels Gallery (InteractiveSelector Concept) */}
      <div className="w-full px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row h-[700px] lg:h-[600px] w-full max-w-[1400px] mx-auto gap-2 lg:gap-4">
          {GALLERY_ITEMS.map((item) => {
            const isActive = activeItem === item.id;
            
            return (
              <motion.div
                key={item.id}
                className={cn(
                  "relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-700 ease-in-out border border-black/5 bg-[#efece6]",
                  isActive ? "flex-[4] lg:flex-[5]" : "flex-[1] hover:flex-[1.2]"
                )}
                onClick={() => setActiveItem(item.id)}
                onMouseEnter={() => setActiveItem(item.id)}
                layout
              >
                {/* Background Image */}
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover origin-center"
                  initial={{
                    scale: isActive ? 1 : 1.1,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  animate={{
                    scale: isActive ? 1 : 1.1,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                />

                {/* Gradient Overlay for Text Readability */}
                <div 
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t transition-opacity duration-700",
                    isActive 
                      ? "from-black/80 via-black/20 to-transparent opacity-100" 
                      : "from-black/60 to-black/20 opacity-0 lg:opacity-100"
                  )}
                />

                {/* Content Overlay */}
                <motion.div 
                  className={cn(
                    "absolute inset-0 p-6 md:p-8 flex flex-col justify-end transition-opacity duration-500 delay-100",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                >
                  <motion.div 
                    initial={{ 
                      y: isActive ? 0 : 20,
                      opacity: isActive ? 1 : 0
                    }}
                    animate={{ 
                      y: isActive ? 0 : 20,
                      opacity: isActive ? 1 : 0
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-white tracking-widest uppercase mb-4 border border-white/20">
                      {item.category}
                    </div>
                    <div className="flex justify-between items-end gap-4">
                      <div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight leading-[0.95] mb-2 drop-shadow-lg">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/80 leading-relaxed font-medium max-w-lg drop-shadow-md">
                          {item.description}
                        </p>
                      </div>
                      <button className="hidden md:flex h-12 w-12 rounded-full bg-primary items-center justify-center text-white shrink-0 shadow-xl hover:scale-110 transition-transform cursor-pointer">
                        <ArrowUpRight className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Inactive Vertical Title (Desktop Only) */}
                <motion.div 
                  className={cn(
                    "absolute inset-0 p-6 flex flex-col justify-end lg:justify-start items-center transition-opacity duration-300",
                    isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                  )}
                >
                  <h3 className="text-white font-extrabold uppercase tracking-widest text-sm lg:writing-vertical-rl lg:rotate-180 whitespace-nowrap drop-shadow-md">
                    {item.title}
                  </h3>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
