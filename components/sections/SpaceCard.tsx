"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import { ArrowRight } from "lucide-react";

export interface SpaceCardTheme {
  background: string;
  hoverBackground: string;
  border: string;
  badge: string;
  badgeBorder: string;
  text: string;
  muted: string;
  glow: string;
  softGlow: string;
  highlight: string;
  shadow: string;
  pattern: string;
  iconRotate: number;
}

interface SpaceCardProps {
  title: string;
  items: string[];
  iconSrc: string;
  iconAlt: string;
  theme: SpaceCardTheme;
  href: string;
}

const cardHoverTransition = {
  type: "spring",
  stiffness: 250,
  damping: 24,
  mass: 0.72,
} as const;

const cardVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -12,
    scale: 1.018,
    transition: cardHoverTransition,
  },
};

const glowVariants: Variants = {
  rest: {
    opacity: 0.46,
    scale: 1,
  },
  hover: {
    opacity: 0.88,
    scale: 1.05,
    transition: cardHoverTransition,
  },
};

const ctaVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -4,
    scale: 1.045,
    transition: cardHoverTransition,
  },
};

const itemVariants: Variants = {
  rest: {
    opacity: 0.82,
    x: 0,
  },
  hover: (index: number) => ({
    opacity: 1,
    x: 4,
    transition: {
      ...cardHoverTransition,
      delay: index * 0.035,
    },
  }),
};

const particles = [
  { top: "17%", left: "18%", size: "h-1 w-1", x: 16, y: -28, delay: 0 },
  { top: "24%", left: "76%", size: "h-1.5 w-1.5", x: -18, y: -34, delay: 0.18 },
  { top: "68%", left: "82%", size: "h-1 w-1", x: -12, y: -26, delay: 0.34 },
  { top: "78%", left: "24%", size: "h-1.5 w-1.5", x: 14, y: -32, delay: 0.52 },
] as const;

