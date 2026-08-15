"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { FloatingHeroActions } from "./FloatingHeroActions";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: string;
  description: string;
  ctaText: string;
  className?: string;
}

const DUST_PARTICLES = [
  { left: "8%", top: "18%", size: 2, duration: 18, delay: 0 },
  { left: "16%", top: "62%", size: 3, duration: 22, delay: 1.8 },
  { left: "24%", top: "34%", size: 2, duration: 19, delay: 3.1 },
  { left: "38%", top: "12%", size: 2, duration: 21, delay: 0.7 },
  { left: "52%", top: "70%", size: 3, duration: 24, delay: 2.5 },
  { left: "68%", top: "26%", size: 2, duration: 20, delay: 1.2 },
  { left: "76%", top: "56%", size: 2, duration: 23, delay: 3.9 },
  { left: "88%", top: "22%", size: 3, duration: 25, delay: 2.2 },
];

const WORD_ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;
const PRODUCT_REVEAL_EASE = [0.18, 1, 0.3, 1] as const;

export function AnimatedMarqueeHero({
  tagline = "PREMIUM ARCHITECTURAL HARDWARE | TRUSTED ACROSS PAKISTAN",
  title = "PREMIUM HARDWARE\nfor Exceptional Spaces.",
  description = "Discover premium architectural hardware, designer door fittings, smart security solutions, professional tools, and finishing accessories trusted by architects, builders, and homeowners across Pakistan.",
  ctaText: _ctaText = "Explore Products",
  className,
}: AnimatedMarqueeHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const [canUseParallax, setCanUseParallax] = useState(false);
  const instantTransition = { duration: 0 };
  const entranceDelay = 0.12;
  const entranceStagger = 0.1;

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);

  const smoothTiltX = useSpring(tiltX, { stiffness: 110, damping: 24, mass: 0.42 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 110, damping: 24, mass: 0.42 });
  const smoothGlowX = useSpring(glowX, { stiffness: 72, damping: 24, mass: 0.95 });
  const smoothGlowY = useSpring(glowY, { stiffness: 72, damping: 24, mass: 0.95 });
  const smoothGlowOpacity = useSpring(glowOpacity, { stiffness: 90, damping: 24, mass: 0.85 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll Exit Animation (Mapped 0 to 0.8)
  const contentY = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, -50, -100]);
  const contentScale = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 1.05, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.9, 0]); 
  const contentBlur = useTransform(scrollYProgress, [0, 0.3, 0.6], ["blur(0px)", "blur(8px)", "blur(16px)"]);
  
  const showcaseY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const imageScrollOpacity = useTransform(scrollYProgress, [0.3, 1], [1, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  
  const imageFloatY = useTransform(smoothTiltX, (value) => value * -0.8);
  const imageFloatX = useTransform(smoothTiltY, (value) => value * 0.7);

  const titleLines = useMemo(
    () => title.split("\n").map((line) => line.trim()).filter(Boolean),
    [title]
  );

  const descriptionDelay = entranceDelay + 2 * entranceStagger + 0.1;
  const showcaseRevealDelay = descriptionDelay + 0.28;
  const tickerRevealDelay = showcaseRevealDelay + 0.22;

  const getEntranceTransition = (delay: number, duration = 0.9) =>
    reduceMotion
      ? instantTransition
      : {
          duration,
          ease: WORD_ENTRANCE_EASE,
          delay,
        };

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncParallaxCapability = () => {
      setCanUseParallax(pointerQuery.matches && !motionQuery.matches);
    };

    syncParallaxCapability();
    pointerQuery.addEventListener("change", syncParallaxCapability);
    motionQuery.addEventListener("change", syncParallaxCapability);

    return () => {
      pointerQuery.removeEventListener("change", syncParallaxCapability);
      motionQuery.removeEventListener("change", syncParallaxCapability);

      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
    };
  }, []);

  const flushPointerInteraction = () => {
    pointerFrameRef.current = null;

    if (!canUseParallax || !sectionRef.current || !pointerPositionRef.current) {
      return;
    }

    const bounds = sectionRef.current.getBoundingClientRect();
    const { x, y } = pointerPositionRef.current;
    const localX = x - bounds.left;
    const localY = y - bounds.top;
    const normalizedX = localX / bounds.width;
    const normalizedY = localY / bounds.height;

    tiltX.set((0.5 - normalizedY) * 7);
    tiltY.set((normalizedX - 0.5) * 10);
    glowX.set(localX);
    glowY.set(localY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!canUseParallax) {
      return;
    }

    pointerPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    glowOpacity.set(0.1);

    if (pointerFrameRef.current !== null) {
      return;
    }

    pointerFrameRef.current = window.requestAnimationFrame(flushPointerInteraction);
  };

  const handlePointerLeave = () => {
    if (!canUseParallax) {
      return;
    }

    if (pointerFrameRef.current !== null) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
    }

    pointerPositionRef.current = null;
    glowOpacity.set(0);
    tiltX.set(0);
    tiltY.set(0);
  };



  return (
    <>
      <section
        data-hero-root
        ref={sectionRef}
        onPointerMove={canUseParallax ? handlePointerMove : undefined}
        onPointerLeave={canUseParallax ? handlePointerLeave : undefined}
        className={cn(
          "relative isolate flex min-h-[92svh] w-full flex-col overflow-hidden bg-[#f5f2ed] px-4 pt-24 pb-0 text-center sm:px-6 md:px-8 md:pt-28 lg:min-h-screen lg:px-16 xl:px-24 2xl:px-[7.5rem]",
          className
        )}
      >
        <motion.div
          aria-hidden="true"
          style={{ y: backgroundY }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(250,247,242,0.96)_34%,rgba(245,240,233,0.98)_72%,rgba(237,231,222,1)_100%)]" />
          <div className="noise-texture absolute inset-0 opacity-100 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(224,90,43,0.13),transparent_34%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(33,32,30,0.07),transparent_30%)]" />
          <div className="glow-blob-orange absolute left-1/2 top-[10%] h-[44rem] w-[44rem] -translate-x-1/2 opacity-70" />
          <div className="glow-blob-charcoal absolute bottom-[-14rem] left-[-8rem] h-[34rem] w-[34rem] opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_52%,rgba(44,34,26,0.12)_100%)]" />

          {DUST_PARTICLES.map((particle, index) => (
            <motion.span
              key={index}
              aria-hidden="true"
              className="absolute rounded-full bg-white/65 shadow-[0_0_14px_rgba(255,255,255,0.24)]"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
              }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      x: [0, 8, 0],
                      y: [0, -14, 0],
                      opacity: [0.06, 0.18, 0.06],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: particle.duration,
                      delay: particle.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />
          ))}

          {canUseParallax && (
            <motion.div
              aria-hidden="true"
              style={{
                x: smoothGlowX,
                y: smoothGlowY,
                opacity: smoothGlowOpacity,
              }}
              className="absolute h-[clamp(22rem,36vw,42rem)] w-[clamp(22rem,36vw,42rem)] will-change-transform"
            >
              <div
                className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[34px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(224, 90, 43, 0.12) 0%, rgba(224, 90, 43, 0.04) 32%, rgba(224, 90, 43, 0) 72%)",
                }}
              />
            </motion.div>
          )}

          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 left-[-30%] w-[42%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] opacity-50 blur-3xl"
            animate={reduceMotion ? undefined : { x: ["0%", "240%"] }}
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 12,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 3,
                  }
            }
          />
        </motion.div>

        <motion.div
          style={{ y: contentY, opacity: contentOpacity, scale: contentScale, filter: contentBlur }}
          className="relative z-20 mx-auto flex w-full max-w-[1740px] flex-1 flex-col items-center justify-center pb-2 sm:pb-3 lg:pb-4 xl:pb-6"
        >

          <div className="w-full max-w-[92rem] space-y-5 sm:space-y-6 lg:space-y-7 mt-10 sm:mt-14 md:mt-16">
            <h1 className="mx-auto w-full text-balance text-[3.1rem] font-black leading-[0.95] tracking-[-0.052em] sm:text-[4.25rem] md:text-[5rem] lg:text-[5.35rem] xl:text-[6rem] 2xl:text-[6.85rem]">
              {titleLines.map((line, lineIndex) => {
                const isFirstLine = lineIndex === 0;
                return (
                  <motion.span
                    key={lineIndex}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={getEntranceTransition(entranceDelay + lineIndex * entranceStagger)}
                    className={cn(
                      "block will-change-[transform,opacity]",
                      isFirstLine 
                        ? "font-stylish text-primary text-[1.25em] font-medium leading-[0.75] mb-0 sm:mb-1" 
                        : "font-bold tracking-tight opacity-95 text-[0.85em] text-[#1a1815]"
                    )}
                  >
                    {line}
                  </motion.span>
                );
              })}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={getEntranceTransition(descriptionDelay, 0.92)}
              className="mx-auto max-w-[58rem] px-2 text-sm font-medium leading-7 text-muted-foreground sm:text-base sm:leading-8 md:text-[1.08rem] lg:text-[1.16rem] will-change-[transform,opacity]"
            >
              {description}
            </motion.p>
          </div>
        </motion.div>

        <div className="relative z-10 -mt-[clamp(2.75rem,7vw,6.75rem)] w-full overflow-visible">
          <motion.div
            initial={{
              opacity: 0,
              y: 150,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={
              reduceMotion
                ? instantTransition
                : {
                    duration: 1.28,
                    ease: PRODUCT_REVEAL_EASE,
                    delay: showcaseRevealDelay,
                  }
            }
            className="relative left-1/2 z-10 w-screen -translate-x-1/2 overflow-visible"
            style={{ opacity: imageScrollOpacity }}
          >
            <motion.div
              style={{
                y: imageFloatY,
                x: imageFloatX,
                rotateX: smoothTiltX,
                rotateY: smoothTiltY,
                perspective: "1600px",
              }}
              className="relative left-1/2 w-[104vw] max-w-none -translate-x-1/2 will-change-transform"
            >
              <motion.div style={{ y: showcaseY }} className="relative will-change-transform">
                <Image
                  src="/hero-bottom.png"
                  alt="Premium hardware showcase featuring a smart lock, precision hinge, professional drill, brass lever, and finish samples."
                  width={1899}
                  height={705}
                  priority
                  sizes="100vw"
                  decoding="async"
                  className="block h-auto w-full select-none object-contain"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getEntranceTransition(tickerRevealDelay, 0.85)}
            className="relative left-1/2 z-30 -mt-[clamp(0.875rem,3vw,3rem)] w-screen -translate-x-1/2"
          >
            <TrustStrip />
          </motion.div>
        </div>
      </section>

      <FloatingHeroActions />
    </>
  );
}
