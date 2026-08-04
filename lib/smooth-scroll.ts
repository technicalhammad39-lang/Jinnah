"use client";

type SmoothScrollTarget = number | string | HTMLElement;

type SmoothScroller = {
  scrollTo: (
    target: SmoothScrollTarget,
    options?: {
      offset?: number;
      duration?: number;
      easing?: (time: number) => number;
      immediate?: boolean;
      lock?: boolean;
    }
  ) => void;
  resize?: () => void;
  start?: () => void;
  stop?: () => void;
};

declare global {
  interface Window {
    __lenis?: SmoothScroller;
  }
}

const premiumScrollEase = (time: number) => 1 - Math.pow(1 - time, 4);

function resolveElement(target: SmoothScrollTarget) {
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target);
  }

  if (target instanceof HTMLElement) {
    return target;
  }

  return null;
}

function resolveFallbackTop(target: SmoothScrollTarget, offset: number) {
  if (typeof target === "number") {
    return target + offset;
  }

  const element = resolveElement(target);

  if (!element) {
    return window.scrollY;
  }

  return element.getBoundingClientRect().top + window.scrollY + offset;
}

export function scrollToTarget(
  target: SmoothScrollTarget,
  options: {
    offset?: number;
    duration?: number;
    immediate?: boolean;
  } = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const { offset = 0, duration = 1.05, immediate = false } = options;
  const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = window.__lenis;

  if (lenis && !shouldReduceMotion) {
    lenis.scrollTo(target, {
      offset,
      duration,
      easing: premiumScrollEase,
      immediate,
      lock: false,
    });
    return;
  }

  window.scrollTo({
    top: resolveFallbackTop(target, offset),
    behavior: shouldReduceMotion || immediate ? "auto" : "smooth",
  });
}

export function scrollToTop() {
  scrollToTarget(0, { offset: 0 });
}
