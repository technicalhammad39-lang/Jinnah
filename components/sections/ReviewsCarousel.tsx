"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";
import Image from "next/image";

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
}

export function ReviewsCarousel({ initialReviews = [] }: { initialReviews?: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // If we didn't get initial reviews, fetch them
    if (!initialReviews || initialReviews.length === 0) {
      import("@/lib/data-fetcher").then((mod) => {
        mod.getReviews().then((data) => setReviews(data));
      });
    }
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + 1;
        if (nextIndex >= reviews.length) nextIndex = 0;
        return nextIndex;
      });
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(timer);
  }, [currentIndex, reviews.length, isPaused]);

  if (reviews.length === 0) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 200 : -200,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = reviews.length - 1;
      if (nextIndex >= reviews.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-12 md:py-16 relative overflow-x-hidden bg-transparent">
      {/* Subtle Background Accent */}
      <div className="absolute top-[20%] left-[-5%] w-[40vw] h-[40vw] rounded-full glow-blob-orange opacity-[0.1] pointer-events-none" />
      <div className="hidden md:block absolute top-[5%] -left-[4%] w-[320px] h-[320px] opacity-[0.22] -rotate-[5deg] pointer-events-none">
        <Image src="/hero-shape.svg" alt="decorative shape" fill className="object-contain" />
      </div>
      <div className="hidden md:block absolute top-[10%] -right-[4%] w-[280px] h-[280px] opacity-[0.18] rotate-[10deg] scale-x-[-1] pointer-events-none">
        <Image src="/hero-shape.svg" alt="decorative shape" fill className="object-contain" />
      </div>

      <div className="max-w-[1200px] mx-auto text-center mb-10 relative z-10 px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest justify-center mb-4">
          <span>Testimonials</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#1a1917]">
          What Our Clients Say
        </h2>
        <p className="mt-4 text-muted-foreground font-medium max-w-2xl mx-auto">
          Hear from the architects, builders, and homeowners who trust our hardware.
        </p>
      </div>

      <div className="relative w-full py-8 md:py-12">
        {/* The solid rotated orange shape behind the cards */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-[150vw] -left-[25vw] h-[95%] sm:h-[105%] bg-primary -rotate-3 origin-center z-0" />

        <div 
          className="relative max-w-4xl mx-auto h-[320px] md:h-[400px] flex items-center justify-center z-10 px-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsPaused(false), 2000);
          }}
        >
          {/* Previous Button (All viewports) */}
        <button
          className="flex absolute left-0 sm:-left-6 md:-left-12 z-20 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-[#1a1917] hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 -translate-x-2 sm:translate-x-0"
          onClick={() => paginate(-1)}
          aria-label="Previous review"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <div className="w-full h-full relative flex items-center justify-center perspective-1000">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.4 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-4 sm:px-12 md:px-20 touch-pan-y cursor-grab active:cursor-grabbing"
            >
              <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-black/5 flex flex-col items-center text-center h-[280px] md:h-[350px] overflow-hidden relative group">
                <Quote className="absolute top-4 right-6 w-16 h-16 md:w-24 md:h-24 text-black/[0.02] -scale-x-100 rotate-12 transition-transform duration-500 group-hover:rotate-0" />
                
                {currentReview.image && (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-4 border-4 border-[#faf9f6] shadow-sm shrink-0">
                    <Image
                      src={getPublicUploadUrl(currentReview.image)}
                      alt={currentReview.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <div className="flex gap-1 mb-4 text-[#FFB800] shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill={i < currentReview.rating ? "currentColor" : "none"}
                      stroke={i < currentReview.rating ? "currentColor" : "#e5e7eb"}
                    />
                  ))}
                </div>

                <div className="flex-1 overflow-hidden w-full px-2 mb-4 relative z-10 flex items-center justify-center">
                  <p className="text-sm sm:text-base md:text-xl text-[#1a1917] font-medium leading-relaxed italic line-clamp-4 md:line-clamp-none">
                    "{currentReview.text}"
                  </p>
                </div>

                <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-tight text-[#1a1917] shrink-0 mt-auto relative z-10">
                  {currentReview.name}
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button (All viewports) */}
        <button
          className="flex absolute right-0 sm:-right-6 md:-right-12 z-20 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-[#1a1917] hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 translate-x-2 sm:translate-x-0"
          onClick={() => paginate(1)}
          aria-label="Next review"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 mt-12 relative z-10 px-6">
        <div className="flex items-center gap-3">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`transition-all duration-300 rounded-full focus:outline-none ${
                i === currentIndex
                  ? "w-8 h-2 bg-primary"
                  : "w-2 h-2 bg-[#1a1917]/20 hover:bg-[#1a1917]/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
