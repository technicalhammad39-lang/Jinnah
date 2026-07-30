"use client";

import { useApp } from "@/context/AppContext";
import { CATEGORIES } from "@/data/products";
import { 
  ArrowUpRight, Heart, ShoppingCart, Search, Phone, Mail, MapPin, MessageSquare, ChevronRight, Store 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const { setCartOpen, setSearchOpen } = useApp();
  const pathname = usePathname();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerLinks = [
    { name: "About Heritage", href: "/#about-section" },
    { name: "Our Categories", href: "/#categories-section" },
    { name: "Trusted Brands", href: "/#brands-section" },
    { name: "Visual Gallery", href: "/#gallery-section" },
    { name: "Contact Desk", href: "/#contact-section" },
  ];

  return (
    <footer className="bg-[#121110] text-white/90 border-t border-white/5 relative z-10 pt-20 pb-10">
      
      {/* Footer Top Border Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 md:gap-8 pb-16 border-b border-white/5">
        
        {/* Brand Column (Span 4) */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
              J
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm md:text-base tracking-tight text-white leading-tight">
                JINNAH
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-primary tracking-widest leading-none">
                HARDWARE STORE
              </span>
            </div>
          </Link>
          <p className="text-xs text-white/50 leading-relaxed font-medium max-w-sm">
            Pakistan&apos;s premium modern hardware showroom and architectural materials partner. Curating solid-brass locksets, biometric deadbolts, and heavy industrial fittings for elite contractors and custom homes.
          </p>

          {/* Socials / Links row */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://wa.me/923000421772"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/5 hover:bg-emerald-500 hover:text-white text-emerald-400 transition-all flex items-center justify-center"
              title="WhatsApp Chat Desk"
            >
              <MessageSquare className="h-4 w-4" />
            </a>
            <a
              href="tel:03000421772"
              className="p-2.5 rounded-full bg-white/5 hover:bg-primary hover:text-white text-primary transition-all flex items-center justify-center"
              title="Store Support Phone"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href="https://maps.google.com/?q=Jinnah+Hardware+Store"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/5 hover:bg-primary hover:text-white text-white/70 transition-all flex items-center justify-center"
              title="Google Maps"
            >
              <MapPin className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Quick Navigate Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6 text-left lg:pl-4">
          <h4 className="text-[10px] font-extrabold text-primary tracking-widest uppercase">
            Quick Navigation
          </h4>
          <ul className="space-y-3">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-xs font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                className="text-xs font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
              >
                <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                <span>Shop All Products</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories Column (Span 3) */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <h4 className="text-[10px] font-extrabold text-primary tracking-widest uppercase">
            Shop Collections
          </h4>
          <ul className="space-y-3">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="text-xs font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Desk Column (Span 3) */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <h4 className="text-[10px] font-extrabold text-primary tracking-widest uppercase">
            The Support Desk
          </h4>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block leading-none">Address</span>
                <span className="text-xs font-semibold text-white/70">Main Hardware Bazaar, Pakistan</span>
              </div>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block leading-none">Direct Phone</span>
                <a href="tel:03000421772" className="text-xs font-semibold text-white/80 hover:text-primary transition-colors">
                  0300-0421772
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block leading-none">WhatsApp Order Desk</span>
                <a
                  href="https://wa.me/923000421772"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Chat +92 300 0421772</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom copyright and scroll-to-top */}
      <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[#7c7b77] text-xs font-semibold uppercase tracking-wider text-center sm:text-left">
        <div>
          <p>© {new Date().getFullYear()} JINNAH HARDWARE STORE. ALL RIGHTS RESERVED.</p>
          <p className="text-[9px] text-[#5c5b57] mt-1 normal-case tracking-normal font-medium">
            Designed as a high-end digital showroom. All specifications, ratings, and finishes represent premium grade certifications.
          </p>
        </div>

        <button
          onClick={handleScrollToTop}
          className="group px-4 py-2 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-[#faf9f6]"
        >
          <span>Scroll to Top</span>
          <ArrowUpRight className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

    </footer>
  );
}
