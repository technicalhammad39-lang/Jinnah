"use client";

import { motion } from "motion/react";
import { ShieldAlert, Medal, CircleDollarSign, Compass, Layers, Headphones } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      title: "Uncompromising Quality",
      desc: "Every bracket, lock, and tool in our collection undergoes stringent architectural-load and cycles validation.",
      icon: Medal,
    },
    {
      title: "Trusted Global Brands",
      desc: "Authorized dealer of Veritas Steel, Aurum Brass, and Krypter Biometrics, ensuring genuine warranties.",
      icon: Layers,
    },
    {
      title: "Industrial Expertise",
      desc: "Our team consists of veteran hardware technicians ready to guide blueprinted bills of materials.",
      icon: Compass,
    },
    {
      title: "Contractor Pricing",
      desc: "Tiered commercial pricing with optimal value margins for large development projects and workshops.",
      icon: CircleDollarSign,
    },
    {
      title: "Instant Deliveries",
      desc: "Express fulfillment on high-volume items so your job site never experiences costly delay pauses.",
      icon: ShieldAlert,
    },
    {
      title: "24/7 Builder Support",
      desc: "Dedicated account support for commercial builders, contractors, and custom architectural renovators.",
      icon: Headphones,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 md:mb-20 gap-4">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Our Brand Value</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
              Designed for Builders, <br className="hidden sm:inline" />
              <span className="text-primary">Trusted by Families</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm text-left leading-relaxed font-medium">
            Over decades of serving homes and construction projects, we have refined a benchmark of uncompromising reliability.
          </p>
        </div>

        {/* Interactive Connected Timeline Layout */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          {/* Central Animated Line (Desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-black/[0.04] rounded-full overflow-hidden">
            <motion.div 
              className="w-full bg-gradient-to-b from-primary/0 via-primary to-primary/0 h-1/3"
              animate={{
                y: ["-100%", "300%"]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear"
              }}
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <div key={feature.title} className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                  {/* Left Side */}
                  <div className={`w-full md:w-[45%] ${isEven ? 'md:text-right md:pr-12' : 'md:order-3 md:text-left md:pl-12'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="group p-8 rounded-3xl bg-white border border-black/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                    >
                      <div className={`p-3 w-12 h-12 rounded-2xl bg-black/[0.03] group-hover:bg-primary/5 text-[#1a1917] group-hover:text-primary mb-6 flex items-center justify-center transition-all duration-500 ${isEven ? 'md:ml-auto' : ''}`}>
                        <IconComponent className="h-6 w-6 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-extrabold text-base md:text-lg text-foreground uppercase tracking-tight group-hover:text-primary transition-colors duration-300 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                        {feature.desc}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 items-center justify-center rounded-full border-4 border-[#faf9f6] bg-white shadow-[0_0_20px_-12px_rgba(0,0,0,0.15)] z-10 group cursor-default">
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-white transition-colors" />
                    </div>
                  </div>

                  {/* Empty Spacer for layout */}
                  <div className={`w-full md:w-[45%] ${isEven ? 'md:order-3' : 'md:order-1'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
