"use client";

import { useApp } from "@/context/AppContext";
import { PRODUCTS } from "@/data/products";
import { Navbar } from "@/components/navigation/Navbar";
import { AnimatedMarqueeHero } from "@/components/hero/AnimatedMarqueeHero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CategorySection } from "@/components/sections/CategorySection";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductShowcase } from "@/components/products/ProductShowcase";
import { BrandsSection } from "@/components/sections/BrandsSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { AboutSection } from "@/components/sections/AboutSection";
import { UseCases } from "@/components/sections/UseCases";
import { GallerySection } from "@/components/sections/GallerySection";
import { MapSection } from "@/components/sections/MapSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";
import { Footer } from "@/components/navigation/Footer";
import { SearchOverlay } from "@/components/navigation/SearchOverlay";
import { CartDrawer } from "@/components/navigation/CartDrawer";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { cartOpen, searchOpen, quickViewProduct } = useApp();

  // Select top 4 products for the Homepage Featured grid
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      
      {/* 1. Global Navigation */}
      <Navbar />

      {/* 2. Elite Animated Marquee Hero */}
      <AnimatedMarqueeHero
        tagline="QUALITY • TRUST • EVERY PROJECT"
        title="EVERYTHING YOU NEED. BUILT TO LAST."
        description="Jinnah Hardware Store represents Pakistani elite craftsmanship. Partnering with top-tier global manufacturers, we supply solid forged brass levers, biometric locksets, and high-performance brushless tool kits."
        ctaText="EXPLORE PRODUCTS"
        images={[
          "https://picsum.photos/seed/hwb1/600/800",
          "https://picsum.photos/seed/hwb2/600/800",
          "https://picsum.photos/seed/hwb3/600/800",
          "https://picsum.photos/seed/hwb4/600/800",
          "https://picsum.photos/seed/hwb5/600/800",
          "https://picsum.photos/seed/hwb6/600/800",
          "https://picsum.photos/seed/hwb7/600/800",
          "https://picsum.photos/seed/hwb8/600/800",
        ]}
      />

      {/* 3. Horizontal Trust Banner */}
      <TrustStrip />

      {/* 4. Shop By Category Bento Layout */}
      <CategorySection />

      {/* 5. Featured Products Grid */}
      <section id="featured-products-section" className="py-24 md:py-32 bg-transparent relative z-10">
        <div className="absolute top-[30%] left-[5%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.1]" />
        
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 md:mb-20 gap-4">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Modern Masterpieces</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
                Curated <span className="text-primary">Featured Hardware</span>
              </h2>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-sm text-left leading-relaxed font-medium">
              Explore our most coveted precision locks, hand-finished brass lever handles, and heavy industrial drills.
            </p>
          </div>

          {/* Product Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Bottom Action */}
          <div className="mt-14 text-center">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1a1917] hover:bg-primary text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer"
            >
              <span>View All Catalog Innovations</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Advanced Interactive Product Showcase */}
      <ProductShowcase />

      {/* 7. Brands Column marquee showcase */}
      <BrandsSection />

      {/* 8. Why Choose Us Core Columns */}
      <WhyChooseUs />

      {/* 9. Heritage Story Section */}
      <AboutSection />

      {/* 10. Real-world project deployments */}
      <UseCases />

      {/* 11. Custom masonry visual gallery */}
      <GallerySection />

      {/* 12. Location coordination map */}
      <MapSection />

      {/* 13. Dynamic form contacts desk */}
      <ContactSection />

      {/* 14. Email subscriptions desk */}
      <NewsletterCTA />

      {/* 15. Premium Brand Footer */}
      <Footer />

      {/* E-Commerce Sidebar Drawers & Overlay modules */}
      <SearchOverlay />
      {/* 
      <CartDrawer />
      */}
      <QuickViewModal />

    </div>
  );
}
