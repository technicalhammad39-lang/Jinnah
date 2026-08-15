"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";

// Mock Gallery Data
const GALLERY_CATEGORIES = [
  "All",
  "Architecture",
  "Luxury Homes",
  "Commercial Projects",
  "Hotels",
  "Offices",
  "Smart Locks",
  "Brass Hardware",
  "Wood Finishes",
  "Kitchen Accessories",
];

export default function GalleryClient({ initialGallery = [] }: { initialGallery: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Add random heights for masonry effect if not provided
  const processed = initialGallery.map((item, i) => {
    const heights = ["h-[400px]", "h-[300px]", "h-[350px]", "h-[500px]", "h-[250px]"];
    return {
      ...item,
      height: heights[i % heights.length]
    };
  });
  
  const [galleryImages, setGalleryImages] = useState<any[]>(processed);



  const filteredImages = galleryImages.filter(
    (img) => activeCategory === "All" || img.category === activeCategory
  );

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  const currentImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [lightboxIndex]);

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24">
        {/* HERO SECTION */}
        <section className="relative px-6 py-12 md:py-16 max-w-[1740px] mx-auto text-center space-y-6 overflow-hidden">
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

          {/* Right Shape */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute right-0 top-0 bottom-0 w-[150px] md:w-[250px] lg:w-[400px] z-0 pointer-events-none translate-x-[30%] opacity-60 -rotate-12"
          >
            <Image src="/hero-shape.svg" alt="Shape Right" fill className="object-contain object-right scale-x-[-1]" priority />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter text-foreground leading-none"
          >
            Project <span className="text-primary font-stylish normal-case text-[1.1em]">Portfolio</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Explore our curated gallery of luxury installations, showcasing the seamless integration of our premium hardware in elite architectural spaces.
          </motion.p>
        </section>

        {/* CATEGORY FILTERS */}
        <section className="px-6 max-w-[1740px] mx-auto mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#1a1917] text-white shadow-md"
                    : "bg-white border border-black/5 text-muted-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* MASONRY GRID */}
        <section className="px-6 max-w-[1740px] mx-auto">
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {filteredImages.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className={`relative w-full rounded-2xl overflow-hidden group cursor-pointer bg-black/5 break-inside-avoid ${img.height}`}
                  onClick={() => setLightboxIndex(filteredImages.findIndex(i => i.id === img.id))}
                >
                  <Image
                    src={getPublicUploadUrl(img.url || img.src)}
                    alt={img.alt || img.title || "Gallery image"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <ZoomIn className="h-5 w-5" />
                    </div>
                    <p className="text-white text-xs font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      {img.category}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightboxIndex(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[101]"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Previous Button */}
            <button
              className="absolute left-4 md:left-12 p-3 md:p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[101]"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            {/* Next Button */}
            <button
              className="absolute right-4 md:right-12 p-3 md:p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[101]"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage.id}
                initial={{ scale: 0.95, opacity: 0, x: 20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.95, opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full max-w-6xl max-h-[85vh] rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={getPublicUploadUrl(currentImage.url || currentImage.src)}
                  alt={currentImage.alt || currentImage.title || "Gallery image"}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
