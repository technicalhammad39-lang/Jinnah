"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Star, History, Users, Award } from "lucide-react";
import Link from "next/link";

export function AboutSection() {
  const stats = [
    { value: "35+", label: "Years Experience", icon: History },
    { value: "12,000+", label: "Builders Served", icon: Users },
    { value: "50+", label: "Global Brands", icon: Award },
  ];

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      const offsetTop = contactSection.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="about-section" className="py-24 md:py-32 bg-black/[0.01] relative z-10 border-y border-black/5">
      <div className="absolute top-[30%] left-[10%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.15]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left: Premium Image Overlap Collage */}
          <div className="lg:col-span-6 relative h-[360px] md:h-[480px] w-full max-w-[500px] mx-auto lg:mx-0">
            {/* Base Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="absolute left-0 bottom-0 w-[80%] h-[80%] rounded-[32px] overflow-hidden shadow-xl bg-[#efece6] border border-white"
            >
              <Image
                src="https://picsum.photos/seed/about1/800/800"
                alt="Jinnah Hardware Store showroom"
                fill
                sizes="(min-width: 1024px) 40vw, 80vw"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Overlapping Top-Right Image */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute right-0 top-0 w-[60%] h-[60%] rounded-[32px] overflow-hidden shadow-2xl bg-[#efece6] border-4 border-[#faf9f6]"
            >
              <Image
                src="https://picsum.photos/seed/about2/600/600"
                alt="Architectural brass handles machined"
                fill
                sizes="(min-width: 1024px) 30vw, 60vw"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Floating Trust Card Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4.5 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-black/5 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <Star className="h-5 w-5 fill-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Elite Rating
                </p>
                <p className="text-xs font-black text-foreground">
                  4.9/5 Google Maps (1.2k Reviews)
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Narrative & Stats */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Our Heritage</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
                Serving Pakistan&apos;s <br />
                <span className="text-primary">Elite Architecture</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                Jinnah Hardware Store has stood as a pioneer of quality fittings and industrial tools since inception. We cater to leading contractors, architectural designers, woodcrafters, and homeowners seeking hardware that operates flawlessly and makes a solid statement of luxury.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Our legacy rests on three uncompromising columns: curated brand selection, unmatched domain knowledge, and transparent contracting relationships.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-black/[0.06]">
              {stats.map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <StatIcon className="h-4 w-4" />
                      <span className="text-xl md:text-3xl font-black text-[#1a1917]">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Learn More Trigger */}
            <div>
              <a
                href="#contact-section"
                onClick={handleLearnMoreClick}
                className="group inline-flex items-center gap-2 px-6.5 py-3.5 rounded-full bg-[#1a1917] hover:bg-primary text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
