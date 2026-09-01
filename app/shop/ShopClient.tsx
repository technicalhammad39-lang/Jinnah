"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOverlayActions, useWishlistState } from "@/context/AppContext";
import { CATEGORIES } from "@/data/products";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { 
  SlidersHorizontal, Heart, User, Sparkles, ShoppingBag, ArrowUpDown, ChevronRight, ShieldCheck, Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPublicUploadUrl } from "@/lib/utils";

export function ShopClient({ initialProducts = [], initialBrands = [] }: { initialProducts: any[], initialBrands: any[] }) {
  const { wishlist } = useWishlistState();
  const { setQuickViewProduct } = useOverlayActions();
  const searchParams = useSearchParams();

  // Active sub-tabs: "products" | "wishlist"
  const [activeTab, setActiveTab] = useState<"products" | "wishlist">("products");

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [brands, setBrands] = useState<any[]>(initialBrands);
  const [loadingData, setLoadingData] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [shopBottomBanner, setShopBottomBanner] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const q = query(
          collection(db, "banners"),
          where("pageKey", "==", "shop_bottom"),
          where("active", "==", true)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          // Take the first active banner for this location
          setShopBottomBanner(snapshot.docs[0].data().imageUrl);
        }
      } catch (error) {
        console.error("Error fetching shop banner:", error);
      }
    };
    fetchBanner();
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(150000); // Max budget slider
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
      const foundBrand = brands.find(
        (brand) => brand.id === brandParam || brand.brandName.toLowerCase() === brandParam.toLowerCase()
      );

      if (foundBrand) {
        setSelectedBrand(foundBrand.brandName);
      }
    } else {
      setSelectedBrand("All");
    }

    if (tabParam === "wishlist") {
      setActiveTab("wishlist");
    } else {
      setActiveTab("products");
    }

    if (prodParam) {
      const foundProduct = products.find((product) => product.id === prodParam);
      if (foundProduct) {
        setQuickViewProduct(foundProduct);
      }
    }
  }, [searchParams, setQuickViewProduct, products, brands]);

  const categoryOptions = useMemo(
    () => ["All", ...CATEGORIES.map((category) => category.name)],
    []
  );

  const brandOptions = useMemo(
    () => ["All", ...brands.map((brand) => brand.brandName)],
    [brands]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
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
    () => products.filter((product) => wishlist.includes(product.id)),
    [products, wishlist]
  );

  // Clear filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setPriceRange(150000);
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent pt-32 md:pt-44">
      {/* Search Header Area */}
      <div className="max-w-[1920px] mx-auto px-6 w-full text-left py-4 md:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-black/5 pb-6 md:pb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <Link href="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#1a1917]">E-Commerce Shop</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tighter">
              {activeTab === "products" ? "Industrial Catalog" : "My Personal Wishlist"}
            </h1>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            {/* Sub-tabs switches */}
            <div className="flex flex-1 md:flex-none rounded-full border border-black/10 bg-[#f1ece4]/90 p-1 shadow-[0_8px_20px_rgba(26,25,23,0.05)] backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("products")}
                className={`flex-1 md:flex-none px-3 md:px-4.5 py-2 rounded-full text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                className={`flex-1 md:flex-none px-3 md:px-4.5 py-2 rounded-full text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "wishlist"
                    ? "border border-black/5 bg-white text-[#1a1917] shadow-sm"
                    : "text-[#655d54] hover:bg-white/70 hover:text-[#1a1917]"
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                <span>Wishlist ({wishlist.length})</span>
              </button>
            </div>

            {/* Mobile Filter Toggle Button (Icon only) */}
            {activeTab === "products" && (
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden shrink-0 flex items-center justify-center w-[44px] h-[44px] rounded-full border border-black/10 bg-[#f1ece4]/90 shadow-sm hover:border-primary/50 text-[#1a1917] transition-all cursor-pointer"
                aria-label="Toggle Filters"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Rendering Block */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-24">
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">

            {/* Filters Sidebar (Col 1) */}
            <div className={`lg:col-span-1 sticky top-28 space-y-7 rounded-3xl border border-black/10 bg-white/85 p-6 text-left shadow-[0_16px_32px_rgba(26,25,23,0.05)] backdrop-blur-md ${isMobileFilterOpen ? "block" : "hidden lg:block"}`}>
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
                  <span className="text-xs font-bold text-[#1a1917]">Rs. {priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="1000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                  <span>Rs. 1,000</span>
                  <span>Rs. 150,000</span>
                </div>
              </div>

              {/* Sort By Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Sort By</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs font-bold bg-white/60 cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">User Rating</option>
                </select>
              </div>

              {/* Found Count */}
              <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                <div className="text-xs font-semibold text-muted-foreground text-left">
                  Found <span className="font-extrabold text-foreground">{sortedProducts.length}</span> Premium Products
                </div>
                {isMobileFilterOpen && (
                  <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden text-[10px] font-extrabold uppercase bg-primary text-white px-3 py-1.5 rounded-full cursor-pointer">
                    Apply
                  </button>
                )}
              </div>

            </div>

            {/* Catalog Grid Area (Col 3) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Staggered dynamic grid */}
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
      </div>

      {/* Dynamic Shop Bottom Banner */}
      {shopBottomBanner && (
        <div className="max-w-[1920px] mx-auto px-6 w-full mt-12 mb-12 lg:mb-20">
          <div className="relative w-full aspect-[21/9] md:aspect-[4/1] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-black/5">
            <Image 
              src={getPublicUploadUrl(shopBottomBanner)} 
              alt="Promotional Banner" 
              fill 
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ShopClientPage({ initialProducts = [], initialBrands = [] }: { initialProducts: any[], initialBrands: any[] }) {
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
      <ShopClient initialProducts={initialProducts} initialBrands={initialBrands} />
    </Suspense>
  );
}
