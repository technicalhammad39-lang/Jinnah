"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, Product } from "@/data/products";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ArrowRight, CornerDownLeft } from "lucide-react";
import Link from "next/link";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => {
        setQuery("");
      }, 0);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [searchOpen]);

  const results = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handlePopularClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          key="overlay"
          id="search-overlay-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#faf9f6]/95 backdrop-blur-xl flex flex-col items-center p-4 md:p-12 overflow-y-auto"
        >
          {/* Close button */}
          <div className="w-full max-w-4xl flex justify-end mb-8 md:mb-16">
            <button
              id="close-search-btn"
              onClick={() => setSearchOpen(false)}
              className="p-3 rounded-full bg-black/5 hover:bg-primary/10 hover:text-primary transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="w-full max-w-3xl">
            {/* Input box */}
            <div className="relative border-b-2 border-black/10 focus-within:border-primary transition-colors duration-300 pb-4">
              <Search className="absolute left-1 top-2.5 h-7 w-7 text-black/30" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search premium locks, brass fittings, tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-10 text-xl md:text-3xl font-medium placeholder-black/20 outline-none text-[#1a1917]"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-3 p-1 rounded-full bg-black/5 hover:bg-black/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Hint message */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
              <CornerDownLeft className="h-3 w-3" />
              <span>Press enter to search or escape to close</span>
            </div>

            {/* Content spacing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12 md:mt-16">
              {/* Popular keywords / categories */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["Smart Lock", "Brass Lever", "T-Bar Pull", "Brushless", "Glass Switch"].map(
                      (term) => (
                        <button
                          key={term}
                          onClick={() => handlePopularClick(term)}
                          className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-primary/10 hover:text-primary text-sm font-medium transition-all duration-200 cursor-pointer text-left"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Quick Categories
                  </h4>
                  <ul className="space-y-2.5">
                    {[
                      { name: "Architectural Hardware", path: "/shop?category=architectural-hardware" },
                      { name: "Locks & Security", path: "/shop?category=locks-security" },
                      { name: "Cabinet Hardware", path: "/shop?category=cabinet-hardware" },
                      { name: "Power Tools", path: "/shop?category=power-tools" },
                    ].map((cat) => (
                      <li key={cat.name}>
                        <Link
                          href={cat.path}
                          onClick={() => setSearchOpen(false)}
                          className="text-sm font-medium text-black/70 hover:text-primary transition-all flex items-center justify-between group"
                        >
                          <span>{cat.name}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Live search results */}
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  {query ? `Search Results (${results.length})` : "Featured Hardware Innovations"}
                </h4>

                <div className="space-y-4">
                  {(query ? results : PRODUCTS.slice(0, 3)).map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      className="flex gap-4 p-3 rounded-2xl bg-black/5 hover:bg-white border border-transparent hover:border-black/5 hover:shadow-sm transition-all duration-300 group"
                    >
                      <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-[#efece6] flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-center min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {product.brand}
                        </span>
                        <Link
                          href={`/shop?product=${product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="text-sm md:text-base font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-bold text-[#1a1917]">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                            {product.availability}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center pr-2">
                        <Link
                          href={`/shop?product=${product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="p-2 rounded-full bg-white group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}

                  {query && results.length === 0 && (
                    <div className="text-center py-12 space-y-3">
                      <p className="text-muted-foreground text-sm">
                        No hardware matches your request &quot;{query}&quot;
                      </p>
                      <button
                        onClick={() => setQuery("")}
                        className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
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
