"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";

export function FeaturedProductsCarousel({ products }: { products: Product[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 340 : 400;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 340 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation Buttons */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-[40%] z-20 -translate-y-1/2 -translate-x-2 md:-translate-x-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1a1917] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/5 opacity-0 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white group-hover/carousel:opacity-100 hidden md:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={scrollRight}
        className="absolute right-0 top-[40%] z-20 -translate-y-1/2 translate-x-2 md:translate-x-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1a1917] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/5 opacity-0 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white group-hover/carousel:opacity-100 hidden md:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Product Cards Row */}
      <div 
        ref={scrollContainerRef}
        className="flex flex-nowrap overflow-x-auto gap-6 xl:gap-8 py-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[85vw] sm:w-[340px] lg:w-[380px] shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
