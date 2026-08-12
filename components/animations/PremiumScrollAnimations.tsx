"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EASE = "power3.out";
const SECTION_SELECTOR = "section:not([data-hero-root])";
const CARD_SELECTOR =
  ".grid > *, form, iframe, [data-premium-card], [data-gallery-panel]";

function uniqueElements(elements: HTMLElement[]) {
  return Array.from(new Set(elements)).filter(
    (element) => !element.closest("[data-no-premium-reveal]")
  );
}

function querySectionCards(section: HTMLElement) {
  const candidates = Array.from(section.querySelectorAll<HTMLElement>(CARD_SELECTOR));

  return uniqueElements(
    candidates.filter((element) => {
      const parentGrid = element.parentElement?.classList.contains("grid");
      const isStandaloneSurface =
        element.matches("form, iframe, [data-premium-card], [data-gallery-panel]");

      return parentGrid || isStandaloneSurface;
    })
  ).slice(0, 18);
}

export function PremiumScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldReduceMotion) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      const elements = document.querySelectorAll(SECTION_SELECTOR);
      if (elements.length > 0) {
        gsap.set(elements, { clearProps: "all" });
      }
      return undefined;
    }

    let context: gsap.Context;
    let timer: number;

    // Use a slight delay to allow Next.js route transitions and dynamic content to settle
    timer = window.setTimeout(() => {
      context = gsap.context(() => {
        const elements = document.querySelectorAll<HTMLElement>(SECTION_SELECTOR);
        if (elements.length === 0) return;
        const sections = gsap.utils.toArray<HTMLElement>(elements);

        sections.forEach((section) => {
          // Explicitly skip sections that opt-out or have motion animations
          if (section.closest("[data-no-premium-reveal]")) return;

          const badge = section.querySelector<HTMLElement>(
            ".inline-flex.items-center.gap-2.rounded-full"
          );
          const heading = section.querySelector<HTMLElement>("h2");
          const introText = uniqueElements(
            Array.from(section.querySelectorAll<HTMLElement>("p")).filter(
              (paragraph) => paragraph.closest("section") === section
            )
          ).slice(0, 2);
          
          const cards = querySectionCards(section);
          
          const targets = uniqueElements(
            [badge, heading, ...introText, ...cards].filter(Boolean) as HTMLElement[]
          );

          if (targets.length === 0) {
            return;
          }

          // Important: use clearProps to prevent elements from being permanently hidden if ScrollTrigger breaks
          gsap.set(targets, {
            force3D: true,
            willChange: "transform,opacity",
          });

          const timeline = gsap.timeline({
            defaults: {
              ease: EASE,
              overwrite: "auto",
            },
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none none",
              // On enter back, we ensure elements are visible if the user scrolls up quickly
              onEnterBack: () => timeline.play(),
            },
          });

          if (badge) {
            timeline.fromTo(
              badge,
              { autoAlpha: 0, y: 16, scale: 0.98 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, immediateRender: false },
              0
            );
          }

          if (heading) {
            timeline.fromTo(
              heading,
              { autoAlpha: 0, y: 28 },
              { autoAlpha: 1, y: 0, duration: 0.72, immediateRender: false },
              0.04
            );
          }

          if (introText.length > 0) {
            timeline.fromTo(
              introText,
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.07, immediateRender: false },
              0.12
            );
          }

          if (cards.length > 0) {
            timeline.fromTo(
              cards,
              { autoAlpha: 0, y: 34, rotate: (index) => (index % 2 === 0 ? -0.8 : 0.8), scale: 0.985 },
              { autoAlpha: 1, y: 0, rotate: 0, scale: 1, duration: 0.72, stagger: 0.055, immediateRender: false },
              0.18
            );
          }
        });

        // Trigger refresh a frame later to ensure layout calculations are accurate
        window.requestAnimationFrame(() => ScrollTrigger.refresh());
      }, document.body);
    }, 150);

    return () => {
      if (timer) window.clearTimeout(timer);
      if (context) {
        // When cleaning up, clear all inline styles added by GSAP to prevent elements from staying hidden
        gsap.set(`${SECTION_SELECTOR} *, ${CARD_SELECTOR}`, { clearProps: "all" });
        context.revert();
      }
    };
  }, [pathname]);

  return null;
}
