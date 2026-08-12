"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShieldAlert, Medal, CircleDollarSign, Compass, Layers, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";


function HorizontalConnector({ isHovered, className }: { isHovered: boolean; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none h-[2px]", className)}>
      <svg 

        className="absolute inset-0 w-full h-full overflow-visible" 
        preserveAspectRatio="none" 
        viewBox="0 0 100 2"
        style={{ 
          opacity: isHovered ? 1 : 0.72,
          transition: "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <path 
          d="M 0,1 L 100,1" 
          fill="none" 
          stroke="rgba(255,106,42,0.25)" 
          strokeWidth="3" 
          vectorEffect="non-scaling-stroke"
        />
        <motion.path 
          d="M 0,1 L 100,1" 
          fill="none" 
          stroke="#FF9A55" 
          strokeWidth="4" 
          vectorEffect="non-scaling-stroke"
          pathLength="100"
          strokeDasharray="40 160"
          animate={{ strokeDashoffset: [200, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(255,106,42,0.8))" }}
        />
      </svg>
      
      {/* Premium Node attached to the left edge of the connector (touching the right card edge) */}
      <div 
        className={cn(
          "absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] flex items-center justify-center rounded-full z-30 transition-all duration-700",
          "bg-white border-[2px] border-white",
          isHovered ? "shadow-[0_0_20px_rgba(255,106,42,0.6),inset_0_0_8px_rgba(255,106,42,0.3)] scale-110" : "shadow-[0_0_10px_rgba(255,106,42,0.2),inset_0_0_5px_rgba(255,106,42,0.1)] scale-100 animate-[pulse_4s_ease-in-out_infinite]"
        )}
      >
        <div 
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-700 relative flex items-center justify-center bg-gradient-to-br from-[#FF9A55] to-[#FF6A2A]",
            isHovered ? "scale-110 shadow-[0_0_8px_rgba(255,106,42,0.8)]" : "scale-100 shadow-[0_0_4px_rgba(255,106,42,0.4)]"
          )} 
        >
          <div className={cn(
            "absolute inset-0 rounded-full bg-white/40",
            !isHovered && "animate-ping opacity-30"
          )} style={{ animationDuration: '2.5s' }} />
        </div>
      </div>
    </div>
  );
}

export function WhyChooseUs() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      title: "Uncompromising Quality",
      desc: "Every bracket, lock, and tool in our collection undergoes stringent architectural-load and cycles validation.",
      icon: Medal,
    },
    {
      title: "Trusted Global Brands",
      desc: "Authorized dealer of Veritas Steel, Aurum Brass, and Krypter Biometrics, ensuring genuine warranties.",
      icon: Layers,
    },
    {
      title: "Industrial Expertise",
      desc: "Our team consists of veteran hardware technicians ready to guide blueprinted bills of materials.",
      icon: Compass,
    },
    {
      title: "Contractor Pricing",
      desc: "Tiered commercial pricing with optimal value margins for large development projects and workshops.",
      icon: CircleDollarSign,
    },
    {
      title: "Instant Deliveries",
      desc: "Express fulfillment on high-volume items so your job site never experiences costly delay pauses.",
      icon: ShieldAlert,
    },
    {
      title: "24/7 Builder Support",
      desc: "Dedicated account support for commercial builders, contractors, and custom architectural renovators.",
      icon: Headphones,
    },
  ];

  return (
    <section data-no-premium-reveal className="pt-12 pb-24 md:pt-20 md:pb-32 bg-[#faf9f6] relative z-10 overflow-hidden">
      <div className="w-full max-w-[1740px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center justify-center text-center mb-16 md:mb-24 gap-6">
          <div className="space-y-4 w-full max-w-[90vw] md:max-w-5xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white shadow-sm px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Our Brand Value</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-[#1a1917] leading-[1.05] flex flex-wrap justify-center items-center gap-x-3 md:gap-x-4">
              <span>Quality Without</span>
              <span className="text-primary font-stylish capitalize text-[1.1em]">Compromise</span>
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Over decades of serving homes and construction projects, we have refined a benchmark of uncompromising reliability.
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-[1920px] px-6 lg:px-12 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12 lg:gap-x-16 mt-0">
        {features.map((feature, index) => {
            const isHovered = hoveredIndex === index;
            const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;

            return (
              <div 
                key={feature.title} 
                className="relative flex w-full flex-col pt-8"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Ambient Glow Behind Cards */}
                <div className={cn(
                  "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[120%] h-[120%] pointer-events-none z-0",
                  "bg-[radial-gradient(ellipse_at_center,rgba(255,106,42,0.06)_0%,transparent_70%)]"
                )} />

                <div 
                  className={cn(
                    "relative w-full h-full z-20 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity]",
                    isOtherHovered ? "opacity-[0.85]" : "opacity-100",
                    isHovered ? "z-30" : "z-20"
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
                    className={cn(
                      "group rounded-[2rem] border transition-all duration-700 h-full min-h-[240px] flex flex-col justify-start relative z-20 pt-14 pb-8 px-8",
                      "bg-gradient-to-br from-[#202020]/95 via-[#171717]/95 to-[#111111]/95 backdrop-blur-2xl text-left",
                      isHovered 
                        ? "border-[#FF6A2A]/40 shadow-[0_30px_80px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] md:-translate-y-3 scale-[1.02]" 
                        : "border-white/10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.02)] translate-y-0 scale-100"
                    )}
                  >
                    {/* Floating Luxury Icon Container (Orange/White) */}
                    <div 
                      className={cn(
                        "absolute top-0 left-8 -translate-y-1/2 w-[72px] h-[72px] rounded-[1.25rem] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "backdrop-blur-xl bg-gradient-to-br from-[#FF9A55] to-[#FF6A2A] border border-white/20",
                        isHovered 
                          ? "shadow-[0_12px_30px_-8px_rgba(255,106,42,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] rotate-0 -translate-y-[6px]" 
                          : "shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] rotate-6"
                      )}
                    >
                      <feature.icon className={cn(
                        "h-9 w-9 transition-all duration-700 text-white",
                        isHovered ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] scale-110" : "scale-100"
                      )} />
                    </div>
                    
                    <h3 
                      className={cn(
                        "font-extrabold text-lg md:text-xl uppercase tracking-tight transition-colors duration-500 mb-3",
                        "text-white mt-4"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-white/70">
                      {feature.desc}
                    </p>
                  </motion.div>
                </div>
                
                {/* Horizontal Connector - Desktop (LG+) */}
                {(index + 1) % 3 !== 0 && index !== features.length - 1 && (
                  <HorizontalConnector isHovered={isHovered} className="hidden lg:block w-[64px] -right-[64px]" />
                )}
                
                {/* Horizontal Connector - Tablet (MD) */}
                {(index + 1) % 2 !== 0 && index !== features.length - 1 && (
                  <HorizontalConnector isHovered={isHovered} className="hidden md:block lg:hidden w-[48px] -right-[48px]" />
                )}
              </div>
            );
          })}
        </div>
    </section>
  );
}
