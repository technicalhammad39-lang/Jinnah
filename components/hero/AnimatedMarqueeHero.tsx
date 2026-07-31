"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, MapPin, Store, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: string;
  description: string;
  ctaText: string;
  images: string[];
  className?: string;
}

export function AnimatedMarqueeHero({
  tagline = "QUALITY • TRUST • EVERY PROJECT",
  title = "EVERYTHING YOU NEED. BUILT TO LAST.",
  description = "A premium, architectural-grade selection of custom hardware, smart security systems, cabinet fittings, and professional power tools for builders, contractors, and elite homes.",
  ctaText = "EXPLORE PRODUCTS",
  images = [
    "https://picsum.photos/seed/hwb1/600/800",
    "https://picsum.photos/seed/hwb2/600/800",
    "https://picsum.photos/seed/hwb3/600/800",
    "https://picsum.photos/seed/hwb4/600/800",
    "https://picsum.photos/seed/hwb5/600/800",
    "https://picsum.photos/seed/hwb6/600/800",
    "https://picsum.photos/seed/hwb7/600/800",
    "https://picsum.photos/seed/hwb8/600/800",
  ],
  className,
}: AnimatedMarqueeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax Scroll Effects
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, -70]);
  const opacityText = useTransform(scrollY, [0, 400], [1, 0]);
  const scaleMarquee = useTransform(scrollY, [0, 600], [1, 1.05]);
  const yMarquee = useTransform(scrollY, [0, 600], [0, -30]);

  // Split title into words
  const titleWords = title.split(" ");

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
      },
    },
  };

  const handleVisitStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const mapSection = document.getElementById("contact-section");
    if (mapSection) {
      const offsetTop = mapSection.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Duplicate images for infinite loop
  const duplicatedImages = [...images, ...images, ...images];

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative w-full min-h-screen pt-24 md:pt-32 pb-44 flex flex-col items-center justify-between text-center overflow-hidden bg-transparent",
        className
      )}
    >
      {/* Visual Depth Accents */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[55vw] h-[55vw] rounded-full glow-blob-orange opacity-[0.4]" />

      {/* Content Container */}
      <motion.div
        style={{ y: yText, opacity: opacityText }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center my-auto"
      >
        {/* Animated Tagline Pill */}
        <motion.div
          variants={itemVariants}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4.5 py-1.5 text-[11px] font-extrabold text-primary tracking-widest uppercase shadow-[0_4px_12px_rgba(224,90,43,0.05)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>{tagline}</span>
        </motion.div>

        {/* Headline Word-by-Word Animation */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground uppercase max-w-3xl leading-[0.95] mb-6">
          {titleWords.map((word, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={cn(
                "inline-block mr-3 select-none",
                word.toLowerCase().includes("last") || word.toLowerCase().includes("need")
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80"
                  : "text-[#1a1917]"
              )}
            >
              {word}
            </motion.div>
          ))}
        </h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed font-medium mb-10"
        >
          {description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/shop"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-primary/25 cursor-pointer"
          >
            <span>{ctaText}</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <a
            href="#contact-section"
            onClick={handleVisitStoreClick}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-black/10 hover:border-black/25 text-[#1a1917] hover:bg-black/5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer bg-white/40 backdrop-blur-sm"
          >
            <Store className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
            <span>Visit Our Store</span>
          </a>

          <a
            href="https://maps.google.com/?q=Jinnah+Hardware+Store"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-muted-foreground hover:text-primary uppercase tracking-wider inline-flex items-center gap-1.5 group cursor-pointer transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-primary group-hover:translate-y-[-2px] transition-transform" />
            <span className="border-b border-transparent group-hover:border-primary/30 pb-0.5">
              Get Directions
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all" />
          </a>
        </motion.div>
      </motion.div>

      {/* Interactive, Slanted Horizontal Infinite Image Marquee */}
      <motion.div
        style={{ scale: scaleMarquee, y: yMarquee }}
        className="absolute bottom-4 left-0 w-full h-[220px] md:h-[280px] overflow-hidden pointer-events-auto marquee-mask"
      >
        <div className="absolute inset-0 flex items-center">
          <motion.div
            className="flex gap-6 pl-6 cursor-grab active:cursor-grabbing select-none"
            initial={{ x: "0%" }}
            animate={{ x: ["0%", "-33.333%"] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
            whileHover={{ transition: { duration: 55 } }} // Gentle slowdown on hover
          >
            {duplicatedImages.map((src, index) => {
              // Mathematical alternating rotators and visual depth offsets
              const rot = (index % 3 === 0 ? -2.5 : index % 3 === 1 ? 1.5 : -0.5);
              const heightClass = index % 2 === 0 ? "h-36 md:h-48" : "h-40 md:h-56";
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ 
                    scale: 1.08, 
                    rotate: `${rot * 0.3}deg`,
                    y: -10,
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  className={cn(
                    "relative aspect-[3/4] flex-shrink-0 rounded-2xl md:rounded-[24px] overflow-hidden bg-[#efece6] shadow-lg border border-white/40 backdrop-blur-sm group cursor-pointer transition-shadow hover:shadow-2xl hover:shadow-primary/10",
                    heightClass
                  )}
                  style={{ rotate: `${rot}deg` }}
                  data-cursor="view"
                >
                  <img
                    src={src}
                    alt={`Hardware showcard ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle brand outline glow */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 rounded-[24px] pointer-events-none transition-colors duration-300" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
