"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { ArrowRight, Box, ChevronDown, Lock, PenTool } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { BRANDS, CATEGORIES } from "@/data/products";

interface TabProps {
  children: React.ReactNode;
  hoveredTab: number | null;
  href: string;
  selected: number | null;
  setHoveredTab: React.Dispatch<React.SetStateAction<number | null>>;
  setPosition: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >;
  handleSetSelected: (value: number | null) => void;
  tab: number;
}

export const DesktopMenu = memo(function DesktopMenu() {
  return (
    <div className="flex w-full justify-center">
      <Tabs />
    </div>
  );
});

const TABS = [
  { title: "Home", href: "/", Component: null },
  { title: "Shop All", href: "/shop", Component: ShopAll },
  { title: "Categories", href: "/#categories-section", Component: Categories },
  { title: "Brands", href: "/#brands-section", Component: BrandsMenu },
  { title: "About", href: "/#about-section", Component: null },
  { title: "Gallery", href: "/#gallery-section", Component: null },
  { title: "Contact", href: "/#contact-section", Component: null },
].map((item, index) => ({ ...item, id: index + 1 }));

function Tabs() {
  const [selected, setSelected] = useState<number | null>(null);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const [dir, setDir] = useState<"l" | "r" | null>(null);
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  const handleSetSelected = (value: number | null) => {
    if (typeof selected === "number" && typeof value === "number") {
      setDir(selected > value ? "r" : "l");
    } else if (value === null) {
      setDir(null);
    }

    setSelected(value);
  };

  return (
    <div
      onMouseLeave={() => {
        handleSetSelected(null);
        setHoveredTab(null);
        setPosition((current) => ({ ...current, opacity: 0 }));
      }}
      className="relative flex h-fit items-center gap-0.5"
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.id}
          hoveredTab={hoveredTab}
          href={tab.href}
          selected={selected}
          setHoveredTab={setHoveredTab}
          setPosition={setPosition}
          handleSetSelected={handleSetSelected}
          tab={tab.id}
        >
          {tab.title}
        </Tab>
      ))}

      <Cursor position={position} />

      <AnimatePresence>
        {selected && <Content dir={dir} selected={selected} />}
      </AnimatePresence>
    </div>
  );
}

function Tab({
  children,
  hoveredTab,
  href,
  selected,
  setHoveredTab,
  setPosition,
  handleSetSelected,
  tab,
}: TabProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const hasDropdown = tab === 2 || tab === 3 || tab === 4;
  const isHighlighted = hoveredTab === tab || selected === tab;

  return (
    <Link
      href={href}
      ref={ref}
      id={`shift-tab-${tab}`}
      onMouseEnter={() => {
        setHoveredTab(tab);
        handleSetSelected(hasDropdown ? tab : null);

        if (!ref.current) {
          return;
        }

        const { width } = ref.current.getBoundingClientRect();
        setPosition({ left: ref.current.offsetLeft, width, opacity: 1 });
      }}
      className={`relative z-10 flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 lg:px-2 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] xl:px-3 ${
        isHighlighted ? "text-white" : "text-[#3f3932] hover:text-primary"
      }`}
    >
      <span className="relative z-10">{children}</span>
      {hasDropdown && (
        <ChevronDown
          className={`relative z-10 h-4 w-4 transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            selected === tab ? "rotate-180" : ""
          }`}
        />
      )}
    </Link>
  );
}

