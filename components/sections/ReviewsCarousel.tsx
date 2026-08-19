"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";

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

  useEffect(() => {
    // If we didn't get initial reviews, fetch them
    if (!initialReviews || initialReviews.length === 0) {
      import("@/lib/data-fetcher").then((mod) => {
        mod.getReviews().then((data) => setReviews(data));
      });
    }
  }, []);

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
    <section className="py-24 px-6 bg-[#faf9f6] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#1a1917]">
          What Our Clients Say
        </h2>
        <p className="mt-4 text-muted-foreground font-medium">
          Hear from the architects, builders, and homeowners who trust our hardware.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto h-[450px] md:h-[400px] flex items-center justify-center">
        <button
          className="absolute left-0 md:-left-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-[#1a1917] hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={() => paginate(-1)}
          aria-label="Previous review"
        >
          <ChevronLeft className="w-6 h-6" />
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
              className="absolute w-full px-12 md:px-20 touch-pan-y cursor-grab active:cursor-grabbing"
            >
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-black/5 flex flex-col items-center text-center">
                {currentReview.image && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-6 border-4 border-[#faf9f6] shadow-lg shrink-0">
                    <Image
                      src={getPublicUploadUrl(currentReview.image)}
                      alt={currentReview.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <div className="flex gap-1 mb-6 text-[#FFB800]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5"
                      fill={i < currentReview.rating ? "currentColor" : "none"}
                      stroke={i < currentReview.rating ? "currentColor" : "#e5e7eb"}
                    />
                  ))}
                </div>

                <p className="text-lg md:text-xl text-[#1a1917] font-medium leading-relaxed italic mb-8 max-w-2xl">
                  "{currentReview.text}"
                </p>

                <h3 className="text-xl font-bold uppercase tracking-tight text-[#1a1917]">
                  {currentReview.name}
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          className="absolute right-0 md:-right-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-[#1a1917] hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={() => paginate(1)}
          aria-label="Next review"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3 mt-12">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`transition-all duration-300 rounded-full focus:outline-none ${
              i === currentIndex
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-black/10 hover:bg-black/20"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
