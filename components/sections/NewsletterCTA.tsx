"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Send, CheckCircle2, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { scrollToTarget } from "@/lib/smooth-scroll";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    submitTimerRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
      resetTimerRef.current = window.setTimeout(() => setIsSuccess(false), 5000);
    }, 1000);
  };

  const handleVisitStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const mapSection = document.getElementById("contact-section");
    if (mapSection) {
      scrollToTarget(mapSection, { offset: -90 });
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[#1a1917] text-white relative overflow-hidden z-10 border-t border-white/10">
      {/* Heavy orange glow behind content */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full radial-gradient opacity-[0.25] blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 90, 31, 0.2) 0%, rgba(255, 90, 31, 0) 70%)"
        }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
        
        {/* Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4.5 py-1.5 text-[10px] font-bold text-primary tracking-widest uppercase"
        >
          <Sparkles className="h-4 w-4" />
          <span>JOIN OUR EXCLUSIVE BUILDER NETWORK</span>
        </motion.div>

        {/* Headline block */}
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9] max-w-2xl mx-auto">
            Ready to Build <br />
            <span className="text-primary">Something Better?</span>
          </h2>
          <p className="text-sm md:text-base text-white/60 max-w-md mx-auto leading-relaxed font-medium">
            Sign up to receive announcements about Italian brass lever arrivals, biometric firmware patches, and exclusive commercial contractor discounts.
          </p>
        </div>

        {/* Newsletter input or success state */}
        <div className="max-w-md mx-auto">
          {!isSuccess ? (
            <form onSubmit={handleSubscribe} className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1.5 focus-within:border-primary transition-colors">
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent pl-5 pr-12 text-xs md:text-sm font-semibold outline-none text-white placeholder-white/30"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="p-3.5 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center cursor-pointer shadow-lg hover:shadow-primary/20 transition-all"
                title="Subscribe"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-full">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Successfully Subscribed to Ticker
              </span>
            </div>
          )}
        </div>

        {/* Redundant CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link
            href="/shop"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-primary/25 cursor-pointer"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>

          <a
            href="#contact-section"
            onClick={handleVisitStoreClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer"
          >
            <Store className="h-4 w-4 text-primary" />
            <span>Visit Showroom</span>
          </a>
        </div>

      </div>
    </section>
  );
}
