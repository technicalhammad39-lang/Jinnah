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
    <div className="relative z-10 w-full overflow-hidden border-y border-black/5 bg-primary py-5 text-primary-foreground shadow-[0_12px_30px_rgba(224,90,43,0.22)] marquee-mask md:py-7">
      {/* Absolute slide container */}
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex items-center gap-12 px-6 md:gap-16"
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
                <IconComponent className="h-4 w-4 text-white/85 md:h-5 md:w-5" />
                <span className="text-[11px] font-extrabold leading-none tracking-widest text-white uppercase md:text-xs">
                  {item.text}
                </span>
                <span className="ml-4 block h-1.5 w-1.5 rounded-full bg-white/60 md:ml-6" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
