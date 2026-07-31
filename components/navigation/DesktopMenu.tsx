"use client";

import React, { useEffect, useState, useRef } from "react";
import { ArrowRight, ChevronDown, Box, PenTool, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { CATEGORIES, BRANDS } from "@/data/products";

export const DesktopMenu = () => {
  return (
    <div className="flex w-full justify-center">
      <Tabs />
    </div>
  );
};

const Tabs = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const [dir, setDir] = useState<"l" | "r" | null>(null);
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  const handleSetSelected = (val: number | null) => {
    if (typeof selected === "number" && typeof val === "number") {
      setDir(selected > val ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }
    setSelected(val);
  };

  return (
    <div 
      onMouseLeave={() => {
        handleSetSelected(null);
        setHoveredTab(null);
        setPosition((pv) => ({ ...pv, opacity: 0 }));
      }} 
      className="relative flex h-fit gap-1 items-center rounded-full border border-black/10 bg-white/90 p-1.5 shadow-[0_12px_30px_rgba(26,25,23,0.08)] backdrop-blur-xl"
    >
      {TABS.map((t) => (
        <Tab 
          key={t.id} 
          hoveredTab={hoveredTab}
          selected={selected} 
          handleSetSelected={handleSetSelected} 
          setHoveredTab={setHoveredTab}
          tab={t.id}
          setPosition={setPosition}
          href={t.href}
        >
          {t.title}
        </Tab>
      ))}
      <Cursor position={position} />

      <AnimatePresence>
        {selected && <Content key="content" dir={dir} selected={selected} />}
      </AnimatePresence>
    </div>
  );
};

const Tab = ({ 
  children, 
  hoveredTab,
  tab, 
  handleSetSelected, 
  selected,
  setPosition,
  setHoveredTab,
  href
}: any) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const hasDropdown = tab === 2 || tab === 3 || tab === 4;
  const isHighlighted = hoveredTab === tab;

  return (
    <Link
      href={href || "#"}
      ref={ref}
      id={`shift-tab-${tab}`}
      onMouseEnter={() => {
        setHoveredTab(tab);
        handleSetSelected(hasDropdown ? tab : null);
        if (!ref?.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ left: ref.current.offsetLeft, width, opacity: 1 });
      }}
      onClick={(e) => {
        if (hasDropdown && href === "#") {
          e.preventDefault();
        }
      }}
      className={`relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
        isHighlighted || selected === tab ? "text-white" : "text-[#3f3932] hover:text-primary"
      }`}
    >
      <span className="relative z-10">{children}</span>
      {hasDropdown && (
        <ChevronDown className={`relative z-10 transition-transform duration-300 ${selected === tab ? "rotate-180" : ""}`} />
      )}
    </Link>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.div
      initial={{ left: 0, width: 0, opacity: 0 }}
      animate={{ ...position }}
      className="absolute z-0 h-[34px] rounded-full bg-[#1f1b17] shadow-[0_10px_22px_rgba(26,25,23,0.16)]"
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  );
};

const Content = ({ selected, dir }: { selected: number; dir: "l" | "r" | null }) => {
  return (
    <motion.div
      id="overlay-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute left-1/2 top-[calc(100%+16px)] w-[600px] -translate-x-1/2 rounded-3xl border border-black/10 bg-[#fcfbf8]/95 p-6 shadow-2xl backdrop-blur-2xl"
    >
      <Bridge />
      <Nub selected={selected} />
      
      {TABS.map((t) => {
        return (
          <div className="overflow-hidden" key={t.id}>
            {selected === t.id && t.Component && (
              <motion.div
                initial={{ opacity: 0, x: dir === "l" ? 50 : dir === "r" ? -50 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <t.Component />
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

const Bridge = () => (
  <div className="absolute -top-[16px] left-0 right-0 h-[16px]" />
);

const Nub = ({ selected }: { selected: number }) => {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    moveNub();
  }, [selected]);

  const moveNub = () => {
    if (selected) {
      const hoveredTab = document.getElementById(`shift-tab-${selected}`);
      const overlayContent = document.getElementById("overlay-content");
      if (!hoveredTab || !overlayContent) return;
      
      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeft } = overlayContent.getBoundingClientRect();
      const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;
      setLeft(tabCenter);
    }
  };

  if (left === null) return null;

  return (
    <motion.div
      style={{ clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)" }}
      initial={{ left: left }}
      animate={{ left: left }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border-l border-t border-black/10 bg-[#fcfbf8]"
    />
  );
};

const ShopAll = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Explore Our Catalog</h3>
        <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
          View All Products &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-6 divide-x divide-black/5">
        <Link href="/shop?category=architectural" className="group flex flex-col px-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
            <Box className="text-primary group-hover:text-white transition-colors" />
          </div>
          <h4 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">Architectural</h4>
          <p className="text-xs text-muted-foreground">Premium levers and handles</p>
        </Link>
        <Link href="/shop?category=security" className="group flex flex-col px-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
            <Lock className="text-primary group-hover:text-white transition-colors" />
          </div>
          <h4 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">Security</h4>
          <p className="text-xs text-muted-foreground">Smart locks and deadbolts</p>
        </Link>
        <Link href="/shop?category=tools" className="group flex flex-col pl-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
            <PenTool className="text-primary group-hover:text-white transition-colors" />
          </div>
          <h4 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">Power Tools</h4>
          <p className="text-xs text-muted-foreground">Industrial grade equipment</p>
        </Link>
      </div>
    </div>
  );
};

const Categories = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {CATEGORIES.slice(0, 6).map((category) => (
        <Link 
          key={category.id} 
          href={`/categories/${category.slug}`}
          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{category.name}</h4>
            <p className="text-xs text-muted-foreground truncate w-40">{category.description}</p>
          </div>
        </Link>
      ))}
      <div className="col-span-2 mt-2 text-center border-t border-black/5 pt-4">
        <Link href="/categories" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-1 hover:gap-2 transition-all">
          <span>All Categories</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const Brands = () => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {BRANDS.map((brand) => (
          <Link 
            key={brand.id}
            href={`/brands/${brand.id}`}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-black/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="text-3xl font-black text-gray-300 group-hover:text-primary mb-2 transition-colors">
              {brand.logoText}
            </div>
            <span className="text-xs font-bold">{brand.name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link href="/brands" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
          View All Brands
        </Link>
      </div>
    </div>
  );
};

const TABS = [
  { title: "Home", href: "/", Component: null },
  { title: "Shop All", href: "/shop", Component: ShopAll },
  { title: "Categories", href: "/categories", Component: Categories },
  { title: "Brands", href: "/brands", Component: Brands },
  { title: "About", href: "/about", Component: null },
  { title: "Gallery", href: "/gallery", Component: null },
  { title: "Contact", href: "/contact", Component: null },
].map((n, idx) => ({ ...n, id: idx + 1 }));
