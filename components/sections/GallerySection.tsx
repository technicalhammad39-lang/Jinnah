"use client";

// import { GALLERY_ITEMS } from "@/data/products";
import { getGallery } from "@/lib/data-fetcher";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn, getPublicUploadUrl } from "@/lib/utils";

export function GallerySection() {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  useEffect(() => {
    getGallery().then(data => {
      const topItems = data.slice(0, 5); // take max 5 for this section
      setGalleryItems(topItems);
      if (topItems.length > 0) setActiveItem(topItems[0].id);
    });
  }, []);

  if (galleryItems.length === 0) return null;

  return (
    <section id="gallery-section" data-no-premium-reveal className="pt-8 pb-24 md:pt-12 md:pb-32 w-full relative z-10 bg-transparent">
      <div className="absolute bottom-[10%] right-[5%] w-[45vw] h-[45vw] rounded-full glow-blob-orange opacity-[0.1]" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest justify-center">
            <span>Interactive Spaces</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] leading-[0.95]">
            The Architectural{" "}
            <span className="text-primary">Showroom Gallery</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium max-w-xl mx-auto">
            Explore curated hardware deployed in high-end projects worldwide.
          </p>
        </div>
      </div>

      {/* Interactive Expandable Panels Gallery (InteractiveSelector Concept) */}
      <div className="w-full">
        <div className="flex flex-col lg:flex-row h-[700px] lg:h-[600px] xl:h-[700px] w-full max-w-[1920px] mx-auto px-4 sm:px-4 sm:px-6 lg:px-8 gap-2 lg:gap-4">
          {galleryItems.map((item, index) => {
            const isActive = activeItem === item.id;
            
            return (
              <motion.div
                data-gallery-panel
                key={item.id}
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ 
                  duration: 0.7, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className={cn(
                  "relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-700 ease-in-out border border-black/5 bg-[#efece6] premium-transform",
                  isActive ? "flex-[4] lg:flex-[5]" : "flex-[1] hover:flex-[1.2]"
                )}
                onClick={() => setActiveItem(item.id)}
                onMouseEnter={() => setActiveItem(item.id)}
              >
                {/* Background Image */}
                <motion.div
                  className="absolute inset-0 origin-center"
                  initial={{
                    scale: isActive ? 1 : 1.1,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  animate={{
                    scale: isActive ? 1 : 1.1,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Image
                    src={getPublicUploadUrl(item.url || item.image)}
                    alt={item.title || "Gallery Image"}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                </motion.div>

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


              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
