export const dynamic = "force-dynamic";
// import { PRODUCTS } from "@/data/products";
import { getFeaturedProducts } from "@/lib/data-fetcher";
import { Navbar } from "@/components/navigation/Navbar";
import { AnimatedMarqueeHero } from "@/components/hero/AnimatedMarqueeHero";
import { CategorySection } from "@/components/sections/CategorySection";
import { DiscoverBySpace } from "@/components/sections/DiscoverBySpace";
import { FeaturedProductsCarousel } from "@/components/sections/FeaturedProductsCarousel";
import { BrandsSection } from "@/components/sections/BrandsSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { AboutSection } from "@/components/sections/AboutSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ReviewsCarousel } from "@/components/sections/ReviewsCarousel";
import { ContactSection } from "@/components/sections/ContactSection";
import { AgencyCredit } from "@/components/sections/AgencyCredit";
import { Footer } from "@/components/navigation/Footer";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jinnah Hardware Store | Pakistan's Premier Architectural Hardware",
  description: "Pakistan's premier purveyor of luxury architectural hardware, bridging the gap between world-class engineering and exceptional local design.",
  openGraph: {
    title: "Jinnah Hardware Store - Modern Architectural Hardware",
    description: "Pakistan's premier purveyor of luxury architectural hardware.",
    url: "https://jinnah-hardwarestore.com/",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
};

export default async function Home() {
  // Fetch from Firebase
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      {/* 1. Global Navigation */}
      <Navbar />

      {/* 2. Elite Animated Marquee Hero */}
      <AnimatedMarqueeHero
        tagline="PREMIUM ARCHITECTURAL HARDWARE | TRUSTED ACROSS PAKISTAN"
        title={"Premium Hardware\nFor\u00A0Exceptional Spaces."}
        description={
          <>
            <span className="sm:hidden">
              Discover premium architectural hardware, designer door fittings, and smart security solutions trusted across Pakistan.
            </span>
            <span className="hidden sm:inline">
              Discover premium architectural hardware, designer door fittings, smart security solutions, professional tools, and finishing accessories trusted by architects, builders, and homeowners across Pakistan.
            </span>
          </>
        }
        ctaText="Explore Products"
      />

      {/* 3. Shop By Category Bento Layout */}
      <CategorySection />

      {/* 4. Featured Products Grid */}
      <section id="featured-products-section" className="relative z-10 bg-transparent pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="absolute top-[30%] left-[5%] h-[35vw] w-[35vw] rounded-full glow-blob-orange opacity-[0.1]" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-4 md:mb-12">
            <div className="max-w-2xl space-y-4 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Modern Masterpieces</span>
              </div>
              <h2 className="text-3xl font-extrabold leading-[0.95] tracking-tighter text-[#1a1917] md:text-5xl">
                Curated Featured <span className="text-primary">Hardware</span>
              </h2>
              <p className="max-w-sm text-left text-sm font-medium leading-relaxed text-muted-foreground">
                Explore our most coveted precision locks, hand-finished brass lever handles, and heavy industrial drills.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
              <Link
                href="/shop"
                className="group inline-flex w-full md:w-auto justify-center cursor-pointer items-center gap-2 rounded-full bg-[#1a1917] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-primary hover:shadow-[0_0_15px_rgba(255,90,31,0.4)]"
              >
                <span>View Products</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          <FeaturedProductsCarousel products={featuredProducts} />
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

      {/* 9. Custom masonry visual gallery */}
      <GallerySection />

      {/* 10. Reviews Carousel */}
      <ReviewsCarousel />

      {/* 11. Dynamic form contacts desk */}
      <ContactSection />

      {/* 12. Agency Credit */}
      <AgencyCredit />

      {/* 13. Premium Brand Footer */}
      <Footer />
    </div>
  );
}

