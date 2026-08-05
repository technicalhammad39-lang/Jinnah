"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, User, ShieldCheck, Briefcase } from "lucide-react";
import { scrollToTarget } from "@/lib/smooth-scroll";

export function AboutSection() {
  const infoCards = [
    { value: "Ahsan Khalil", label: "Founder & CEO", icon: User },
    { value: "Hardware Specialist", label: "Experience", icon: Briefcase },
    { value: "Smart Security", label: "Core Focus", icon: ShieldCheck },
  ];

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      scrollToTarget(contactSection, { offset: -90 });
    }
  };

  return (
    <section id="about-section" className="py-24 md:py-32 bg-black/[0.01] relative z-10 border-y border-black/5">
      <div className="absolute top-[30%] left-[10%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.15]" />

      <div className="max-w-[1740px] mx-auto px-6 md:px-8 xl:px-12">
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

            {/* Floating Vision Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 p-5 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-black/5 flex items-center gap-4 z-20"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-inner">
                <User className="h-6 w-6 fill-white/20" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  Vision Led Since Day One
                </p>
                <p className="text-sm font-black text-[#1a1917] mt-0.5">
                  Ahsan Khalil
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Narrative & Info Cards */}
          <div className="lg:col-span-6 space-y-10 text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Our Heritage</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
                Serving Pakistan&apos;s <br />
                <span className="text-primary font-stylish normal-case text-[1.1em]">Elite Architecture</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-y border-black/[0.06]">
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
