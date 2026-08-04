"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShieldAlert, Medal, CircleDollarSign, Compass, Layers, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

function TimelineConnector({ isEven, isHovered }: { isEven: boolean; isHovered: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <div 
      className={cn(
        "hidden md:block absolute top-1/2 w-[22.22%] h-[164px] z-10 pointer-events-none",
        isEven ? "left-full" : "right-full"
      )}
    >
      <svg 
        className="w-full h-full overflow-visible" 
        preserveAspectRatio="none" 
        viewBox="0 0 100 164"
        style={{ 
          opacity: isHovered ? 1 : 0.72,
          transition: "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Base persistent orange line */}
        <path 
          d={isEven ? "M 0,0 C 50,0 50,164 100,164" : "M 100,0 C 50,0 50,164 0,164"} 
          fill="none" 
          stroke="rgba(255,106,42,0.25)" 
          strokeWidth="3" 
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Continuous Flowing Energy Highlight */}
        <motion.path 
          d={isEven ? "M 0,0 C 50,0 50,164 100,164" : "M 100,0 C 50,0 50,164 0,164"} 
          fill="none" 
          stroke="url(#energy-flow)" 
          strokeWidth="4" 
          vectorEffect="non-scaling-stroke"
          pathLength="100"
          strokeDasharray="40 160"
          animate={reduceMotion ? undefined : { strokeDashoffset: [200, 0] }}
          transition={reduceMotion ? undefined : { repeat: Infinity, duration: 3, ease: "linear" }}
        />
        <defs>
          <linearGradient id="energy-flow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#FF9A55" />
            <stop offset="80%" stopColor="#FF6A2A" />
            <stop offset="100%" stopColor="rgba(255,106,42,0.1)" />
          </linearGradient>
        </defs>
      </svg>
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
    <section className="pt-12 pb-24 md:pt-20 md:pb-32 bg-[#faf9f6] relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-24 md:mb-36 gap-4">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white shadow-sm px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Our Brand Value</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
              QUALITY WITHOUT <br className="hidden sm:inline" />
              <span className="text-primary font-stylish normal-case text-[1.1em]">COMPROMISE</span>
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground max-w-sm text-left leading-relaxed font-medium">
            Over decades of serving homes and construction projects, we have refined a benchmark of uncompromising reliability.
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            const isHovered = hoveredIndex === index;
            const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
            const isLast = index === features.length - 1;

            return (
              <div 
                key={feature.title} 
                className={cn(
                  "relative flex w-full flex-col md:flex-row",
                  isEven ? "md:justify-start" : "md:justify-end",
                  index !== 0 ? "mt-12 md:-mt-24" : ""
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Ambient Glow Behind Cards */}
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-[60vw] h-[400px] pointer-events-none z-0",
                  isEven 
                    ? "left-[-20vw] bg-[radial-gradient(ellipse_at_left,rgba(255,106,42,0.04)_0%,transparent_60%)]" 
                    : "right-[-20vw] bg-[radial-gradient(ellipse_at_right,rgba(255,106,42,0.04)_0%,transparent_60%)]"
                )} />

                <div 
                  className={cn(
                    "relative w-full md:w-[45%] z-20 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity]",
                    isOtherHovered ? "opacity-[0.85]" : "opacity-100",
                    isHovered ? "z-30" : "z-20"
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className={cn(
                      "group rounded-[2rem] border transition-all duration-700 h-auto md:h-[260px] flex flex-col justify-center relative z-20 pt-16 pb-8 px-8 md:px-10 mt-8 md:mt-0",
                      "bg-gradient-to-br from-[#202020]/95 via-[#171717]/95 to-[#111111]/95 backdrop-blur-2xl",
                      isHovered 
                        ? "border-[#FF6A2A]/40 shadow-[0_30px_80px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] md:-translate-y-3 scale-[1.02]" 
                        : "border-white/10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.02)] translate-y-0 scale-100"
                    )}
                  >
                    {/* Floating Luxury Icon Container (Orange/White) */}
                    <div 
                      className={cn(
                        "absolute top-0 left-8 md:left-10 -translate-y-1/2 w-[72px] h-[72px] rounded-[1.25rem] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
                        "text-white"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-white/70">
                      {feature.desc}
                    </p>
                  </motion.div>

                  {/* Redesigned Premium Nodes with White Background */}
                  <div 
                    className={cn(
                      "hidden md:flex absolute top-1/2 -translate-y-1/2 w-[52px] h-[52px] items-center justify-center rounded-full z-30 transition-all duration-700",
                      isEven ? "right-0 translate-x-[50%]" : "left-0 -translate-x-[50%]",
                      "bg-white border-[3px] border-white",
                      isHovered ? "shadow-[0_0_30px_rgba(255,106,42,0.6),inset_0_0_12px_rgba(255,106,42,0.3)] scale-125" : "shadow-[0_0_15px_rgba(255,106,42,0.2),inset_0_0_8px_rgba(255,106,42,0.1)] scale-100 animate-[pulse_4s_ease-in-out_infinite]"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-5 h-5 rounded-full transition-all duration-700 relative flex items-center justify-center bg-gradient-to-br from-[#FF9A55] to-[#FF6A2A]",
                        isHovered ? "scale-110 shadow-[0_0_12px_rgba(255,106,42,0.8)]" : "scale-100 shadow-[0_0_6px_rgba(255,106,42,0.4)]"
                      )} 
                    >
                      <div className={cn(
                        "absolute inset-0 rounded-full bg-white/40",
                        !isHovered && "animate-ping opacity-30"
                      )} style={{ animationDuration: '2.5s' }} />
                    </div>
                  </div>

                  {!isLast && (
                    <TimelineConnector isEven={isEven} isHovered={isHovered} />
                  )}

                  {!isLast && (
                    <div className="md:hidden absolute left-[52px] -bottom-12 w-px h-12 bg-gradient-to-b from-black/10 to-transparent" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
