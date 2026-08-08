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

    const context = gsap.context(() => {
      const elements = document.querySelectorAll<HTMLElement>(SECTION_SELECTOR);
      if (elements.length === 0) return;
      const sections = gsap.utils.toArray<HTMLElement>(elements);

      sections.forEach((section) => {
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
            start: "top 82%",
            end: "bottom 18%",
            toggleActions: "play none none none",
          },
        });

        if (badge) {
          timeline.from(
            badge,
            { autoAlpha: 0, y: 16, scale: 0.98, duration: 0.5, immediateRender: false },
            0
          );
        }

        if (heading) {
          timeline.from(
            heading,
            { autoAlpha: 0, y: 28, duration: 0.72, immediateRender: false },
            0.04
          );
        }

        if (introText.length > 0) {
          timeline.from(
            introText,
            { autoAlpha: 0, y: 22, duration: 0.62, stagger: 0.07, immediateRender: false },
            0.12
          );
        }

        if (cards.length > 0) {
          timeline.from(
            cards,
            {
              autoAlpha: 0,
              y: 34,
              rotate: (index) => (index % 2 === 0 ? -0.8 : 0.8),
              scale: 0.985,
              duration: 0.72,
              stagger: 0.055,
              immediateRender: false,
            },
            0.18
          );
        }
      });

      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }, document.body);

    return () => {
      context.revert();
    };
  }, [pathname]);

  return null;
}
