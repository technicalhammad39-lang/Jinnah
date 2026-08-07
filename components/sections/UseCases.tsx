"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Home, Building2, Building, HeartPulse, GraduationCap, Factory } from "lucide-react";

export function UseCases() {
  const cases = [
    {
      title: "Luxury Residences",
      desc: "Premium door hardware, smart locks, concealed hinges, and architectural fittings for modern homes.",
      image: "https://picsum.photos/seed/case-res/600/450",
      icon: Home,
      href: "/shop?category=residential"
    },
    {
      title: "Commercial Offices",
      desc: "Heavy-duty handles, fire-rated doors, concealed closers, and access control hardware.",
      image: "https://picsum.photos/seed/case-com/600/450",
      icon: Building2,
      href: "/shop?category=commercial"
    },
    {
      title: "Hotels & Hospitality",
      desc: "Designer brass fittings, silent hinges, premium bathroom accessories, and luxury door systems.",
      image: "https://picsum.photos/seed/case-hot/600/450",
      icon: Building,
      href: "/shop?category=hospitality"
    },
    {
      title: "Hospitals & Healthcare",
      desc: "Antibacterial hardware, hygienic handles, durable stainless-steel fittings, and accessibility solutions.",
      image: "https://picsum.photos/seed/case-hos/600/450",
      icon: HeartPulse,
      href: "/shop?category=specialized"
    },
    {
      title: "Educational Institutions",
      desc: "Robust door systems, classroom hardware, security fittings, and maintenance-friendly products.",
      image: "https://picsum.photos/seed/case-edu/600/450",
      icon: GraduationCap,
      href: "/shop?category=institutional"
    },
    {
      title: "Industrial Projects",
      desc: "Heavy-duty hardware engineered for factories, warehouses, industrial buildings, and commercial facilities.",
      image: "https://picsum.photos/seed/case-ind/600/450",
      icon: Factory,
      href: "/shop?category=industrial"
    },
  ];

  return (
    <section className="pt-8 pb-24 md:pt-12 md:pb-32 bg-transparent relative z-10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.15]" />

      <div className="max-w-[1740px] mx-auto px-6 md:px-8 xl:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Our Applications</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] leading-[0.95]">
            Where Our Products <span className="text-primary">Excel</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            From modern luxury bedrooms to heavy-duty industrial contracting sites, Jinnah Hardware fittings are selected for maximum stress and design refinement.
          </p>
        </div>

        {/* Carousel-like card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((item) => {
            const CaseIcon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.title}
                className="group relative rounded-[32px] overflow-hidden bg-[#efece6] aspect-[4/3] shadow-md hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-black/5 premium-transform block"
              >
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Content Box */}
                <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-between text-left">
                  {/* Top: Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                    <CaseIcon className="h-6 w-6" />
                  </div>

                  {/* Bottom: Title & description */}
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed font-medium mt-3">
                      {item.desc}
                    </p>

                    {/* Tiny visual detail */}
                    <div className="flex items-center gap-2 text-primary text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span>Explore Collection</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
