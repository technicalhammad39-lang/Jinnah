"use client";

import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { motion } from "motion/react";
import { ArrowRight, Box, Layers, Hammer, ShieldCheck } from "lucide-react";
import Link from "next/link";
// import { BRANDS } from "@/data/products";
import { getBrands } from "@/lib/data-fetcher";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  
  useEffect(() => {
    getBrands().then(data => setBrands(data));
  }, []);
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
          <div className="absolute inset-0 z-0 pointer-events-none opacity-70">
            <Image 
              src="/glob.png" 
              alt="Global Brands Background" 
              fill
              className="object-cover object-center"
              priority
            />
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

        <section className="pt-24 pb-24 px-6 bg-white rounded-t-[3rem] md:rounded-t-[4rem] relative overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.03)] -mt-12">
          {/* Top Orange Gradient */}
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#FF6A2A]/20 via-[#FF6A2A]/5 to-transparent pointer-events-none z-0" />
          
          {/* Top Orange Dotted Gradient */}
          <div 
            className="absolute top-0 left-0 right-0 h-96 pointer-events-none z-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at center, #FF6A2A 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px',
              opacity: 0.5,
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            }}
          />
          
          <div className="max-w-[1740px] mx-auto relative z-10">
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#FF6A2A]">Our Portfolio</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-[32px] bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden"
              >
                <div className="w-full h-28 sm:h-32 relative bg-black/5 flex items-center justify-center shrink-0">
                  {brand.image ? (
                    <Image src={brand.image} alt={brand.brandName || brand.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <span className="text-3xl font-black text-black/10 uppercase tracking-widest">{brand.brandName || brand.name}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
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

        {/* BRAND VALUES */}
        <div className="px-6 md:px-8 xl:px-12 max-w-[1740px] mx-auto my-24 relative z-10">
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
