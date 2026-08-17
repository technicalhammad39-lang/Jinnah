"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import Script from "next/script";

const CATEGORIES = [
  {
    title: "Doors & Entry",
    slug: "doors-entry",
    items: ["Smart Locks", "Door Handles", "Premium Hinges", "Door Closers"],
  },
  {
    title: "Kitchen",
    slug: "kitchen",
    items: ["Cabinet Handles", "Channels", "Kitchen Accessories", "PVC Sheets"],
  },
  {
    title: "Bedroom",
    slug: "bedroom",
    items: ["Wardrobe Hardware", "Sliding Systems", "Soft Close Fittings", "Cabinet Locks"],
  },
  {
    title: "Office",
    slug: "office",
    items: ["Glass Hardware", "Door Systems", "Security Locks", "Office Accessories"],
  },
  {
    title: "Interior Finishing",
    slug: "interior-finishing",
    items: ["UV Sheets", "Decorative Panels", "Wood Beading", "Wall Profiles"],
  },
  {
    title: "Workshop & Tools",
    slug: "workshop",
    items: ["Power Tools", "Measuring Tools", "Cutting Tools", "Tool Accessories"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Find Products For Every Space",
  description:
    "Discover curated hardware collections for every space — doors, kitchen, bedroom, office, interior finishing, and workshop.",
  hasPart: CATEGORIES.map((cat) => ({
    "@type": "ItemList",
    name: cat.title,
    url: `https://jinnahhardware.com/shop?category=${cat.slug}`,
    itemListElement: cat.items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item,
    })),
  })),
};

export function DiscoverBySpace() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="discover-by-space-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section
        ref={sectionRef}
        id="categories-section"
        aria-labelledby="discover-by-space-heading"
        className="relative pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden bg-transparent z-10"
      >
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[#faf9f6]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[#FF6A2A]/5 blur-[120px]" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-6 md:mb-10 space-y-4">
            <motion.h2
              id="discover-by-space-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-[#1a1917] leading-[1.05]"
            >
              Everything For{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A2A] to-[#FF9A55] font-stylish normal-case text-[1.1em]">
                Your Project
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto"
            >
              Whether you&apos;re building a new home, renovating a kitchen, upgrading office interiors,
              or completing a commercial project, discover carefully curated hardware collections
              designed for every environment.
            </motion.p>
          </div>

          {/* SVG Cards — Premium Animated Integration */}
          <motion.div
            ref={svgRef}
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
              duration: 1.1,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative w-full will-change-transform"
            style={{ filter: isInView ? "none" : "blur(4px)" }}
          >
            {/* Ambient orange glow behind SVG */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[10%] top-[10%] bottom-[10%] rounded-[3rem] opacity-20 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(255,106,42,0.35) 0%, transparent 70%)",
              }}
            />

            {/* The SVG as a responsive image — preserves exact design */}
            <div
              className="relative w-full"
              style={{ aspectRatio: "7852 / 2471" }}
            >
              <Image
                src="/catos.svg"
                alt="Product categories for every space: Doors & Entry, Kitchen, Bedroom, Office, Interior Finishing, and Workshop"
                fill
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1600px"
                className="object-contain select-none"
                style={{ imageRendering: "crisp-edges" }}
              />
            </div>
          </motion.div>

          {/* SEO Semantic HTML — Visually hidden but fully crawlable */}
          <div className="sr-only" aria-label="Product categories">
            {CATEGORIES.map((cat) => (
              <article key={cat.slug}>
                <h3>{cat.title}</h3>
                <ul>
                  {cat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a href={`/shop?category=${cat.slug}`}>
                  Explore {cat.title} Collection
                </a>
              </article>
            ))}
          </div>

          {/* Mobile CTA — shown only on small screens for accessibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap justify-center gap-3 md:hidden"
          >
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6A2A]/30 bg-[#FF6A2A]/5 px-4 py-2 text-xs font-bold text-[#FF6A2A] transition-all hover:bg-[#FF6A2A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A2A]"
              >
                {cat.title}
              </a>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
