"use client";

import Image from "next/image";
import { ArrowUpRight, Home, Building2, HardHat, Hammer } from "lucide-react";

export function UseCases() {
  const cases = [
    {
      title: "Bespoke Smart Homes",
      desc: "Providing Italian forged brass entry handles and encrypted biometric locksets for luxury architectural villas.",
      image: "https://picsum.photos/seed/case1/600/450",
      icon: Home,
    },
    {
      title: "Commercial Rises",
      desc: "Supplying certified Grade-1 structural steel hinges, door closer mechanisms, and heavy mortise hardware.",
      image: "https://picsum.photos/seed/case2/600/450",
      icon: Building2,
    },
    {
      title: "Active Construction",
      desc: "Supporting field contractors with high-torque Apex brushless drills, laser anchors, and heavy structural timber couplings.",
      image: "https://picsum.photos/seed/case3/600/450",
      icon: HardHat,
    },
    {
      title: "Custom Carpentry",
      desc: "Empowering custom woodworking studios with knurled brass cabinet pulls, soft-close sliders, and invisible mortise hinges.",
      image: "https://picsum.photos/seed/case4/600/450",
      icon: Hammer,
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
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
            Where Our Products <span className="text-primary">Excel</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            From modern luxury bedrooms to heavy-duty industrial contracting sites, Jinnah Hardware fittings are selected for maximum stress and design refinement.
          </p>
        </div>

        {/* Carousel-like card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((item) => {
            const CaseIcon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative rounded-[32px] overflow-hidden bg-[#efece6] aspect-[3/4] shadow-md hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-black/5 premium-transform"
              >
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Content Box */}
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between text-left">
                  {/* Top: Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                    <CaseIcon className="h-5 w-5" />
                  </div>

                  {/* Bottom: Title & description */}
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed font-medium mt-2">
                      {item.desc}
                    </p>

                    {/* Tiny visual detail */}
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-extrabold uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Inspect Project Specs</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
