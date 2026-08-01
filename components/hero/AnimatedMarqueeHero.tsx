"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import {
  motion,
  useMotionTemplate,
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

const emphasisSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
  const [glowVisible, setGlowVisible] = useState(false);
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
  const contentY = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, -10, -30]);
  const contentScale = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1.02, 1.05]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 0.8, 0]); 
  const contentBlur = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 2, 12]);
  const contentFilter = useMotionTemplate`blur(${contentBlur}px)`;
  
  const showcaseY = useTransform(scrollYProgress, [0.4, 0.8], [0, 200]);
  const imageScrollOpacity = useTransform(scrollYProgress, [0.4, 0.8], [1, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  
  const imageFloatY = useTransform(smoothTiltX, (value) => value * -0.8);
  const imageFloatX = useTransform(smoothTiltY, (value) => value * 0.7);

  const titleLines = useMemo(
    () => title.split("\n").map((line) => line.trim()).filter(Boolean),
    [title]
  );

  const titleLineData = useMemo(
    () =>
      titleLines.reduce<Array<{ words: string[]; startIndex: number }>>((lines, line) => {
        const words = line.split(" ");
        const previous = lines[lines.length - 1];
        const startIndex = previous ? previous.startIndex + previous.words.length : 0;

        lines.push({ words, startIndex });
        return lines;
      }, []),
    [titleLines]
  );

  const titleEmphasisWord = titleLineData.at(-1)?.words.at(-1);
  const totalTitleWords = titleLineData.reduce((count, line) => count + line.words.length, 0);
  const descriptionDelay = entranceDelay + (totalTitleWords + 1) * entranceStagger + 0.04;
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

    if (!glowVisible) {
      setGlowVisible(true);
    }

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
    setGlowVisible(false);
    glowOpacity.set(0);
    tiltX.set(0);
    tiltY.set(0);
  };

  const resolveWordTone = (
    lineIndex: number,
    wordIndex: number,
    isEmphasisWord: boolean,
    word: string
  ) => {
    if (isEmphasisWord) {
      return "text-[#bc7149]";
    }

    // Default other lines to black
    return "text-[#1a1815]";
  };

  return (
    <>
      <section
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
          <div className="architectural-grid absolute inset-0 opacity-60 mix-blend-multiply" />
          <div className="architectural-grid-fine absolute inset-0 opacity-35 mix-blend-multiply" />
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
                opacity: glowVisible ? smoothGlowOpacity : 0,
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
          style={{ y: contentY, opacity: contentOpacity, filter: contentFilter, scale: contentScale }}
          className="relative z-20 mx-auto flex w-full max-w-[1740px] flex-1 flex-col items-center justify-center pb-2 sm:pb-3 lg:pb-4 xl:pb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getEntranceTransition(entranceDelay, 0.82)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.32em] text-primary shadow-[0_10px_30px_rgba(224,90,43,0.08)] backdrop-blur-md sm:mb-7 sm:px-5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(224,90,43,0.65)]" />
            <span>{tagline}</span>
          </motion.div>

          <div className="w-full max-w-[92rem] space-y-5 sm:space-y-6 lg:space-y-7">
            <h1 className="mx-auto w-full text-balance text-[3.1rem] font-black leading-[0.84] tracking-[-0.052em] sm:text-[4.25rem] md:text-[5rem] lg:text-[5.35rem] xl:text-[6rem] 2xl:text-[6.85rem]">
              {titleLineData.map((line, lineIndex) => (
                <span key={lineIndex} className="flex flex-wrap justify-center">
                  {line.words.map((word, wordIndex) => {
                    const isEmphasisWord = lineIndex === 0;
                    const delay =
                      entranceDelay + (line.startIndex + wordIndex + 1) * entranceStagger;

                    return (
                      <motion.span
                        key={`${lineIndex}-${wordIndex}-${word}`}
                        initial={{ opacity: 0, y: -30, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={getEntranceTransition(delay)}
                        className={cn(
                          "inline-block align-top will-change-[transform,opacity,filter]",
                          poppins.className,
                          "font-bold tracking-tight opacity-95 text-[0.85em]",
                          wordIndex < line.words.length - 1 ? "mr-[0.22em] lg:mr-[0.24em]" : ""
                        )}
                        style={{ color: "#1a1815" }}
                      >
                        {word}
                      </motion.span>
                    );
                  })}
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={getEntranceTransition(descriptionDelay, 0.92)}
              className="mx-auto max-w-[58rem] px-2 text-sm font-medium leading-7 text-muted-foreground sm:text-base sm:leading-8 md:text-[1.08rem] lg:text-[1.16rem] will-change-[transform,opacity,filter]"
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
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
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
