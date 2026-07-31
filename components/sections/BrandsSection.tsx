"use client";

import { BRANDS } from "@/data/products";
import { motion } from "motion/react";
import Image from "next/image";

export function BrandsSection() {
  // We'll create a duplicated array of brands to create a seamless infinite loop
  const marqueeItemsRow1 = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];
  const marqueeItemsRow2 = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].reverse();

  const PLACEHOLDER_IMAGES = [
    "/1-hardware.jpg",
    "/2-lock.avif",
    "/3-kitchen.jpg",
    "/4-sheat.png",
    "/beeding.png",
    "/hero-bottom.png"
  ];

  return (
    <section id="brands-section" className="py-16 md:py-24 w-full overflow-hidden relative z-10 bg-[#faf9f6]">
      <div className="absolute bottom-[10%] left-[5%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.1]" />

      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4 px-6 relative z-10">
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

      {/* Marquee Container */}
      <div className="flex flex-col gap-8 relative z-10 w-full">
        {/* Row 1 - Scrolling Left */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap min-w-max pr-8"
            animate={{ x: [0, -1035] }} // Adjust based on item widths
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
          >
            {marqueeItemsRow1.map((brand, index) => (
              <div
                key={`r1-${brand.id}-${index}`}
                className="w-[280px] h-[120px] rounded-2xl bg-white border border-black/5 flex items-center justify-center p-6 shadow-sm hover:border-primary/20 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <Image
                  src={PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl font-black text-[#1a1917] opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all uppercase tracking-tighter mix-blend-overlay">
                    {brand.name}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 - Scrolling Right */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap min-w-max pr-8"
            initial={{ x: -1035 }}
            animate={{ x: 0 }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {marqueeItemsRow2.map((brand, index) => (
              <div
                key={`r2-${brand.id}-${index}`}
                className="w-[280px] h-[120px] rounded-2xl bg-white border border-black/5 flex items-center justify-center p-6 shadow-sm hover:border-primary/20 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <Image
                  src={PLACEHOLDER_IMAGES[(index + 3) % PLACEHOLDER_IMAGES.length]}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl font-black text-[#1a1917] opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all uppercase tracking-tighter mix-blend-overlay">
                    {brand.name}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
