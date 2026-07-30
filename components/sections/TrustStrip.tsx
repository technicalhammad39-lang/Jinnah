"use client";

import { motion } from "motion/react";
import { ShieldCheck, Flame, Cpu, Landmark, Settings } from "lucide-react";

export function TrustStrip() {
  const words = [
    { text: "QUALITY HARDWARE", icon: Flame },
    { text: "TRUSTED BRANDS", icon: ShieldCheck },
    { text: "PROFESSIONAL SERVICE", icon: Settings },
    { text: "RELIABLE ACCESS", icon: Cpu },
    { text: "BUILT FOR EVERY PROJECT", icon: Landmark },
  ];

  // Repeat for continuous seamless horizontal sliding
  const repeatedWords = [...words, ...words, ...words, ...words];

  return (
    <div className="relative w-full py-5 md:py-7 bg-primary text-white overflow-hidden border-y border-white/10 z-10 shadow-[0_4px_30px_rgba(224,90,43,0.15)]">
      {/* Absolute slide container */}
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-12 md:gap-16 items-center"
          initial={{ x: "0%" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
        >
          {repeatedWords.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 md:gap-3.5 flex-shrink-0">
                <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-white/70" />
                <span className="text-[11px] md:text-xs font-extrabold tracking-widest uppercase text-white leading-none">
                  {item.text}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 block ml-4 md:ml-6" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
