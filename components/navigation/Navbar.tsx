"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCartState, useOverlayActions } from "@/context/AppContext";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Menu,
  PhoneCall,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DesktopMenu } from "./DesktopMenu";
import { scrollToTarget } from "@/lib/smooth-scroll";

const NAV_LINKS = [
  { name: "Home", href: "/", isSection: false },
  { name: "Shop All", href: "/shop", isSection: false },
  { name: "Categories", href: "#categories-section", isSection: true },
  { name: "Brands", href: "#brands-section", isSection: true },
  { name: "About", href: "/about", isSection: false },
  { name: "Gallery", href: "/gallery", isSection: false },
  { name: "Contact", href: "/contact", isSection: false },
] as const;

export function Navbar() {
  const { cartCount } = useCartState();
  const { setCartOpen, setSearchOpen } = useOverlayActions();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isElevated = scrolled || pathname !== "/";
  const scrollStateRef = useRef(scrolled);

  useEffect(() => {
    let frameId = 0;

    const updateScrollState = () => {
      frameId = 0;
      const nextScrolled = window.scrollY > 20;

      if (scrollStateRef.current !== nextScrolled) {
        scrollStateRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
    };

    updateScrollState();

    const handleScroll = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.__lenis?.start?.();
    };
  }, [mobileMenuOpen]);

  const handleNavClick = useCallback(
    (event: React.MouseEvent, item: (typeof NAV_LINKS)[number]) => {
      if (item.isSection) {
        event.preventDefault();
        setMobileMenuOpen(false);

        if (pathname !== "/") {
          router.push("/" + item.href);
          return;
        }

        const targetId = item.href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
          return;
        }

        scrollToTarget(targetElement, { offset: -90 });

        return;
      }

      setMobileMenuOpen(false);
    },
    [pathname, router]
  );

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          isElevated ? "py-3 px-3 sm:px-4 md:px-6" : "py-5 px-3 sm:px-4 md:px-6"
        }`}
      >
        <div
          className={`relative mx-auto flex w-full max-w-[1740px] min-w-0 items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-6 md:py-3 lg:px-5 lg:py-2.5 xl:px-7 xl:py-3 will-change-[transform,background-color,backdrop-filter] ${
            isElevated
              ? "border-white/55 bg-white/58 shadow-[0_22px_60px_rgba(26,25,23,0.1)] backdrop-blur-xl"
              : "border-white/70 bg-white/76 shadow-[0_14px_36px_rgba(26,25,23,0.07)] backdrop-blur-lg"
          }`}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-px rounded-full transition-opacity duration-500 ${
              isElevated ? "opacity-100" : "opacity-80"
            }`}
          >
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.22))]" />
            <div className="absolute inset-x-[16%] top-0 h-px rounded-full bg-white/70 blur-[0.5px]" />
          </div>

          <Link href="/" className="relative z-10 group flex flex-shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-[0_10px_22px_rgba(224,90,43,0.28)] transition-transform duration-300 group-hover:scale-105">
              J
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold leading-tight tracking-tight text-[#1a1917] md:text-base">
                JINNAH
              </span>
              <span className="text-[9px] font-bold leading-none tracking-widest text-primary md:text-[10px]">
                HARDWARE STORE
              </span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center px-4 lg:flex">
            <DesktopMenu />
          </nav>

          <div className="relative z-10 flex flex-shrink-0 items-center gap-0.5 md:gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="cursor-pointer rounded-full p-2 text-[#1a1917] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-black/[0.045] hover:text-primary"
              title="Search"
            >
              <Search className="h-4.5 w-4.5 md:h-5 md:w-5" />
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative cursor-pointer rounded-full p-2 text-[#1a1917] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-black/[0.045] hover:text-primary"
              title="Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5 md:h-5 md:w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              href="/shop?tab=account"
              className="hidden rounded-full p-2 text-[#1a1917] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-black/[0.045] hover:text-primary sm:inline-flex"
              title="Account"
            >
              <User className="h-4.5 w-4.5 md:h-5 md:w-5" />
            </Link>

            <a
              href="tel:03000421772"
              className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_14px_26px_rgba(224,90,43,0.22)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_18px_34px_rgba(224,90,43,0.26)] md:inline-flex"
            >
              <PhoneCall className="h-3 w-3" />
              <span>Call Now</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="cursor-pointer rounded-full p-2 text-[#1a1917] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-black/[0.045] lg:hidden"
              title="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#faf9f6]/92 p-6 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-black/5 py-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  J
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold leading-tight tracking-tight text-[#1a1917]">
                    JINNAH
                  </span>
                  <span className="text-[9px] font-bold leading-none tracking-widest text-primary">
                    HARDWARE STORE
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="cursor-pointer rounded-full p-2 text-[#1a1917] transition-colors duration-300 hover:bg-black/[0.045]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="my-8 flex flex-grow flex-col justify-center space-y-4 md:space-y-6">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={(event) => handleNavClick(event, link)}
                    className="group flex items-center justify-between text-2xl font-extrabold text-foreground transition-colors duration-300 hover:text-primary md:text-4xl"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="h-6 w-6 -translate-x-4 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 border-t border-black/5 pt-6">
              <div className="flex items-center justify-around">
                <a
                  href="tel:03000421772"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-primary/20"
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
