"use client";

import { motion } from "motion/react";
import { MapPin, Phone, Clock, Navigation, CheckCircle2, PhoneCall } from "lucide-react";

export function MapSection() {
  const storeInfo = [
    {
      title: "Store Location",
      desc: "Shop # 8, 9, 10 Jinnah Hardware Store near Mehmood Pharmacy, G.T Road Gujranwala",
      icon: MapPin,
    },
    {
      title: "Phone Support",
      desc: "0300-0421772",
      icon: Phone,
      href: "tel:03000421772",
    },
    {
      title: "Opening Hours",
      desc: "Mon - Sat: 9:00 AM - 8:30 PM",
      icon: Clock,
    },
  ];

  return (
    <section id="map-section" className="py-24 md:py-32 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Rich Store Info Box */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Visit Us Today</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
                Our Flagship <br />
                <span className="text-primary">Hardware Store</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Experience the raw finishes and weight of solid brass levers, explore our tools bar, and speak directly to our hardware experts for tailored contracting estimates.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              {storeInfo.map((info) => {
                const InfoIcon = info.icon;
                return (
                  <div
                    key={info.title}
                    className="p-5 rounded-2xl bg-white border border-black/5 hover:border-primary/15 transition-all duration-300 flex gap-4"
                  >
                    <div className="p-3 rounded-xl bg-primary/5 text-primary flex items-center justify-center h-11 w-11 flex-shrink-0">
                      <InfoIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {info.title}
                      </h4>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-extrabold text-[#1a1917] hover:text-primary transition-colors block"
                        >
                          {info.desc}
                        </a>
                      ) : (
                        <p className="text-sm font-extrabold text-[#1a1917]">
                          {info.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://maps.google.com/?q=Shop+%23+8,+9,+10+Jinnah+Hardware+Store+near+mehmood+pharmacy,+G.T+Road+Gujranwala"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6.5 py-4 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-primary/20 cursor-pointer"
              >
                <Navigation className="h-4 w-4" />
                <span>Open Google Maps</span>
              </a>

              <a
                href="tel:03000421772"
                className="inline-flex items-center gap-2 px-6.5 py-4 rounded-full border border-black/10 hover:border-black/25 bg-white text-[#1a1917] text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 text-primary animate-bounce" />
                <span>Call Store Now</span>
              </a>
            </div>
          </div>

          {/* Right Side: Beautiful Map Placeholder/Interactive Stage */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-[32px] overflow-hidden bg-black/5 border border-black/5 shadow-xl flex items-center justify-center group">
              <iframe
                src="https://maps.google.com/maps?q=Shop%20%23%208%2C%209%2C%2010%20Jinnah%20Hardware%20Store%20near%20mehmood%20pharmacy%2C%20G.T%20Road%20Gujranwala&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
