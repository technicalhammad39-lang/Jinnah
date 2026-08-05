"use client";

import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { motion } from "motion/react";
import { Shield, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BRANDS } from "@/data/products";

export default function BrandsPage() {
  const brandFeatures = [
    { title: "Curated Excellence", icon: Sparkles, desc: "We exclusively partner with manufacturers who consistently meet our rigorous standards for material quality, intricate design, and architectural integrity." },
    { title: "Authenticity Guaranteed", icon: Shield, desc: "As a direct authorized importer for all listed luxury brands, we ensure 100% genuine products accompanied by full international warranties." },
    { title: "Latest Innovations", icon: Zap, desc: "Always at the forefront, we are the first to bring global architectural hardware innovations and smart security systems to the local market." },
  ];

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col overflow-x-hidden">
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

        {/* BRAND VALUES */}
        <div className="px-6 md:px-8 xl:px-12 max-w-[1740px] mx-auto my-24 relative z-10">
          <section className="py-24 px-6 md:px-12 bg-[#1a1917] rounded-[2.5rem] md:rounded-[3rem] text-white relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(255,106,42,0.15)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto relative z-10">
              <div className="mb-20 text-center space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 shadow-sm px-3.5 py-1 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Our Promise</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Brand Values</h2>
                <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed font-medium">We represent only the finest names in architectural hardware, ensuring that every product meets global standards of luxury and durability.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16 lg:gap-y-12 mt-12">
                {brandFeatures.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="group rounded-[2rem] border border-white/10 transition-all duration-700 h-auto flex flex-col justify-start relative z-20 pt-14 pb-8 px-8 mt-8 bg-gradient-to-br from-[#202020]/95 via-[#171717]/95 to-[#111111]/95 backdrop-blur-2xl hover:border-[#FF6A2A]/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:-translate-y-2 hover:scale-[1.02] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.02)]"
                    >
                      <div 
                        className="absolute top-0 left-8 -translate-y-1/2 w-[64px] h-[64px] rounded-[1.25rem] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] backdrop-blur-xl bg-gradient-to-br from-[#FF9A55] to-[#FF6A2A] border border-white/20 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] rotate-6 group-hover:shadow-[0_12px_30px_-8px_rgba(255,106,42,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover:rotate-0 group-hover:scale-110"
                      >
                        <Icon className="h-8 w-8 transition-all duration-700 text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110" />
                      </div>
                      
                      <h3 className="font-extrabold text-lg uppercase tracking-tight text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed font-medium text-white/70">
                        {feature.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* BRANDS GRID */}
        <section className="py-24 px-6 max-w-[1740px] mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Our Portfolio</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-[32px] bg-white border border-black/5 p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
              >
                <div className="mb-8 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-black/5 flex items-center justify-center text-3xl font-black text-[#1a1917] group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {brand.logoText}
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#1a1917] group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed flex-1">
                  {brand.description}
                </p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {brand.categories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-black/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/shop?brand=${brand.name.toLowerCase().replace(" ", "-")}`} 
                    className="inline-flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-[#1a1917] transition-colors"
                  >
                    <span>View Products</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-[#1a1917] text-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Looking for a specific brand?
            </h2>
            <p className="text-sm text-white/60 max-w-xl mx-auto">
              Our catalog is constantly expanding. If you don't see your preferred brand, contact our procurement team for custom sourcing.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#1a1917] transition-all">
              <span>Contact Sourcing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
