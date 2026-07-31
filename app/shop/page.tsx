"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOverlayActions, useWishlistState } from "@/context/AppContext";
import { BRANDS, CATEGORIES, PRODUCTS } from "@/data/products";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { 
  SlidersHorizontal, Heart, User, Sparkles, ShoppingBag, ArrowUpDown, ChevronRight, ShieldCheck, Loader2
} from "lucide-react";
import Link from "next/link";

function ShopContent() {
  const { wishlist } = useWishlistState();
  const { setQuickViewProduct } = useOverlayActions();
  const searchParams = useSearchParams();

  // Active sub-tabs: "products" | "wishlist" | "account"
  const [activeTab, setActiveTab] = useState<"products" | "wishlist" | "account">("products");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(400); // Max budget slider
  const [sortBy, setSortBy] = useState("featured"); // "featured", "price-asc", "price-desc", "rating"

  // Load More Pagination limit
  const [visibleCount, setVisibleCount] = useState(6);

  // Sync URL search parameters
  useEffect(() => {
    const catParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const tabParam = searchParams.get("tab");
    const prodParam = searchParams.get("product");

    if (catParam) {
      const foundCategory = CATEGORIES.find((category) => category.slug === catParam || category.id === catParam);
      if (foundCategory) {
        setSelectedCategory(foundCategory.name);
      }
    } else {
      setSelectedCategory("All");
    }

    if (brandParam) {
      const foundBrand = BRANDS.find(
        (brand) => brand.id === brandParam || brand.name.toLowerCase() === brandParam.toLowerCase()
      );

      if (foundBrand) {
        setSelectedBrand(foundBrand.name);
      }
    } else {
      setSelectedBrand("All");
    }

    if (tabParam === "wishlist") {
      setActiveTab("wishlist");
    } else if (tabParam === "account") {
      setActiveTab("account");
    } else {
      setActiveTab("products");
    }

    if (prodParam) {
      const foundProduct = PRODUCTS.find((product) => product.id === prodParam);
      if (foundProduct) {
        setQuickViewProduct(foundProduct);
      }
    }
  }, [searchParams, setQuickViewProduct]);

  const categoryOptions = useMemo(
    () => ["All", ...CATEGORIES.map((category) => category.name)],
    []
  );

  const brandOptions = useMemo(
    () => ["All", ...BRANDS.map((brand) => brand.name)],
    []
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter((product) => {
        const matchesSearch =
          normalizedQuery === "" ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.brand.toLowerCase().includes(normalizedQuery);

        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;
        const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
        const matchesPrice = product.price <= priceRange;

        return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
      }),
    [normalizedQuery, priceRange, selectedBrand, selectedCategory]
  );

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];

    products.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

    return products;
  }, [filteredProducts, sortBy]);

  const displayedProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount]
  );

  const wishlistProducts = useMemo(
    () => PRODUCTS.filter((product) => wishlist.includes(product.id)),
    [wishlist]
  );

  // Clear filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setPriceRange(400);
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent pt-28">
      {/* Search Header Area */}
      <div className="max-w-7xl mx-auto px-6 w-full text-left py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-black/5 pb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <Link href="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#1a1917]">E-Commerce Shop</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tighter">
              {activeTab === "products" ? "Industrial Catalog" : activeTab === "wishlist" ? "My Personal Wishlist" : "Customer Desk"}
            </h1>
          </div>

          {/* Sub-tabs switches */}
          <div className="flex rounded-full border border-black/10 bg-[#f1ece4]/90 p-1 shadow-[0_8px_20px_rgba(26,25,23,0.05)] backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4.5 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "products"
                  ? "border border-black/5 bg-white text-[#1a1917] shadow-sm"
                  : "text-[#655d54] hover:bg-white/70 hover:text-[#1a1917]"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`px-4.5 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "wishlist"
                  ? "border border-black/5 bg-white text-[#1a1917] shadow-sm"
                  : "text-[#655d54] hover:bg-white/70 hover:text-[#1a1917]"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Wishlist ({wishlist.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4.5 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "account"
                  ? "border border-black/5 bg-white text-[#1a1917] shadow-sm"
                  : "text-[#655d54] hover:bg-white/70 hover:text-[#1a1917]"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Rendering Block */}
      <div className="max-w-7xl mx-auto px-6 w-full flex-grow pb-24">
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Desktop Filters Sidebar (Col 1) */}
            <div className="lg:col-span-1 sticky top-28 space-y-7 rounded-3xl border border-black/10 bg-white/85 p-6 text-left shadow-[0_16px_32px_rgba(26,25,23,0.05)] backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#1a1917]">Filters</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-extrabold uppercase text-primary hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Live Search Input */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Search Keywords</span>
                <input
                  type="text"
                  placeholder="Filter name, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs font-semibold bg-white/60"
                />
              </div>

              {/* Categories Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Categories</span>
                <div className="flex flex-col gap-1">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs text-left font-bold py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-primary/12 text-primary"
                          : "text-[#5f5850] hover:bg-[#f3eee7] hover:text-[#1a1917]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Brands</span>
                <div className="flex flex-col gap-1">
                  {brandOptions.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`text-xs text-left font-bold py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                        selectedBrand === brand
                          ? "bg-primary/12 text-primary"
                          : "text-[#5f5850] hover:bg-[#f3eee7] hover:text-[#1a1917]"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Max Budget</span>
                  <span className="text-xs font-bold text-[#1a1917]">${priceRange}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="450"
                  step="5"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                  <span>$10</span>
                  <span>$450</span>
                </div>
              </div>

            </div>

            {/* Catalog Grid Area (Col 3) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Toolbar */}
              <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 shadow-[0_12px_28px_rgba(26,25,23,0.04)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-semibold text-muted-foreground text-left">
                  Found <span className="font-extrabold text-foreground">{sortedProducts.length}</span> high-end hardware products
                </div>

                {/* Sorting Select */}
                <div className="flex items-center gap-2 text-xs ml-auto sm:ml-0">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <span className="font-bold text-muted-foreground">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-black/10 bg-white/90 p-1.5 text-xs font-bold text-[#1a1917] outline-none focus:border-primary"
                  >
                    <option value="featured">Featured Picks</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">User Rating</option>
                  </select>
                </div>
              </div>

              {/* Staggered dynamic grid */}
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 rounded-[32px] border border-black/10 bg-white/75 py-24 text-center shadow-[0_16px_32px_rgba(26,25,23,0.04)] backdrop-blur-md">
                  <div className="w-16 h-16 rounded-full bg-primary/5 text-primary/40 flex items-center justify-center mx-auto">
                    <SlidersHorizontal className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1a1917] uppercase tracking-tight">No Hardware Found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                      No products match your current budget or selected tags. Try resetting filters to explore.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2 rounded-full bg-[#1a1917] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Pagination triggers */}
              {sortedProducts.length > displayedProducts.length && (
                <div className="pt-8 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 3)}
                    className="px-8 py-3.5 rounded-full border border-black/10 hover:border-black/25 bg-white text-[#1a1917] hover:bg-black/5 text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    Load More Innovations
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Tab 2: Personal Wishlist */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            {wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 rounded-[32px] border border-black/10 bg-white/75 py-24 text-center shadow-[0_16px_32px_rgba(26,25,23,0.04)] backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-primary/5 text-primary/40 flex items-center justify-center mx-auto animate-pulse">
                  <Heart className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1a1917] uppercase tracking-tight">Your Wishlist is Empty</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1.5 leading-relaxed font-medium">
                    Tap the heart icon on any high-end locks, handles, or tools to draft your favorite hardware specs here.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("products")}
                  className="px-6 py-2.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-widest hover:bg-primary/95 transition-all cursor-pointer shadow-md"
                >
                  Explore Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Desk Account Panel */}
        {activeTab === "account" && (
          <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-xl border border-black/5 overflow-hidden text-left">
            {/* Header profile area */}
            <div className="p-8 bg-[#efece6] flex flex-col sm:flex-row items-center gap-6 border-b border-black/5">
              <div className="w-20 h-20 rounded-full bg-primary text-white text-3xl font-black flex items-center justify-center shadow-lg shadow-primary/15">
                JH
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest px-3 py-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Pro Contractor Account</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-foreground uppercase tracking-tight">
                  Jinnah Hardware Partner
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Client ID: JH-2026-9921 • Premium Tier Level
                </p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="p-8 space-y-6">
              <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
                Partner Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Company Name</span>
                  <p className="text-sm font-extrabold text-[#1a1917]">Elite Architectural Builders Ltd</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Direct Phone</span>
                  <p className="text-sm font-extrabold text-[#1a1917]">0300-0421772 (Registered Line)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Office Email</span>
                  <p className="text-sm font-extrabold text-[#1a1917]">technicalhammad39@gmail.com</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Discount Tier Margin</span>
                  <p className="text-sm font-extrabold text-emerald-600">Flat 15% off on Bulk Orders</p>
                </div>
              </div>

              {/* Order History Simulation */}
              <div className="pt-6 border-t border-black/5 space-y-4">
                <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
                  Order & Proposal History
                </h4>

                <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 flex items-center justify-between">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider leading-none">
                      In Transit
                    </span>
                    <h5 className="text-xs font-extrabold text-[#1a1917] leading-none uppercase">
                      Pro Latch Fittings & Biometric Mortises
                    </h5>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      ID: JH-ORD-77192 • Placed July 23, 2026
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground">Estimate Total</p>
                    <p className="text-sm font-black text-[#1a1917]">$727.50</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 flex items-center justify-between opacity-70">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-extrabold bg-black/10 text-black/70 px-2 py-0.5 rounded-full uppercase tracking-wider leading-none">
                      Delivered
                    </span>
                    <h5 className="text-xs font-extrabold text-[#1a1917] leading-none uppercase">
                      Knurled Brass Drawer Pull T-Bars
                    </h5>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      ID: JH-ORD-66212 • Placed April 12, 2026
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground">Order Total</p>
                    <p className="text-sm font-black text-[#1a1917]">$174.00</p>
                  </div>
                </div>
              </div>

              {/* Customer Desk Alert */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground font-medium">
                  <strong>PRO-ACCOUNT GUARANTEE:</strong> Verified account discounts are auto-applied to checkout subtotals. Contact 0300-0421772 for commercial limits.
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Configuring Showroom...
          </span>
        </div>
      </div>
    }>
      <Navbar />
      <ShopContent />
    </Suspense>
  );
}
