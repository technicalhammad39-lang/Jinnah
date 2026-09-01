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
    whatsapp: "+923000421772",
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    twitter: ""
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

      <div className="mx-auto grid max-w-[1920px] grid-cols-1 gap-10 md:gap-12 border-b border-white/5 px-4 sm:px-6 lg:px-8 pb-10 md:pb-16 text-left md:grid-cols-2 lg:grid-cols-12">
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
            </a>
          </div>

          {/* Social Links Row */}
          {(settings.facebook || settings.instagram || settings.youtube || settings.tiktok || settings.twitter) && (
            <div className="flex items-center gap-3 pt-4 border-t border-white/5 w-max pr-6">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-white/5 p-2.5 transition-all hover:bg-white/10 hover:scale-110" title="Facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-white/5 p-2.5 transition-all hover:bg-white/10 hover:scale-110" title="Instagram">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <defs>
                      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-white/5 p-2.5 transition-all hover:bg-white/10 hover:scale-110" title="YouTube">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.5 12 20.5 12 20.5s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {settings.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-white/5 p-2.5 transition-all hover:bg-white/10 hover:scale-110" title="TikTok">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {settings.twitter && (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-white/5 p-2.5 transition-all hover:bg-white/10 hover:scale-110" title="X (Twitter)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
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
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Chat {settings.whatsapp}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1920px] flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 pt-10 text-center text-xs font-semibold tracking-wider text-[#7c7b77] sm:flex-row sm:text-left">
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