function Cursor({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) {
  return (
    <motion.div
      initial={{ left: 0, width: 0, opacity: 0 }}
      animate={{ ...position }}
      transition={{ type: "spring", stiffness: 330, damping: 30, mass: 0.72 }}
      className="absolute z-0 h-[36px] rounded-full bg-[#1f1b17] shadow-[0_12px_28px_rgba(26,25,23,0.18)]"
    />
  );
}

function Content({ dir, selected }: { dir: "l" | "r" | null; selected: number }) {
  return (
    <motion.div
      id="overlay-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-1/2 top-[calc(100%+14px)] w-[640px] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_28px_80px_rgba(26,25,23,0.14)]"
    >
      <Bridge />
      <Nub selected={selected} />

      {TABS.map((tab) => (
        <div key={tab.id} className="relative overflow-hidden">
          {selected === tab.id && tab.Component && (
            <motion.div
              initial={{ opacity: 0, x: dir === "l" ? 28 : dir === "r" ? -28 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <tab.Component />
            </motion.div>
          )}
        </div>
      ))}
    </motion.div>
  );
}

function Bridge() {
  return <div className="absolute -top-[14px] left-0 right-0 h-[14px]" />;
}

function Nub({ selected }: { selected: number }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const hoveredTab = document.getElementById(`shift-tab-${selected}`);
    const overlayContent = document.getElementById("overlay-content");

    if (!hoveredTab || !overlayContent) {
      return;
    }

    const tabRect = hoveredTab.getBoundingClientRect();
    const { left: contentLeft } = overlayContent.getBoundingClientRect();
    const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;
    setLeft(tabCenter);
  }, [selected]);

  if (left === null) {
    return null;
  }

  return (
    <motion.div
      style={{ clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)" }}
      initial={{ left }}
      animate={{ left }}
      transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.74 }}
      className="absolute top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border-l border-t border-black/5 bg-white"
    />
  );
}

function ShopAll() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Explore the Catalog</h3>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:gap-2"
        >
          <span>View All Products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 divide-x divide-black/5">
        <Link href="/shop?category=architectural" className="group flex flex-col px-2">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary">
            <Box className="text-primary transition-colors group-hover:text-white" />
          </div>
          <h4 className="mb-1 text-sm font-bold transition-colors group-hover:text-primary">
            Architectural
          </h4>
          <p className="text-xs text-muted-foreground">Premium levers and handles</p>
        </Link>

        <Link href="/shop?category=security" className="group flex flex-col px-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary">
            <Lock className="text-primary transition-colors group-hover:text-white" />
          </div>
          <h4 className="mb-1 text-sm font-bold transition-colors group-hover:text-primary">
            Security
          </h4>
          <p className="text-xs text-muted-foreground">Smart locks and deadbolts</p>
        </Link>

        <Link href="/shop?category=tools" className="group flex flex-col pl-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary">
            <PenTool className="text-primary transition-colors group-hover:text-white" />
          </div>
          <h4 className="mb-1 text-sm font-bold transition-colors group-hover:text-primary">
            Power Tools
          </h4>
          <p className="text-xs text-muted-foreground">Industrial grade equipment</p>
        </Link>
      </div>
    </div>
  );
}

function Categories() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {CATEGORIES.slice(0, 6).map((category) => (
        <Link
          key={category.id}
          href={`/shop?category=${category.slug}`}
          className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-black/5"
        >
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            <div className="relative h-full w-full">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="48px"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold transition-colors group-hover:text-primary">
              {category.name}
            </h4>
            <p className="w-40 truncate text-xs text-muted-foreground">
              {category.description}
            </p>
          </div>
        </Link>
      ))}

      <div className="col-span-2 mt-2 border-t border-black/5 pt-4 text-center">
        <Link
          href="/#categories-section"
          className="inline-flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:gap-2"
        >
          <span>All Categories</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function BrandsMenu() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {BRANDS.map((brand) => (
          <Link
            key={brand.id}
            href={`/shop?brand=${brand.id}`}
            className="group flex flex-col items-center justify-center rounded-2xl border border-black/5 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="mb-2 text-3xl font-black text-gray-300 transition-colors group-hover:text-primary">
              {brand.logoText}
            </div>
            <span className="text-xs font-bold">{brand.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/#brands-section"
          className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        >
          View All Brands
        </Link>
      </div>
    </div>
  );
}
