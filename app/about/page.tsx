"use client";

import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import Image from "next/image";
import { motion } from "motion/react";
import { User, ShieldCheck, Briefcase, Target, Trophy, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const stats = [
    { label: "Years of Trust", value: "15+" },
    { label: "Premium Brands", value: "24" },
    { label: "Projects Supplied", value: "500+" },
    { label: "Expert Consultants", value: "12" },
  ];

  const timeline = [
    { year: "2010", title: "The Foundation", desc: "Jinnah Hardware started as a specialized local vendor in Lahore's historic market, initially focusing on providing highly durable architectural fittings for robust local construction projects." },
    { year: "2015", title: "Luxury Expansion", desc: "Expanded the catalog to include premium Italian and German brands, exclusively catering to luxury homes and establishing partnerships with top-tier international manufacturers." },
    { year: "2020", title: "Smart Integration", desc: "Introduced advanced smart security solutions and digital access control systems, becoming a certified and trusted dealer for major global biometric lock brands." },
    { year: "2026", title: "Industry Leader", desc: "Recognized as a premier, uncompromising supplier for Pakistan's elite architectural and commercial projects, trusted by the nation's most discerning contractors." }
  ];

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative px-6 py-20 md:py-32 bg-black/[0.02]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                Elevating <span className="text-primary font-stylish normal-case text-[1.1em]">Architecture</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            >
              We are Pakistan's premier purveyor of luxury architectural hardware, bridging the gap between world-class engineering and exceptional local design.
            </motion.p>
          </div>
        </section>

        {/* FOUNDER STORY */}
        <section className="py-20 px-6 max-w-[1740px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-3xl overflow-hidden bg-black/5">
              <Image src="https://picsum.photos/seed/founder/800/1000" alt="Ahsan Khalil - Founder" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1">Founder & CEO</p>
                <p className="text-3xl font-black">Ahsan Khalil</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold uppercase tracking-tight">Vision Led Since Day One</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Under the leadership of Ahsan Khalil, Jinnah Hardware has transformed from a traditional vendor into a consultative partner for elite contractors and designers. His relentless pursuit of quality means that every handle, lock, and hinge in our showroom has been personally evaluated for mechanical precision and aesthetic brilliance.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Hardware is the tactile interface of architecture. It's the first thing you touch when entering a room. It must feel perfect."
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black/5">
                <div className="space-y-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-widest">Uncompromising Quality</p>
                </div>
                <div className="space-y-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-widest">Consultative Approach</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE SECTION */}
        <section className="py-24 px-6 max-w-[1740px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter text-[#1a1917]">Our Journey</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto font-medium">A legacy of precision and growth over the decades.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-8">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-6 lg:pl-0 lg:pt-8 border-l-2 lg:border-l-0 lg:border-t-2 border-primary/20 hover:border-primary transition-colors duration-300"
              >
                <div className="absolute left-[-9px] lg:left-0 lg:top-[-9px] w-4 h-4 rounded-full bg-primary ring-4 ring-[#faf9f6]" />
                <h3 className="font-black text-3xl mb-1 text-primary">{item.year}</h3>
                <h4 className="font-extrabold text-lg uppercase tracking-tight text-[#1a1917] mb-3">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>



        {/* CTA */}
        <section className="py-20 px-6 bg-primary/5 border-y border-primary/10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
              Ready to elevate your project?
            </h2>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#1a1917] text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all">
              <span>Contact Our Desk</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
