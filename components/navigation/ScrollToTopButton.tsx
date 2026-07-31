"use client";

import { ArrowUpRight } from "lucide-react";

export function ScrollToTopButton() {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={handleScrollToTop}
      className="group flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-[#faf9f6] transition-all hover:bg-primary hover:text-white"
    >
      <span>Scroll to Top</span>
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
    </button>
  );
}
