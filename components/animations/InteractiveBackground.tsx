"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function InteractiveBackground() {
  const [enablePointerGlow, setEnablePointerGlow] = useState(false);
  const enablePointerGlowRef = useRef(false);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 150 };
  const springX = useSpring(glowX, springConfig);
  const springY = useSpring(glowY, springConfig);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPointerMode = () => {
      const nextEnabled = pointerQuery.matches && !motionQuery.matches;
      enablePointerGlowRef.current = nextEnabled;
      setEnablePointerGlow(nextEnabled);
    };

    syncPointerMode();

    let frameId = 0;
    let nextX = 0;
    let nextY = 0;

    const flushPointerPosition = () => {
      frameId = 0;
      glowX.set(nextX);
      glowY.set(nextY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!enablePointerGlowRef.current) {
        return;
      }

      nextX = event.clientX;
      nextY = event.clientY;

      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(flushPointerPosition);
    };

    pointerQuery.addEventListener("change", syncPointerMode);
    motionQuery.addEventListener("change", syncPointerMode);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      pointerQuery.removeEventListener("change", syncPointerMode);
      motionQuery.removeEventListener("change", syncPointerMode);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [glowX, glowY]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-50 h-full w-full select-none overflow-hidden bg-[#faf9f6]">
      <div className="architectural-grid absolute inset-0 opacity-[0.8] mix-blend-multiply" />
      <div className="architectural-grid-fine absolute inset-0 opacity-[0.5] mix-blend-multiply" />
      <div className="noise-texture absolute inset-0 opacity-100 mix-blend-overlay" />

      <div className="glow-blob-orange absolute top-[10%] left-[5%] h-[45vw] w-[45vw] rounded-full opacity-[0.56] animate-float-slow" />
      <div className="glow-blob-orange absolute right-[10%] bottom-[15%] h-[50vw] w-[50vw] rounded-full opacity-[0.42] animate-float-slower" />
      <div className="glow-blob-charcoal absolute top-[50%] left-[50%] h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.28]" />

      {enablePointerGlow && (
        <motion.div
          className="pointer-events-none absolute h-[32vw] w-[32vw] opacity-[0.18] mix-blend-soft-light"
          style={{
            x: springX,
            y: springY,
          }}
        >
          <div
            className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(224, 90, 43, 0.1) 0%, rgba(224, 90, 43, 0) 72%)",
            }}
          />
        </motion.div>
      )}

      <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-0 bottom-0 left-[80%] w-[1px] bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-[70%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
    </div>
  );
}
