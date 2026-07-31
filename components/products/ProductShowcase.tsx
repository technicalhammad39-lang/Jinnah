"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Cpu,
  Flame,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useCartActions } from "@/context/AppContext";
import { Product, PRODUCTS } from "@/data/products";

const FEATURED_PRODUCT = PRODUCTS[0];
const SECONDARY_PRODUCT = PRODUCTS[1];

const FEATURE_SETS = {
  "prod-1": [
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
    },
  ],
  "prod-2": [
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
    },
  ],
} as const;

export function ProductShowcase() {
  const { addToCart } = useCartActions();
  const [activeProduct, setActiveProduct] = useState<Product>(FEATURED_PRODUCT);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const productFeatures = useMemo(
    () =>
      FEATURE_SETS[
        activeProduct.id === "prod-1" ? "prod-1" : "prod-2"
      ],
    [activeProduct.id]
  );

  return (
    <section className="relative z-10 overflow-hidden border-y border-black/5 bg-black/[0.02] py-24 md:py-32">
      <div className="glow-blob-orange absolute top-[20%] left-[20%] h-[45vw] w-[45vw] rounded-full opacity-[0.2]" />
      <div className="glow-blob-orange absolute right-[10%] bottom-[20%] h-[45vw] w-[45vw] rounded-full opacity-[0.15]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl space-y-4 text-center md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            <span>Spotlight Innovation</span>
          </div>
          <h2 className="text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-[#1a1917] md:text-5xl">
            Engineering <span className="text-primary">Mastery</span>
          </h2>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            Explore our state-of-the-art flagship products. Click on either masterpiece to inspect its inner mechanics and elite architecture.
          </p>

          <div className="mt-4 inline-flex rounded-full border border-black/10 bg-[#f1ece4]/90 p-1.5 shadow-[0_8px_20px_rgba(26,25,23,0.05)] backdrop-blur-sm">
            <button
              onClick={() => {
                setActiveProduct(FEATURED_PRODUCT);
                setActiveFeatureIndex(0);
              }}
              className={`cursor-pointer rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeProduct.id === "prod-1"
                  ? "border border-black/5 bg-white text-[#1a1917] shadow-sm"
                  : "text-[#655d54] hover:bg-white/70 hover:text-[#1a1917]"
              }`}
            >
              Aurum Brass Lever
            </button>
            <button
              onClick={() => {
                setActiveProduct(SECONDARY_PRODUCT);
                setActiveFeatureIndex(0);
              }}
              className={`cursor-pointer rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeProduct.id === "prod-2"
                  ? "border border-black/5 bg-white text-[#1a1917] shadow-sm"
                  : "text-[#655d54] hover:bg-white/70 hover:text-[#1a1917]"
              }`}
            >
              Krypter Smart Mortise
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 md:gap-16 lg:grid-cols-12">
          <div className="relative flex items-center justify-center lg:col-span-6">
            <div className="absolute inset-0 -z-10 rounded-[48px] bg-gradient-to-tr from-primary/5 to-transparent blur-2xl" />

            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="group relative flex aspect-square w-full max-w-[440px] items-center justify-center rounded-[36px] border border-white/60 bg-[#efece6] p-6 shadow-xl"
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src={activeProduct.images[0]}
                  alt={activeProduct.name}
                  fill
                  sizes="(min-width: 1024px) 440px, 90vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div
                className="absolute z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-primary bg-primary/20 shadow-lg animate-pulse"
                style={{
                  top:
                    activeProduct.id === "prod-1"
                      ? activeFeatureIndex === 0
                        ? "55%"
                        : activeFeatureIndex === 1
                          ? "40%"
                          : "65%"
                      : activeFeatureIndex === 0
                        ? "35%"
                        : activeFeatureIndex === 1
                          ? "60%"
                          : "48%",
                  left:
                    activeProduct.id === "prod-1"
                      ? activeFeatureIndex === 0
                        ? "50%"
                        : activeFeatureIndex === 1
                          ? "45%"
                          : "55%"
                      : activeFeatureIndex === 0
                        ? "52%"
                        : activeFeatureIndex === 1
                          ? "48%"
                          : "50%",
                }}
              >
                <span className="h-3.5 w-3.5 rounded-full bg-primary" />
              </div>
            </motion.div>
          </div>

          <div className="space-y-8 text-left lg:col-span-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                FEATURED BRAND • {activeProduct.brand}
              </span>
              <h3 className="mt-1 mb-4 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl">
                {activeProduct.name}
              </h3>

              <div className="mb-4 flex items-center gap-2">
                <div className="flex text-primary">
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary" />
                  <Star className="h-4.5 w-4.5 fill-primary text-primary/30" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  {activeProduct.rating} Stars
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  ({activeProduct.reviewCount} customer reviews)
                </span>
              </div>

              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                {activeProduct.description}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Technical Highlights
              </h4>
              <div className="grid grid-cols-1 gap-3.5">
                {productFeatures.map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  const isActive = activeFeatureIndex === index;

                  return (
                    <button
                      key={feature.title}
                      onClick={() => setActiveFeatureIndex(index)}
                      className={`cursor-pointer rounded-2xl border p-4 text-left transition-all duration-300 ${
                        isActive
                          ? "border-primary bg-white shadow-md shadow-primary/[0.02]"
                          : "border-black/5 bg-white/40 hover:border-black/10 hover:bg-white/70"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl p-2.5 transition-colors ${
                            isActive ? "bg-primary text-white" : "bg-black/5 text-[#1a1917]"
                          }`}
                        >
                          <FeatureIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h5
                            className={`text-xs font-extrabold uppercase tracking-wide ${
                              isActive ? "text-primary" : "text-[#1a1917]"
                            }`}
                          >
                            {feature.title}
                          </h5>
                          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 border-t border-black/5 pt-6 sm:flex-row">
              <div className="mr-auto flex flex-col text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Direct Store Price
                </span>
                <span className="text-3xl font-black text-foreground">
                  ${activeProduct.price.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => addToCart(activeProduct, 1)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/95 hover:shadow-primary/25 sm:w-auto"
              >
                <span>Add Featured To Order</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href={`/shop?product=${activeProduct.id}`}
                className="cursor-pointer border-b border-transparent pb-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
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
