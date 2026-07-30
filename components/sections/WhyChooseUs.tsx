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
    <section className="py-24 md:py-32 bg-transparent relative z-10">
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

        {/* Features Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                key={feature.title}
                className="group p-8 rounded-3xl bg-white border border-black/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 text-left"
              >
                {/* Icon wrapper */}
                <div className="p-3 w-12 h-12 rounded-2xl bg-black/[0.03] group-hover:bg-primary/5 text-[#1a1917] group-hover:text-primary mb-6 flex items-center justify-center transition-all duration-500">
                  <IconComponent className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="font-extrabold text-base md:text-lg text-foreground uppercase tracking-tight group-hover:text-primary transition-colors duration-300 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
