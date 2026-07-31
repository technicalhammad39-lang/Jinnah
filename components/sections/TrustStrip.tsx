"use client";

import type { CSSProperties } from "react";
import { ShieldCheck, Flame, Cpu, Landmark, Settings } from "lucide-react";

const TRUST_ITEMS = [
  { text: "QUALITY HARDWARE", icon: Flame },
  { text: "TRUSTED BRANDS", icon: ShieldCheck },
  { text: "PROFESSIONAL SERVICE", icon: Settings },
  { text: "RELIABLE ACCESS", icon: Cpu },
  { text: "BUILT FOR EVERY PROJECT", icon: Landmark },
];

function TrustStripGroup() {
  return (
    <div className="trust-strip-group px-6 md:px-8">
      {TRUST_ITEMS.map((item) => {
        const IconComponent = item.icon;

        return (
          <div key={item.text} className="flex shrink-0 items-center gap-2.5 md:gap-3.5">
            <IconComponent className="h-4 w-4 text-white/85 md:h-5 md:w-5" />
            <span className="text-[11px] font-extrabold leading-none tracking-widest text-white uppercase md:text-xs">
              {item.text}
            </span>
            <span className="ml-4 block h-1.5 w-1.5 rounded-full bg-white/60 md:ml-6" />
          </div>
        );
      })}
    </div>
  );
}

export function TrustStrip() {
  return (
    <div className="marquee-mask relative z-10 w-full overflow-hidden border-y border-black/5 bg-primary py-5 text-primary-foreground shadow-[0_12px_30px_rgba(224,90,43,0.22)] md:py-7">
      <div
        className="trust-strip-track"
        style={{ "--marquee-duration": "22s" } as CSSProperties}
      >
        <TrustStripGroup />
        <TrustStripGroup />
      </div>
    </div>
  );
}
