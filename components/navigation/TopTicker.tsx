"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useOverlayState } from "@/context/AppContext";
import { Megaphone, ExternalLink } from "lucide-react";

export function TopTicker() {
  const { ticker } = useOverlayState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !ticker.enabled || !ticker.text) return null;

  const content = (
    <div className="flex items-center gap-3 whitespace-nowrap px-8 text-[13px] sm:text-sm font-bold tracking-widest text-white uppercase">
      <Megaphone className="h-4 w-4" />
      <span>{ticker.text}</span>
      {ticker.link && <ExternalLink className="h-3.5 w-3.5 opacity-80" />}
    </div>
  );

  return (
    <div className="relative z-[100] flex w-full overflow-hidden bg-[linear-gradient(90deg,#e05a2b,#ff6b3b,#e05a2b)] py-2.5">
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
