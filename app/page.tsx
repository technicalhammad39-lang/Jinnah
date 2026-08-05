import { PRODUCTS } from "@/data/products";
import { Navbar } from "@/components/navigation/Navbar";
import { AnimatedMarqueeHero } from "@/components/hero/AnimatedMarqueeHero";
import { CategorySection } from "@/components/sections/CategorySection";
import { DiscoverBySpace } from "@/components/sections/DiscoverBySpace";
import { ProductCard } from "@/components/products/ProductCard";
import { BrandsSection } from "@/components/sections/BrandsSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { AboutSection } from "@/components/sections/AboutSection";
import { UseCases } from "@/components/sections/UseCases";
import { GallerySection } from "@/components/sections/GallerySection";
import { ContactSection } from "@/components/sections/ContactSection";
import { AgencyCredit } from "@/components/sections/AgencyCredit";
import { Footer } from "@/components/navigation/Footer";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Select top 4 products for the Homepage Featured grid
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      {/* 1. Global Navigation */}
      <Navbar />

      {/* 2. Elite Animated Marquee Hero */}
      <AnimatedMarqueeHero
        tagline="PREMIUM ARCHITECTURAL HARDWARE | TRUSTED ACROSS PAKISTAN"
        title={"Premium Hardware\nFor Exceptional Spaces."}
        description="Discover premium architectural hardware, designer door fittings, smart security solutions, professional tools, and finishing accessories trusted by architects, builders, and homeowners across Pakistan."
        ctaText="Explore Products"
      />

      {/* 3. Shop By Category Bento Layout */}
      <CategorySection />

      {/* 4. Featured Products Grid */}
      <section id="featured-products-section" className="relative z-10 bg-transparent pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="absolute top-[30%] left-[5%] h-[35vw] w-[35vw] rounded-full glow-blob-orange opacity-[0.1]" />

        <div className="mx-auto max-w-[1740px] px-6 md:px-8 xl:px-12">
          {/* Header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-4 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Modern Masterpieces</span>
              </div>
              <h2 className="text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-[#1a1917] md:text-5xl">
                Curated <span className="text-primary">Featured Hardware</span>
              </h2>
            </div>

            <p className="max-w-sm text-left text-sm font-medium leading-relaxed text-muted-foreground">
              Explore our most coveted precision locks, hand-finished brass lever handles, and heavy industrial drills.
            </p>
          </div>

          {/* Product Cards Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Bottom Action */}
          <div className="mt-14 flex items-center justify-center gap-6">
            <div className="h-[2px] w-16 sm:w-32 md:w-48 bg-gradient-to-l from-primary via-primary/50 to-transparent rounded-full shadow-[0_0_8px_rgba(255,90,31,0.5)] opacity-80" />
            <Link
              href="/shop"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1a1917] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-primary hover:shadow-[0_0_15px_rgba(255,90,31,0.4)]"
            >
              <span>View All Catalog Innovations</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </Link>
            <div className="h-[2px] w-16 sm:w-32 md:w-48 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full shadow-[0_0_8px_rgba(255,90,31,0.5)] opacity-80" />
          </div>
        </div>
      </section>

      {/* 5. Discover By Space Premium Section */}
      <DiscoverBySpace />

      {/* 6. Brands Column marquee showcase */}
      <BrandsSection />

      {/* 7. Why Choose Us Core Columns */}
      <WhyChooseUs />

      {/* 8. Heritage Story Section */}
      <AboutSection />

      {/* 9. Real-world project deployments */}
      <UseCases />

      {/* 10. Custom masonry visual gallery */}
      <GallerySection />

      {/* 11. Dynamic form contacts desk */}
      <ContactSection />

      {/* 12. Agency Credit */}
      <AgencyCredit />

      {/* 13. Premium Brand Footer */}
      <Footer />
    </div>
  );
}
