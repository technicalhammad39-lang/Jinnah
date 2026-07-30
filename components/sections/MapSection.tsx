"use client";

import { motion } from "motion/react";
import { MapPin, Phone, Clock, Navigation, CheckCircle2, PhoneCall } from "lucide-react";

export function MapSection() {
  const storeInfo = [
    {
      title: "Store Location",
      desc: "Jinnah Hardware Store, Main Hardware Bazaar, Pakistan",
      icon: MapPin,
    },
    {
      title: "Phone Support",
      desc: "0300-0421772",
      icon: Phone,
      href: "tel:03000421772",
    },
    {
      title: "Opening Hours",
      desc: "Mon - Sat: 9:00 AM - 8:30 PM",
      icon: Clock,
    },
  ];

  return (
    <section id="map-section" className="py-24 md:py-32 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Rich Store Info Box */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Visit Us Today</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
                Our Flagship <br />
                <span className="text-primary">Hardware Store</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Experience the raw finishes and weight of solid brass levers, explore our tools bar, and speak directly to our hardware experts for tailored contracting estimates.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              {storeInfo.map((info) => {
                const InfoIcon = info.icon;
                return (
                  <div
                    key={info.title}
                    className="p-5 rounded-2xl bg-white border border-black/5 hover:border-primary/15 transition-all duration-300 flex gap-4"
                  >
                    <div className="p-3 rounded-xl bg-primary/5 text-primary flex items-center justify-center h-11 w-11 flex-shrink-0">
                      <InfoIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {info.title}
                      </h4>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-extrabold text-[#1a1917] hover:text-primary transition-colors block"
                        >
                          {info.desc}
                        </a>
                      ) : (
                        <p className="text-sm font-extrabold text-[#1a1917]">
                          {info.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://maps.google.com/?q=Jinnah+Hardware+Store"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6.5 py-4 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-primary/20 cursor-pointer"
              >
                <Navigation className="h-4 w-4" />
                <span>Open Google Maps</span>
              </a>

              <a
                href="tel:03000421772"
                className="inline-flex items-center gap-2 px-6.5 py-4 rounded-full border border-black/10 hover:border-black/25 bg-white text-[#1a1917] text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 text-primary animate-bounce" />
                <span>Call Store Now</span>
              </a>
            </div>
          </div>

          {/* Right Side: Beautiful Map Placeholder/Interactive Stage */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-[32px] overflow-hidden bg-[#efece6] border border-black/5 shadow-xl flex items-center justify-center group">
              {/* This represents our stylized vector map */}
              <div className="absolute inset-0 opacity-[0.6] mix-blend-multiply architectural-grid pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.3] mix-blend-multiply architectural-grid-fine pointer-events-none" />

              {/* Decorative Map Graphics */}
              <svg className="absolute inset-0 w-full h-full text-black/5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-100 200 C150 150, 450 350, 1200 300" stroke="currentColor" strokeWidth="8" strokeDasharray="16 16" />
                <path d="M400 -50 C450 350, 350 450, 450 850" stroke="currentColor" strokeWidth="4" />
                <circle cx="450" cy="350" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <rect x="250" y="200" width="120" height="80" rx="12" fill="currentColor" opacity="0.4" />
                <rect x="520" y="420" width="180" height="120" rx="16" fill="currentColor" opacity="0.4" />
              </svg>

              {/* Glowing Ambient Radial light under pin */}
              <div className="absolute top-[55%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/10 filter blur-xl animate-pulse" />

              {/* Animated Rotating Map Coordinates Details */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-10 flex flex-col items-center cursor-pointer"
              >
                {/* Custom glowing map marker */}
                <div className="relative flex items-center justify-center mb-1">
                  <div className="absolute w-12 h-12 rounded-full bg-primary/20 border border-primary/40 animate-ping" />
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-xl">
                    <MapPin className="h-5 w-5 fill-white" />
                  </div>
                </div>

                {/* Info Card Pop */}
                <div className="px-4 py-2.5 rounded-xl bg-white shadow-xl border border-black/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-[#1a1917] tracking-tight uppercase">
                    JINNAH HARDWARE STORE
                  </span>
                </div>
              </motion.div>

              {/* Glassmorphic overlay guide */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                  <p className="text-[11px] font-bold text-[#1a1917] text-left leading-tight">
                    INTEGRATION READY: Replace map container with Google Maps iframe easily.
                  </p>
                </div>
                <span className="text-[9px] font-extrabold bg-[#1a1917] text-white px-2.5 py-1 rounded-full uppercase tracking-widest leading-none">
                  Placeholder Map
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
