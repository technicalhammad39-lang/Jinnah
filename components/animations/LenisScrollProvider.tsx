"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const premiumScrollEase = (time: number) => 1 - Math.pow(1 - time, 4);

export function LenisScrollProvider() {
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotionQuery.matches) {
      window.__lenis = undefined;
      document.documentElement.classList.add("lenis-disabled");

      return () => {
        document.documentElement.classList.remove("lenis-disabled");
      };
    }

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      lerp: coarsePointer ? 0.12 : 0.085,
      duration: coarsePointer ? 0.82 : 1.05,
      easing: premiumScrollEase,
      touchMultiplier: 1.08,
      wheelMultiplier: 0.86,
      gestureOrientation: "vertical",
      overscroll: false,
      anchors: false,
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });

    window.__lenis = lenis;

    let disposed = false;
    let updateScrollTrigger: () => void = () => undefined;
    let refreshScrollTrigger: () => void = () => undefined;
    const unsubscribe = lenis.on("scroll", () => updateScrollTrigger());

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        const gsap = gsapModule.default;
        const { ScrollTrigger } = scrollTriggerModule;

        gsap.registerPlugin(ScrollTrigger);
        updateScrollTrigger = () => ScrollTrigger.update();
        refreshScrollTrigger = () => ScrollTrigger.refresh();

        if (!disposed) {
          ScrollTrigger.refresh();
        }
      }
    );
    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    const refresh = () => {
      lenis.resize();
      refreshScrollTrigger();
    };

    window.addEventListener("load", refresh, { once: true });
    window.addEventListener("resize", refresh, { passive: true });
    document.fonts?.ready.then(refresh, () => undefined);

    return () => {
      disposed = true;
      unsubscribe();
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      lenis.destroy();

      if (window.__lenis === lenis) {
        window.__lenis = undefined;
      }
    };
  }, []);

  return null;
}
