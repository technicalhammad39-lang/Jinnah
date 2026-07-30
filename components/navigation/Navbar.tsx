"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Heart, ShoppingCart, User, PhoneCall, Menu, X, ArrowRight, MapPin
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DesktopMenu } from "./DesktopMenu";

export function Navbar() {
  const { cart, wishlist, setCartOpen, setSearchOpen } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalWishlistItems = wishlist.length;

  const navLinks = [
    { name: "Home", href: "/", isSection: false },
    { name: "Shop All", href: "/shop", isSection: false },
    { name: "Categories", href: "#categories-section", isSection: true },
    { name: "Brands", href: "#brands-section", isSection: true },
    { name: "About", href: "#about-section", isSection: true },
    { name: "Gallery", href: "#gallery-section", isSection: true },
    { name: "Contact", href: "#contact-section", isSection: true },
  ];

  const handleNavClick = (e: React.MouseEvent, item: { name: string; href: string; isSection: boolean }) => {
    if (item.isSection) {
      e.preventDefault();
      setMobileMenuOpen(false);
      
      if (pathname !== "/") {
        // If not on homepage, navigate to homepage with hash
        router.push("/" + item.href);
      } else {
        // Smooth scroll on homepage
        const targetId = item.href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const offsetTop = targetEl.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? "py-3 px-4 md:px-8" 
            : "py-5 px-4 md:px-12"
        }`}
      >
        <div 
          className={`max-w-7xl mx-auto rounded-full border transition-all duration-500 flex items-center justify-between px-6 py-2.5 md:py-3.5 ${
            scrolled 
              ? "bg-[#faf9f6]/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-black/5" 
              : "bg-transparent border-transparent"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20 group-hover:scale-105 transition-all duration-300">
              J
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm md:text-base tracking-tight text-[#1a1917] leading-tight">
                JINNAH
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-primary tracking-widest leading-none">
                HARDWARE STORE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 items-center justify-center">
            <DesktopMenu />
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 md:gap-2.5">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 text-[#1a1917] hover:text-primary transition-all duration-200 cursor-pointer"
              title="Search"
            >
              <Search className="h-4.5 w-4.5 md:h-5 md:w-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/shop?tab=wishlist"
              className="p-2 rounded-full hover:bg-black/5 text-[#1a1917] hover:text-primary transition-all duration-200 relative"
              title="Wishlist"
            >
              <Heart className="h-4.5 w-4.5 md:h-5 md:w-5" />
              {totalWishlistItems > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 text-[#1a1917] hover:text-primary transition-all duration-200 relative cursor-pointer"
              title="Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5 md:h-5 md:w-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary text-white text-[9px] font-extrabold flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Account Icon */}
            <Link
              href="/shop?tab=account"
              className="p-2 rounded-full hover:bg-black/5 text-[#1a1917] hover:text-primary transition-all duration-200 hidden sm:inline-flex"
              title="Account"
            >
              <User className="h-4.5 w-4.5 md:h-5 md:w-5" />
            </Link>

            {/* Call Now Button */}
            <a
              href="tel:03000421772"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
            >
              <PhoneCall className="h-3 w-3" />
              <span>Call Now</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 text-[#1a1917] lg:hidden cursor-pointer"
              title="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Fullscreen Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#faf9f6]/98 backdrop-blur-xl flex flex-col p-6 lg:hidden"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between py-4 border-b border-black/5">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  J
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-[#1a1917] leading-tight">
                    JINNAH
                  </span>
                  <span className="text-[9px] font-bold text-primary tracking-widest leading-none">
                    HARDWARE STORE
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-[#1a1917] cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Nav Links List */}
            <div className="flex-grow flex flex-col justify-center space-y-4 md:space-y-6 my-8">
              {navLinks.map((link, idx) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={link.name}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className="text-2xl md:text-4xl font-extrabold text-foreground hover:text-primary transition-all duration-200 flex items-center justify-between group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="h-6 w-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Footer Area */}
            <div className="border-t border-black/5 pt-6 space-y-4">
              <div className="flex justify-around items-center">
                <a
                  href="tel:03000421772"
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-primary/20 w-full justify-center"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call 0300-0421772</span>
                </a>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                <p>QUALITY • TRUST • EVERY PROJECT</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
