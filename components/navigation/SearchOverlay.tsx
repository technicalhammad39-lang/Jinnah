"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { useOverlayActions, useOverlayState } from "@/context/AppContext";
import { PRODUCTS } from "@/data/products";

const POPULAR_SEARCHES = ["Smart Lock", "Brass Lever", "T-Bar Pull", "Brushless", "Glass Switch"];
const QUICK_CATEGORIES = [
  { name: "Architectural Hardware", path: "/shop?category=architectural-hardware" },
  { name: "Locks & Security", path: "/shop?category=locks-security" },
  { name: "Cabinet Hardware", path: "/shop?category=cabinet-hardware" },
  { name: "Power Tools", path: "/shop?category=power-tools" },
];

export function SearchOverlay() {
  const { searchOpen } = useOverlayState();
  const { setSearchOpen } = useOverlayActions();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.__lenis?.start?.();
    };
  }, [searchOpen, setSearchOpen]);

  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      normalizedQuery
        ? PRODUCTS.filter(
            (product) =>
              product.name.toLowerCase().includes(normalizedQuery) ||
              product.brand.toLowerCase().includes(normalizedQuery) ||
              product.category.toLowerCase().includes(normalizedQuery)
          )
        : [],
    [normalizedQuery]
  );

  const featuredProducts = useMemo(() => PRODUCTS.slice(0, 3), []);

  const handlePopularClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const visibleProducts = normalizedQuery ? results : featuredProducts;

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          data-lenis-prevent
          key="overlay"
          id="search-overlay-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[#faf9f6]/95 p-4 backdrop-blur-xl md:p-12"
        >
          <div className="mb-8 flex w-full max-w-4xl justify-end md:mb-16">
            <button
              id="close-search-btn"
              onClick={() => setSearchOpen(false)}
              className="flex items-center justify-center rounded-full bg-black/5 p-3 transition-all duration-300 hover:bg-primary/10 hover:text-primary cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="w-full max-w-3xl">
            <div className="relative border-b-2 border-black/10 pb-4 transition-colors duration-300 focus-within:border-primary">
              <Search className="absolute top-2.5 left-1 h-7 w-7 text-black/30" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search premium locks, brass fittings, tools..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent pl-12 pr-10 text-xl font-medium text-[#1a1917] outline-none placeholder-black/20 md:text-3xl"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute top-3 right-2 rounded-full bg-black/5 p-1 transition-all hover:bg-black/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CornerDownLeft className="h-3 w-3" />
              <span>Press enter to search or escape to close</span>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-3 md:gap-12">
              <div className="space-y-6 md:col-span-1">
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => handlePopularClick(term)}
                        className="cursor-pointer rounded-full bg-black/5 px-3 py-1.5 text-left text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Quick Categories
                  </h4>
                  <ul className="space-y-2.5">
                    {QUICK_CATEGORIES.map((category) => (
                      <li key={category.name}>
                        <Link
                          href={category.path}
                          onClick={() => setSearchOpen(false)}
                          className="group flex items-center justify-between text-sm font-medium text-black/70 transition-all hover:text-primary"
                        >
                          <span>{category.name}</span>
                          <ArrowRight className="h-3.5 w-3.5 -translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {normalizedQuery
                    ? `Search Results (${results.length})`
                    : "Featured Hardware Innovations"}
                </h4>

                <div className="space-y-4">
                  {visibleProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex gap-4 rounded-2xl border border-transparent bg-black/5 p-3 transition-all duration-300 hover:border-black/5 hover:bg-white hover:shadow-sm"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#efece6] md:h-20 md:w-20">
                        <Image
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={product.name}
                          fill
                          sizes="(min-width: 768px) 80px, 64px"
                          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {product.brand}
                        </span>
                        <Link
                          href={`/shop?product=${product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="line-clamp-1 text-sm font-semibold text-foreground transition-colors hover:text-primary md:text-base"
                        >
                          {product.name}
                        </Link>
                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="text-xs font-bold text-[#1a1917]">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                            {product.availability}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center pr-2">
                        <Link
                          href={`/shop?product=${product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="rounded-full bg-white p-2 shadow-sm transition-all group-hover:bg-primary group-hover:text-white"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}

                  {normalizedQuery && results.length === 0 && (
                    <div className="space-y-3 py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No hardware matches your request &quot;{query}&quot;
                      </p>
                      <button
                        onClick={() => setQuery("")}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        Reset Search
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