export function SpaceCard({ title, items, iconSrc, iconAlt, theme, href }: SpaceCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  const springConfig = { damping: 26, stiffness: 180, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(50);
    mouseY.set(50);
  };

  const highlightBackground = useMotionTemplate`radial-gradient(520px circle at ${smoothX}% ${smoothY}%, ${theme.highlight}, transparent 44%)`;
  const iconVariants: Variants = {
    rest: {
      y: 0,
      rotate: theme.iconRotate,
      scale: 1,
    },
    hover: {
      y: -9,
      rotate: theme.iconRotate + (theme.iconRotate > 0 ? 5 : -5),
      scale: 1.08,
      transition: cardHoverTransition,
    },
  };

  return (
    <div data-premium-card className="relative pb-9 pt-[72px] md:pt-20">
      <motion.div
        ref={ref}
        data-space-card={title}
        variants={cardVariants}
        initial="rest"
        whileHover={reduceMotion ? undefined : "hover"}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative min-h-[392px] rounded-[30px] will-change-transform md:min-h-[430px]"
      >
        <motion.div
          aria-hidden="true"
          variants={glowVariants}
          className="pointer-events-none absolute -inset-4 rounded-[36px] blur-2xl will-change-transform"
          style={{
            background: `radial-gradient(circle at 50% 62%, ${theme.glow}, transparent 58%)`,
          }}
        />

        <div
          data-space-card-icon-badge={title}
          className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            variants={iconVariants}
            className="relative flex h-[142px] w-[142px] items-center justify-center rounded-[34px] border backdrop-blur-2xl will-change-transform md:h-40 md:w-40 md:rounded-[38px]"
            style={{
              background: theme.badge,
              borderColor: theme.badgeBorder,
              boxShadow: `0 30px 62px -24px rgba(0, 0, 0, 0.82), 0 0 46px -12px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.34)`,
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-2 rounded-[30px] opacity-80 blur-2xl md:rounded-[34px]"
              style={{ background: theme.glow }}
            />
            <Image
              src={iconSrc}
              alt={iconAlt}
              width={160}
              height={160}
              sizes="136px"
              className="relative z-10 h-[118px] w-[118px] object-contain opacity-95 drop-shadow-[0_22px_26px_rgba(0,0,0,0.46)] md:h-[136px] md:w-[136px]"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </motion.div>
        </div>

        <div
          data-space-card-panel={title}
          className="relative min-h-[392px] overflow-hidden rounded-[30px] border px-6 pb-20 pt-20 backdrop-blur-2xl md:min-h-[430px] md:px-8 md:pt-24"
          style={{
            background: theme.background,
            borderColor: theme.border,
            boxShadow: theme.shadow,
            color: theme.text,
          }}
        >
          <div className="absolute inset-0" style={{ background: theme.background }} />
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            style={{ background: theme.hoverBackground }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden opacity-0 mix-blend-screen transition-opacity duration-500 ease-out group-hover:opacity-100 md:block"
            style={{ background: highlightBackground }}
          />
          <div aria-hidden="true" className="absolute inset-0 opacity-70" style={{ background: theme.pattern }} />
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-56 w-56 rounded-full blur-3xl"
            style={{ background: theme.softGlow }}
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-70 blur-3xl"
            style={{ background: theme.glow }}
          />
          <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-white/45" />
          <div aria-hidden="true" className="absolute inset-y-8 left-0 w-px bg-white/10" />
          <div className="absolute right-7 top-7 z-10 h-12 w-12 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl md:right-8 md:top-8">
            <div className="absolute inset-3 rounded-full bg-[#FF6A2A] shadow-[0_0_22px_rgba(255,106,42,0.75)]" />
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.span
                aria-hidden="true"
                key={`${title}-${particle.top}-${particle.left}`}
                variants={{
                  rest: { opacity: 0, x: 0, y: 0, scale: 0.7 },
                  hover: {
                    opacity: [0, 0.95, 0],
                    x: [0, particle.x, particle.x * 1.35],
                    y: [0, particle.y, particle.y * 1.35],
                    scale: [0.7, 1, 0.45],
                    transition: {
                      duration: 1.9,
                      delay: particle.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  },
                }}
                className={`absolute rounded-full bg-[#FF6A2A] shadow-[0_0_16px_rgba(255,106,42,0.75)] will-change-transform ${particle.size}`}
                style={{ top: particle.top, left: particle.left }}
              />
            ))}
          </div>

          <div className="relative z-10 flex min-h-[235px] flex-col justify-end md:min-h-[260px]">
            <div>
              <h3 className="max-w-[12rem] text-3xl font-black leading-[0.95] tracking-tight md:max-w-[13rem] md:text-[2.15rem]">
                {title}
              </h3>

              <ul className="mt-6 grid gap-3">
                {items.map((item, index) => (
                  <motion.li
                    key={item}
                    custom={index}
                    variants={itemVariants}
                    className="flex items-center gap-3 text-sm font-semibold leading-none tracking-normal will-change-transform"
                    style={{ color: theme.muted }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6A2A] shadow-[0_0_10px_rgba(255,106,42,0.82)]" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          data-space-card-cta={title}
          className="absolute bottom-0 left-1/2 z-20 h-14 min-w-[220px] -translate-x-1/2 translate-y-1/2 px-2"
        >
          <motion.div variants={ctaVariants} className="h-full will-change-transform">
            <Link
              href={href}
              aria-label={`Explore ${title} collection`}
              className="relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/35 bg-gradient-to-r from-[#f15a24] via-[#ff762d] to-[#f59d45] px-6 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_20px_38px_-16px_rgba(255,106,42,0.90),inset_0_1px_0_rgba(255,255,255,0.46)] backdrop-blur-xl transition-[filter,border-color] duration-300 ease-out hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a3d]/55"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.34), transparent 48%)",
                }}
              />
              <span className="relative z-10 whitespace-nowrap">Explore Collection</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
