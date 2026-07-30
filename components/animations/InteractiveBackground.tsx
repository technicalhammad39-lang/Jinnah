"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function InteractiveBackground() {
  const [mounted, setMounted] = useState(false);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 150 };
  const springX = useSpring(glowX, springConfig);
  const springY = useSpring(glowY, springConfig);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Relative to viewport
      glowX.set(e.clientX);
      glowY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [glowX, glowY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none select-none bg-[#faf9f6]">
      {/* 1. Fine Architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid opacity-[0.8] mix-blend-multiply" />
      <div className="absolute inset-0 architectural-grid-fine opacity-[0.5] mix-blend-multiply" />
      
      {/* 2. Soft Ambient Noise Texture */}
      <div className="absolute inset-0 noise-texture opacity-100 mix-blend-overlay" />

      {/* 3. Slowly moving warm ambient orange blobs */}
      <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full glow-blob-orange animate-float-slow opacity-[0.8]" />
      <div className="absolute bottom-[15%] right-[10%] w-[50vw] h-[50vw] rounded-full glow-blob-orange animate-float-slower opacity-[0.6]" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full glow-blob-charcoal opacity-[0.4]" />

      {/* 4. Mouse-following soft orange radial glow */}
      <motion.div
        className="absolute w-[35vw] h-[35vw] pointer-events-none mix-blend-color-burn opacity-[0.4]"
        style={{
          x: springX,
          y: springY,
        }}
      >
        <div 
          className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(224, 90, 43, 0.15) 0%, rgba(224, 90, 43, 0) 70%)" }}
        />
      </motion.div>

      {/* 5. Minimal ambient grid lines / beams */}
      <div className="absolute left-[20%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute left-[80%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-[70%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
    </div>
  );
}
