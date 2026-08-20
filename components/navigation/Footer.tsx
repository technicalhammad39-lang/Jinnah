"use client";

import { CATEGORIES } from "@/data/products";
import {
  ArrowUpRight,
  ChevronRight,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/data-fetcher";

const quickLinks = [
  { name: "About Heritage", href: "/about" },
  { name: "Visual Gallery", href: "/gallery" },
  { name: "Trusted Brands", href: "/brands" },
  { name: "Categories", href: "/categories" },
  { name: "Blogs", href: "/blogs" },
  { name: "Contact Desk", href: "/contact" },
];

const policyLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Return Policy", href: "/return-policy" },
  { name: "Warranty Info", href: "/warranty" },
  { name: "FAQ", href: "/faq" },
];

export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  
  const [settings, setSettings] = useState({
    contactEmail: "info@hammadgfx.online",
    contactPhone: "0300-0421772",
    contactAddress: "Opposite Gulbarag Town, Bahawalpur Road, Hasilpur",
    whatsapp: "+923000421772"
  });

  useEffect(() => {
    getSettings().then(data => {
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    });
  }, []);

  // Format WhatsApp number for URL (remove non-digits, add + prefix if missing)
  const waNumberRaw = settings.whatsapp.replace(/[^\d+]/g, '');
  const waUrl = waNumberRaw.startsWith('+') ? waNumberRaw.substring(1) : waNumberRaw;

  return (
    <footer className={`relative z-10 border-t border-white/5 bg-[#121110] pt-12 md:pt-20 pb-8 md:pb-10 text-white/90 ${isHome ? "" : "rounded-t-[32px] md:rounded-t-[40px]"}`}>
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:gap-12 border-b border-white/5 px-4 sm:px-6 lg:px-8 pb-10 md:pb-16 text-left md:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Link href="/" className="flex items-center group transition-transform hover:scale-105 w-fit max-w-full">
            <div className="relative h-16 w-[260px] max-w-full md:h-20 flex items-center justify-start">
              <div className="relative w-full h-full">
                <Image src="/jinnah-bottom.png" alt="Jinnah Hardware Store" fill className="object-contain object-left" />
              </div>
            </div>
          </Link>
          <p className="max-w-sm text-xs leading-relaxed font-medium text-white/50">
            Pakistan&apos;s premium modern hardware showroom and architectural materials
            partner. Curating solid-brass locksets, biometric deadbolts, and heavy
            industrial fittings for elite contractors and custom homes.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={`https://wa.me/${waUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-white/5 p-2.5 text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
              title="WhatsApp Chat Desk"
            >
              <MessageSquare className="h-4 w-4" />
            </a>
            <a
              href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`}
              className="flex items-center justify-center rounded-full bg-white/5 p-2.5 text-primary transition-all hover:bg-primary hover:text-white"
              title="Store Support Phone"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settings.contactAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-white/5 p-2.5 text-white/70 transition-all hover:bg-primary hover:text-white"
              title="Google Maps"
            >
              <MapPin className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-6 text-left lg:col-span-2 lg:pl-4">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
            Quick Navigation
          </h4>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="group flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                className="group flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors hover:text-white"
              >
                <ChevronRight className="h-3.5 w-3.5 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                <span>Shop All Products</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-6 text-left lg:col-span-3">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
            Shop Collections
          </h4>
          <ul className="space-y-3">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 text-left lg:col-span-3">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
            The Support Desk
          </h4>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="space-y-0.5">
                <span className="block text-[9px] leading-none font-bold uppercase tracking-wider text-white/40">
                  Address
                </span>
                <span className="text-xs font-semibold text-white/70">
                  {settings.contactAddress}
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="space-y-0.5">
                <span className="block text-[9px] leading-none font-bold uppercase tracking-wider text-white/40">
                  Direct Phone
                </span>
                <a
                  href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`}
                  className="text-xs font-semibold text-white/80 transition-colors hover:text-primary"
                >
                  {settings.contactPhone}
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="space-y-0.5">
                <span className="block text-[9px] leading-none font-bold uppercase tracking-wider text-white/40">
                  WhatsApp Order Desk
                </span>
                <a
                  href={`https://wa.me/${waUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                >
                  <span>Chat {settings.whatsapp}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 pt-10 text-center text-xs font-semibold tracking-wider text-[#7c7b77] sm:flex-row sm:text-left">
        <div>
          <p className="uppercase">&copy; {new Date().getFullYear()} JINNAH HARDWARE STORE. ALL RIGHTS RESERVED.</p>
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2">
            {policyLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-[9px] font-medium tracking-normal text-[#5c5b57]">
            Designed as a high-end digital showroom. All specifications, ratings, and
            finishes represent premium grade certifications.
          </p>
          <p className="mt-2 text-[10px] font-bold text-[#5c5b57] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
            Website Designed & Developed By <a href="https://clyro.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6A2A] hover:text-[#FF6A2A]/80 transition-colors">Clyro Tech Solutions</a>
          </p>
        </div>

        <ScrollToTopButton />
      </div>
    </footer>
  );
}
