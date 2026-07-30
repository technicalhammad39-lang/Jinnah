"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PRODUCTS, Product } from "@/data/products";
import { useApp } from "@/context/AppContext";
import { 
  ShieldCheck, ArrowRight, Star, Cpu, Lock, StarHalf, Zap, Flame, Sparkles
} from "lucide-react";
import Link from "next/link";

export function ProductShowcase() {
  const { addToCart } = useApp();
  
  // Select our main featured products for the showcase
  const featuredProduct = PRODUCTS[0]; // Knurled Brass Entry Lever Set
  const secondaryProduct = PRODUCTS[1]; // Krypter Biometric Mortise Smart Lock

  const [activeProduct, setActiveProduct] = useState<Product>(featuredProduct);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const productFeatures = activeProduct.id === "prod-1" ? [
    {
      title: "Solid Forged Brass Core",
      desc: "Machined from high-grade architectural brass containing 60% copper for incredible strength, heavy weight, and lifetime anti-microbial protection.",
      icon: Flame,
    },
    {
      title: "Tactile Diamond Knurling",
      desc: "Individually knurled with precision lathe tooling, providing a highly refined architectural texture, slip-free grip, and modern industrial elegance.",
      icon: Sparkles,
    },
    {
      title: "Anti-Droop Swiss Springs",
      desc: "Internally equipped with patented heavy-duty coil-cassettes to guarantee zero slop and perfect horizontal handle alignment even after decades of continuous use.",
      icon: Zap,
    }
  ] : [
    {
      title: "0.3s Biometric Scanning",
      desc: "Embedded with an ultra-fast high-density optical scanner that identifies authorized fingerprints in under 300ms, even with slight skin moisture.",
      icon: Cpu,
    },
    {
      title: "Triple Steel Deadbolt",
      desc: "The reinforced core houses three high-tensile stainless steel locking bolts with integrated anti-saw revolving rods for maximum resistance.",
      icon: Lock,
    },
    {
      title: "Smart Emergency Access",
      desc: "Features dual emergency ports: a concealed physical keyway cylinder and an external USB-C backup connection for instant power rescue.",
      icon: ShieldCheck,
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-black/[0.02] relative border-y border-black/5 z-10 overflow-hidden">
      {/* Background visual beams */}
      <div className="absolute top-[20%] left-[20%] w-[45vw] h-[45vw] rounded-full glow-blob-orange opacity-[0.2]" />
      <div className="absolute bottom-[20%] right-[10%] w-[45vw] h-[45vw] rounded-full glow-blob-orange opacity-[0.15]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3.5 py-1 text-[10px] font-bold text-primary uppercase tracking-widest">
            <span>Spotlight Innovation</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
            Engineering <span className="text-primary">Mastery</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Explore our state-of-the-art flagship products. Click on either masterpiece to inspect its inner mechanics and elite architecture.
          </p>

          {/* Toggle buttons */}
          <div className="inline-flex p-1.5 rounded-full bg-black/5 border border-black/[0.03] backdrop-blur-sm mt-4">
            <button
              onClick={() => {
                setActiveProduct(featuredProduct);
                setActiveFeatureIndex(0);
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeProduct.id === "prod-1"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Aurum Brass Lever
            </button>
            <button
              onClick={() => {
                setActiveProduct(secondaryProduct);
                setActiveFeatureIndex(0);
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeProduct.id === "prod-2"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Krypter Smart Mortise
            </button>
          </div>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
          {/* Left: Interactive 3D-like Spotlight Image Area */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-[48px] filter blur-2xl -z-10" />
            
            {/* Main Stage Card */}
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative aspect-square w-full max-w-[440px] rounded-[36px] bg-[#efece6] shadow-xl border border-white/60 p-6 flex items-center justify-center group"
            >
              <img
                src={activeProduct.images[0]}
                alt={activeProduct.name}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />

              {/* Dynamic hotspot marker representing highlighted feature */}
              <div
                className="absolute w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center cursor-pointer shadow-lg z-10 animate-pulse"
                style={{
                  top: activeProduct.id === "prod-1" 
                    ? (activeFeatureIndex === 0 ? "55%" : activeFeatureIndex === 1 ? "40%" : "65%")
                    : (activeFeatureIndex === 0 ? "35%" : activeFeatureIndex === 1 ? "60%" : "48%"),
                  left: activeProduct.id === "prod-1"
                    ? (activeFeatureIndex === 0 ? "50%" : activeFeatureIndex === 1 ? "45%" : "55%")
                    : (activeFeatureIndex === 0 ? "52%" : activeFeatureIndex === 1 ? "48%" : "50%"),
                }}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-primary" />
              </div>
            </motion.div>
          </div>

          {/* Right: Technical Details & Interactive Tabs */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div>
              <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase">
                FEATURED BRAND • {activeProduct.brand}
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-foreground uppercase tracking-tight leading-[0.95] mt-1 mb-4">
                {activeProduct.name}
              </h3>
              
              {/* Reviews and Ratings */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-primary">
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary text-primary/30" />
                </div>
                <span className="text-xs font-bold text-foreground">{activeProduct.rating} Stars</span>
                <span className="text-xs text-muted-foreground font-semibold">({activeProduct.reviewCount} customer reviews)</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {activeProduct.description}
              </p>
            </div>

            {/* Feature Selectors */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Technical Highlights
              </h4>
              <div className="grid grid-cols-1 gap-3.5">
                {productFeatures.map((feat, idx) => {
                  const FeatIcon = feat.icon;
                  const isActive = activeFeatureIndex === idx;
                  return (
                    <button
                      key={feat.title}
                      onClick={() => setActiveFeatureIndex(idx)}
                      className={`p-4 rounded-2xl border text-left flex gap-4 transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-white border-primary shadow-md shadow-primary/[0.02]"
                          : "bg-white/40 border-black/5 hover:border-black/10 hover:bg-white/70"
                      }`}
                    >
                      <div className={`p-2.5 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive ? "bg-primary text-white" : "bg-black/5 text-[#1a1917]"
                      }`}>
                        <FeatIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h5 className={`text-xs font-extrabold uppercase tracking-wide ${
                          isActive ? "text-primary" : "text-[#1a1917]"
                        }`}>
                          {feat.title}
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                          {feat.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-black/5">
              <div className="flex flex-col text-left mr-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Direct Store Price
                </span>
                <span className="text-3xl font-black text-foreground">
                  ${activeProduct.price.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => addToCart(activeProduct, 1)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25 transition-all cursor-pointer"
              >
                <span>Add Featured To Order</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href={`/shop?product=${activeProduct.id}`}
                className="text-xs font-bold text-muted-foreground hover:text-primary uppercase tracking-wider cursor-pointer border-b border-transparent hover:border-primary pb-0.5"
              >
                Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
