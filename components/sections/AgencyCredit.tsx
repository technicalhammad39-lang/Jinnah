"use client";

import { motion } from "motion/react";
import { Globe, MessageCircle, Mail } from "lucide-react";
import Image from "next/image";

export function AgencyCredit() {
  return (
    <section className="py-24 bg-[#1a1917] text-white relative overflow-hidden z-10 border-t border-white/10">
      {/* Heavy orange glow behind content */}
      <div 
        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full radial-gradient opacity-[0.15] blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 90, 31, 0.2) 0%, rgba(255, 90, 31, 0) 70%)"
        }}
      />

      <div className="max-w-[1740px] mx-auto px-6 md:px-8 xl:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12"
        >
          {/* Left: Branding & Credit */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 opacity-90 hover:opacity-100 transition-opacity">
              {/* Use clyro.svg directly, next/image will handle it if it exists or fails gracefully */}
              <Image 
                src="/clyro.svg" 
                alt="Clyro Tech Solutions Logo" 
                fill 
                className="object-contain"
                onError={(e) => {
                  // Fallback if clyro.svg is missing
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-extrabold text-white/50 text-xs border border-white/20 rounded-xl clyro-fallback">
                CTS
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Website Designed & Developed By
              </p>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Clyro Tech Solutions
              </h3>
            </div>
          </div>

          {/* Right: Elegant Anchor Links */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
            <a 
              href="https://clyro.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </a>
            <a 
              href="https://wa.me/923000000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-bold text-white/70 hover:text-[#25D366] transition-colors"
            >
              <MessageCircle className="h-4 w-4 group-hover:text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
            <a 
              href="mailto:contact@clyro.com" 
              className="group flex items-center gap-2 text-sm font-bold text-white/70 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 group-hover:text-primary" />
              <span>Email</span>
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Hide fallback if image loads */}
      <style>{`
        img[alt="Clyro Tech Solutions Logo"]:not([style*="display: none"]) + .clyro-fallback {
          display: none;
        }
      `}</style>
    </section>
  );
}
