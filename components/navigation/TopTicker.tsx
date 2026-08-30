"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useOverlayState } from "@/context/AppContext";
import { Megaphone, ExternalLink } from "lucide-react";
import { useIsScrolling } from "@/hooks/useIsScrolling";

export function TopTicker() {
  const { ticker } = useOverlayState();
  const [mounted, setMounted] = useState(false);
  const isScrolling = useIsScrolling(250);
  const [isElevated, setIsElevated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsElevated(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once to initialize
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted || !ticker.enabled || !ticker.text) return null;

  const content = (
    <div className="flex items-center gap-3 whitespace-nowrap px-8 text-[13px] sm:text-sm font-bold tracking-widest text-white uppercase">
      <Megaphone className="h-4 w-4" />
      <span>{ticker.text}</span>
      {ticker.link && <ExternalLink className="h-3.5 w-3.5 opacity-80" />}
    </div>
  );

  const isVisible = !isElevated || !isScrolling;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] flex w-full overflow-hidden bg-[linear-gradient(90deg,#e05a2b,#ff6b3b,#e05a2b)] py-2.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="ticker-track flex w-max min-w-full items-center">
        {/* Render multiple copies for a seamless loop */}
        <div className="ticker-content flex min-w-full shrink-0 justify-around">
          {ticker.link ? (
            <Link href={ticker.link} className="hover:opacity-90 transition-opacity block">
              {content}
            </Link>
          ) : (
            content
          )}
        </div>
        <div className="ticker-content flex min-w-full shrink-0 justify-around">
          {ticker.link ? (
            <Link href={ticker.link} className="hover:opacity-90 transition-opacity block">
              {content}
            </Link>
          ) : (
            content
          )}
        </div>
        <div className="ticker-content flex min-w-full shrink-0 justify-around">
          {ticker.link ? (
            <Link href={ticker.link} className="hover:opacity-90 transition-opacity block">
              {content}
            </Link>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}
