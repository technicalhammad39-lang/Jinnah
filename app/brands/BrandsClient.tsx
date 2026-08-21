"use client";

import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { motion } from "motion/react";
import { ArrowRight, Box, Layers, Hammer, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getPublicUploadUrl } from "@/lib/utils";

export default function BrandsClient({ initialBrands = [] }: { initialBrands: any[] }) {
  const [brands, setBrands] = useState<any[]>(initialBrands);
  const brandFeatures = [
    { title: "Residential Villas", icon: Box, desc: "Premium fittings for luxury home entrances and interiors. Ensuring unparalleled security combined with bespoke architectural aesthetics for modern and classic estates." },
    { title: "Commercial Offices", icon: Layers, desc: "High-traffic endurance hardware and access control. Engineered to withstand heavy daily use while maintaining sleek, professional profiles for corporate environments." },
    { title: "Hospitality", icon: ShieldCheck, desc: "Electronic hotel locks and master key systems. Delivering seamless guest experiences through cutting-edge access technology and highly durable, beautifully finished door hardware." },
    { title: "Industrial", icon: Hammer, desc: "Heavy-duty machinery and power tools for construction. Built for extreme conditions, providing uncompromising reliable performance and safety for large-scale industrial projects." },
  ];

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative px-6 py-24 md:py-36 overflow-hidden flex items-center justify-center min-h-[50vh] bg-white">
          {/* Globe Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30 md:opacity-50 flex items-center justify-center w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden md:overflow-visible">
            <div className="relative w-full h-[300px] md:h-full min-h-[300px] md:min-h-[50vh]">
              <Image 
                src="/glob.png" 
                alt="Global Brands Background" 
                fill
                className="object-contain md:object-cover object-center scale-[1.3] md:scale-100 mt-10 md:mt-0"
                priority
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 mt-8 md:mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                Global <span className="text-primary font-stylish normal-case text-[1.1em]">Partners</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Discover the world-renowned manufacturers we represent. Each brand in our portfolio is selected for its uncompromising commitment to precision, durability, and aesthetic brilliance.
            </motion.p>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto my-12 md:my-24 relative z-10">
          <section className="pt-24 pb-24 px-6 bg-zinc-950 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden shadow-2xl shadow-orange-500/20">
            {/* Sophisticated Deep Orange Mesh Gradient Layers */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#FF6A2A] rounded-full mix-blend-screen blur-[120px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ff9a55] rounded-full mix-blend-screen blur-[130px] opacity-30 pointer-events-none" />
            <div className="absolute top-[40%] left-[30%] w-[40%] h-[50%] bg-[#ff5500] rounded-full mix-blend-screen blur-[140px] opacity-30 pointer-events-none" />
            {/* White Dotted Pattern for contrast against orange */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay" 
              style={{
                backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.4) 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />
            
            <div className="w-full max-w-[1920px] mx-auto relative z-10">
              <div className="mb-10 text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-sm">Our Portfolio</h2>
              </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative w-full rounded-2xl md:rounded-[32px] bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden"
              >
                <div className="w-full h-40 sm:h-48 relative bg-white flex items-center justify-center shrink-0">
                  {brand.image ? (
                    <div className="relative w-[70%] h-[70%] mx-auto">
                      <Image src={getPublicUploadUrl(brand.image)} alt={brand.brandName || brand.name} fill className="object-contain transition-transform duration-700 group-hover:scale-110" />
                    </div>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-black/10 uppercase tracking-widest">{brand.brandName || brand.name}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {brand.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {brand.categories?.map((cat: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-black/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/shop?brand=${(brand.brandName || brand.name).toLowerCase().replace(" ", "-")}`} 
                    className="inline-flex items-center gap-2 mt-auto text-xs font-bold uppercase tracking-widest text-primary hover:text-[#1a1917] transition-colors"
                  >
                    <span>View Products</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
            </div>
          </section>
        </div>

        {/* BRAND VALUES */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto my-24 relative z-10">
          <section className="py-24 px-6 md:px-12 bg-[#1a1917] rounded-[2.5rem] md:rounded-[3rem] text-white relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(255,106,42,0.15)_0%,transparent_70%)] pointer-events-none" />

            {/* Top Map Graphic */}
            <div className="absolute top-0 left-0 w-full h-[300px] md:h-[600px] opacity-[0.08] pointer-events-none">
              <Image src="/map-right.png" alt="Map Graphic" fill className="object-cover object-top" />
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10">
              <div className="mb-20 text-center space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 shadow-sm px-3.5 py-1 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Our Promise</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Brand Values</h2>
                <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed font-medium">We represent only the finest names in architectural hardware, ensuring that every product meets global standards of luxury and durability.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-16 lg:gap-y-20 mt-12">
                {brandFeatures.map((feature, i) => {
                  const Icon = feature.icon;
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
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed font-medium text-muted-foreground">
                        {feature.desc}
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
              Looking for a <br className="hidden lg:block"/> specific brand?
            </h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base mb-2">
              Our catalog is constantly expanding. If you don't see your preferred brand, contact our procurement team for custom sourcing.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              <span>Contact Sourcing</span>
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
                src="/cartoon-good.png" 
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
