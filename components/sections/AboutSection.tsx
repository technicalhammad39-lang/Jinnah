"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, User, ShieldCheck, Briefcase } from "lucide-react";
import { scrollToTarget } from "@/lib/smooth-scroll";

export function AboutSection() {
  const infoCards = [
    { value: "Ahsan Khalil", label: "Founder & CEO", icon: User },
    { value: "Hardware Specialist", label: "Experience", icon: Briefcase },
    { value: "Premium Hardware", label: "Core Focus", icon: ShieldCheck },
  ];

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      scrollToTarget(contactSection, { offset: -90 });
    }
  };

  return (
    <section id="about-section" data-no-premium-reveal className="py-24 md:py-32 bg-black/[0.01] relative z-10 border-y border-black/5">
      <div className="absolute top-[30%] left-[10%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.15]" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left: Premium Image Overlap Collage */}
          <div className="lg:col-span-6 relative h-[400px] md:h-[500px] lg:h-[550px] xl:h-[650px] w-full max-w-[500px] sm:max-w-[600px] mx-auto lg:max-w-none lg:mx-0 lg:pr-10 xl:pr-16">
            {/* Base Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="absolute left-0 bottom-0 w-[80%] h-[80%] rounded-[32px] overflow-hidden shadow-xl bg-[#efece6] border border-white z-0"
            >
              <Image
                src="/why-back.jpg"
                alt="Jinnah Hardware Store showroom"
                fill
                sizes="(min-width: 1024px) 40vw, 80vw"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Overlapping Top-Right Image with Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute right-0 top-0 w-[60%] h-[60%] z-20"
            >
              <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl bg-[#efece6] border-4 border-[#faf9f6]">
                <Image
                  src="/ahsan.png"
                  alt="Ahsan Khalil Founder"
                  fill
                  className="h-full w-full object-cover object-top"
                />
              </div>

              {/* Floating Vision Badge (Anchored to corner) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -left-4 sm:-left-12 -bottom-6 sm:-bottom-8 p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-black/5 flex items-center gap-3 sm:gap-4 z-30"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-inner shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 fill-white/20" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] sm:text-[10px] font-extrabold text-primary uppercase tracking-widest leading-none">
                    Vision Led Since Day One
                  </p>
                  <p className="text-xs sm:text-sm font-black text-[#1a1917] mt-1 leading-none">
                    Ahsan Khalil
                  </p>
                </div>
              </motion.div>
            </motion.div>


          </div>

          {/* Right: Narrative & Info Cards */}
          <div className="lg:col-span-6 space-y-10 text-left">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] leading-[0.95]">
                Premium Hardware <br />
                <span className="text-primary font-stylish text-[1.1em]">Built On Trust</span>
              </h2>
              
              <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                <p>
                  Jinnah Hardware Store was founded with a singular vision: to bridge the gap between world-class architectural hardware and Pakistan's rapidly evolving premium construction sector. Under the leadership of Ahsan Khalil, we have grown from a specialized local vendor into a trusted partner for the country's most ambitious building projects.
                </p>
                <p>
                  We believe that hardware is the tactile interface of architecture. Every door handle, smart lock, and structural hinge we supply is meticulously evaluated for endurance, aesthetic brilliance, and mechanical precision. Our commitment goes beyond merely supplying products; we provide deep technical consulting and forge long-term, transparent relationships with elite contractors and designers.
                </p>
              </div>
            </div>

            {/* Info Cards Row (Replacing Fake Stats) */}
            <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 gap-6 py-8 border-y border-black/[0.06]">
              {infoCards.map((card) => {
                const CardIcon = card.icon;
                return (
                  <div key={card.label} className="space-y-2 group">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <CardIcon className="h-4 w-4" />
                      </div>
                      <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {card.label}
                      </p>
                    </div>
                    <p className="text-sm md:text-base font-black text-[#1a1917] leading-tight">
                      {card.value}
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
                <span>Connect With The Founder</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
