"use client";

import { motion, useReducedMotion } from "motion/react";

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

export function DustParticles() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {DUST_PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="absolute rounded-full bg-white/65 shadow-[0_0_14px_rgba(255,255,255,0.24)] pointer-events-none"
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
    </>
  );
}
