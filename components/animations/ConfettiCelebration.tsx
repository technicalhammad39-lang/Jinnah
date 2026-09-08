"use client";

import { useEffect, useRef } from "react";

interface ConfettiCelebrationProps {
  duration?: number; // duration in ms, default 4500ms
  particleCount?: number;
}

export default function ConfettiCelebration({
  duration = 4500,
  particleCount = 120,
}: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle responsive resize
    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Color palette: Brand Orange, Vibrant Amber, Emerald Green, Royal Blue, Gold
    const colors = [
      "#E05A2B", // Brand Orange
      "#F59E0B", // Vibrant Amber
      "#10B981", // Emerald Green
      "#3B82F6", // Royal Blue
      "#FBBF24", // Golden Yellow
      "#8B5CF6", // Purple
      "#EC4899", // Pink
    ];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      shape: "rect" | "circle" | "ribbon";
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const particles: Particle[] = [];

    // Initialize confetti particles from top and center
    for (let i = 0; i < particleCount; i++) {
      const isRibbon = Math.random() > 0.65;
      const isCircle = !isRibbon && Math.random() > 0.5;

      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * (width * 0.8),
        y: Math.random() * -height * 0.4, // start above the screen
        size: isRibbon ? Math.random() * 8 + 8 : Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 6,
        speedY: Math.random() * 4 + 3.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: isRibbon ? "ribbon" : isCircle ? "circle" : "rect",
        opacity: 1,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.05 + 0.03,
      });
    }

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply physics
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobble) * 1.5;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;

        // Fade out towards the end of duration
        if (elapsed > duration * 0.65) {
          const fadeProgress = (elapsed - duration * 0.65) / (duration * 0.35);
          p.opacity = Math.max(0, 1 - fadeProgress);
        }

        if (p.y < height + 50 && p.opacity > 0.01) {
          aliveCount++;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          } else if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Ribbon shape
            ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size * 0.4, p.size * 2);
          }

          ctx.restore();
        }
      }

      if (elapsed < duration && aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
