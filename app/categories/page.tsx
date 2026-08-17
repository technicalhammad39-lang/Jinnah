"use client";

import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import Image from "next/image";
import { motion } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Box, Layers, Hammer, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/data/products";
import { getPublicUploadUrl } from "@/lib/utils";

export default function CategoriesPage() {
  const applications = [
    { title: "Residential Villas", icon: Box, desc: "Premium fittings for luxury home entrances and interiors. Ensuring unparalleled security combined with bespoke architectural aesthetics for modern and classic estates." },
    { title: "Commercial Offices", icon: Layers, desc: "High-traffic endurance hardware and access control. Engineered to withstand heavy daily use while maintaining sleek, professional profiles for corporate environments." },
    { title: "Hospitality", icon: ShieldCheck, desc: "Electronic hotel locks and master key systems. Delivering seamless guest experiences through cutting-edge access technology and highly durable, beautifully finished door hardware." },
    { title: "Industrial", icon: Hammer, desc: "Heavy-duty machinery and power tools for construction. Built for extreme conditions, providing uncompromising reliable performance and safety for large-scale industrial projects." },
  ];

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        {/* HERO WITH SVG INTEGRATION */}
        <section className="relative w-full overflow-hidden px-6 pt-4 pb-12 md:pt-8 md:pb-16">
          {/* Decorative Glows */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,106,42,0.08)_0%,transparent_70%)] pointer-events-none rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,0,0,0.05)_0%,transparent_70%)] pointer-events-none rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-[1400px] mx-auto text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 w-full max-w-5xl mx-auto mb-4 md:mb-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-[#1a1917] leading-[0.95] md:whitespace-nowrap">
                Precision{" "}
                <span className="text-primary font-stylish normal-case text-[1.1em]">Collections</span>
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto whitespace-normal">
                Discover our meticulously organized catalog of architectural hardware. From mechanical masterpieces to smart security solutions, find exactly what your project demands.
              </p>
            </motion.div>
          </div>

          {/* Central SVG Graphic Edge-to-Edge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] z-10 mt-0"
          >
            <Image 
              src="/catos.svg" 
              alt="Categories Hero Architecture" 
              fill 
              className="object-cover object-bottom" 
              priority
            />
          </motion.div>
        </section>

        {/* ALL CATEGORIES GRID */}
        <section className="pt-32 pb-24 bg-white rounded-t-[3rem] md:rounded-t-[4rem] relative overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.03)] mt-8">
          {/* Top Orange Gradient */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/15 to-transparent pointer-events-none" />
          
          <div className="max-w-[1740px] mx-auto px-6 relative z-10">
            <div className="relative z-10 mb-16">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Explore Categories</h2>
            </div>
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/shop?category=${cat.slug}`} className="group block relative rounded-[32px] bg-white border border-black/5 p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 bg-black/5">
                    <Image
                      src={getPublicUploadUrl(cat.image)}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-[#1a1917] group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <span>View Collection</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          </div>
        </section>

        {/* APPLICATIONS SECTION */}
        <div className="px-6 md:px-8 xl:px-12 max-w-[1740px] mx-auto my-24 relative z-10">
          <section className="py-24 px-6 md:px-12 bg-[#1a1917] rounded-[2.5rem] md:rounded-[3rem] text-white relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(255,106,42,0.15)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto relative z-10">
              <div className="mb-20 text-center space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 shadow-sm px-3.5 py-1 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Applications</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Designed For</h2>
                <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed font-medium">From intimate luxury homes to expansive commercial complexes, our hardware is engineered to meet the unique demands of every environment.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-16 lg:gap-y-20 mt-12">
                {applications.map((app, i) => {
                  const Icon = app.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="group rounded-[2rem] border border-black/5 transition-all duration-700 h-auto flex flex-col justify-start relative z-20 pt-14 pb-8 px-8 mt-8 bg-gradient-to-br from-white via-white to-orange-50/50 hover:border-[#FF6A2A]/30 hover:shadow-[0_30px_80px_rgba(255,106,42,0.1),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-2 hover:scale-[1.02] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)]"
                    >
                      <div 
                        className="absolute top-0 left-8 -translate-y-1/2 w-[64px] h-[64px] rounded-[1.25rem] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] backdrop-blur-xl bg-gradient-to-br from-[#FF9A55] to-[#FF6A2A] border border-white/20 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] rotate-6 group-hover:shadow-[0_12px_30px_-8px_rgba(255,106,42,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover:rotate-0 group-hover:scale-110"
                      >
                        <Icon className="h-8 w-8 transition-all duration-700 text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110" />
                      </div>
                      
                      <h3 className="font-extrabold text-lg uppercase tracking-tight text-[#1a1917] mb-3">
                        {app.title}
                      </h3>
                      <p className="text-sm leading-relaxed font-medium text-muted-foreground">
                        {app.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="relative py-8 px-6 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left space-y-8 max-w-xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.1]">
              Not sure where <br className="hidden lg:block"/> to start?
            </h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base mb-2">
              Our specialists are ready to help you curate the perfect hardware collection for your unique architectural needs.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              <span>Talk to a Specialist</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="w-full md:w-auto flex justify-center md:justify-end pr-0 md:pr-12 lg:pr-24 mt-16 md:mt-0">
            <motion.div
              initial={{ y: 150, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px]"
            >
              <Image 
                src="/cartoon-call.png" 
                alt="Call Specialist" 
                fill 
                className="object-contain object-bottom drop-shadow-2xl" 
              />
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
