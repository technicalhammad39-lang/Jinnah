"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const premiumScrollEase = (time: number) => 1 - Math.pow(1 - time, 4);

export function LenisScrollProvider() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

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
    lenisRef.current = lenis;

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

    const resizeObserver = new ResizeObserver(() => {
      refresh();
    });
    
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    window.addEventListener("load", refresh, { once: true });
    window.addEventListener("resize", refresh, { passive: true });
    document.fonts?.ready.then(refresh, () => undefined);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      unsubscribe();
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      lenis.destroy();

      if (window.__lenis === lenis) {
        window.__lenis = undefined;
      }
      lenisRef.current = null;
    };
  }, []);

  // Trigger resize and reset scroll when pathname changes
  useEffect(() => {
    if (lenisRef.current) {
      window.scrollTo(0, 0);
      lenisRef.current.resize();
    }
    
    // Force a ScrollTrigger refresh after DOM updates to clear stuck pin spacers
    const timer = setTimeout(() => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
