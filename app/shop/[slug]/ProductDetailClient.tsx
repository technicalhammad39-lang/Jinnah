"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Check,
  Loader2,
  MessageCircle,
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  useCartActions,
  useWishlistActions,
  useWishlistState,
  useOverlayActions,
} from "@/context/AppContext";
import { getPublicUploadUrl } from "@/lib/utils";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ProductCard } from "@/components/products/ProductCard";

export default function ProductDetailClient({ 
  initialProduct, 
  allProducts = [] 
}: { 
  initialProduct: any; 
  allProducts?: any[]; 
}) {
  const router = useRouter();
  const { addToCart } = useCartActions();
  const { wishlist } = useWishlistState();
  const { toggleWishlist } = useWishlistActions();
  const { setCartOpen } = useOverlayActions();
  
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const addTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setActiveImage(initialProduct.images?.[0] || "");
      setSelectedColor(initialProduct.colors?.[0] || "");
      setSelectedSize(initialProduct.sizes?.[0] || "");
    }
  }, [initialProduct]);

  useEffect(() => {
    return () => {
      if (addTimerRef.current) window.clearTimeout(addTimerRef.current);
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  if (!initialProduct) {
    return (
      <div className="min-h-screen flex flex-col justify-between pt-28 bg-[#faf9f6]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-4xl font-black text-[#1a1917] mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
          <Link 
            href="/shop"
            className="px-8 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isWishlisted = wishlist.includes(initialProduct.id);
  
  const relatedProducts = allProducts
    .filter(p => p.id !== initialProduct.id && (p.category === initialProduct.category || p.brand === initialProduct.brand))
    .slice(0, 4);

  const handleBuyNow = () => {
    addToCart(initialProduct, 1, selectedColor, selectedSize);
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (isSuccess) return;

    if (addTimerRef.current) window.clearTimeout(addTimerRef.current);
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);

    setIsAdding(true);
    addTimerRef.current = window.setTimeout(() => {
      setIsAdding(false);
      setIsSuccess(true);
      addToCart(initialProduct, 1, selectedColor, selectedSize);
      
      setCartOpen(true);

      successTimerRef.current = window.setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 600);
  };

  const rawSpecs = initialProduct.specifications;
  const specifications = (rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs)) ? rawSpecs : {};
  const hasSpecs = Object.keys(specifications).length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] pt-28">
      <Navbar />
      
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 pb-24 sm:pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-primary">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#1a1917] truncate max-w-[200px]">{initialProduct.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images Section */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-[32px] overflow-hidden bg-white shadow-sm border border-black/5">
              {activeImage ? (
                <Image
                  src={getPublicUploadUrl(activeImage)}
                  alt={initialProduct.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : null}
              {initialProduct.isNew && (
                <div className="absolute top-6 left-6 z-10 rounded-full bg-primary px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
                  NEW ARRIVAL
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {initialProduct.images && initialProduct.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {initialProduct.images.map((img: string) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-2xl border-2 overflow-hidden transition-all ${
                      activeImage === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={getPublicUploadUrl(img)}
                      alt="Thumbnail"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col justify-start">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary mb-2">
              {initialProduct.brand}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#1a1917] mb-4">
              {initialProduct.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5">
              <div className="flex items-center gap-1 text-lg">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-bold text-[#1a1917]">{initialProduct.rating}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                ({initialProduct.reviewCount} customer reviews)
              </span>
              {initialProduct.stockQuantity > 0 ? (
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  In Stock
                </span>
              ) : (
                <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-[#1a1917]">
                Rs. {initialProduct.price.toLocaleString()}
              </span>
              {initialProduct.originalPrice > initialProduct.price && (
                <span className="text-lg font-semibold text-muted-foreground line-through">
                  Rs. {initialProduct.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium">
              {initialProduct.description}
            </p>

            {/* Options */}
            <div className="space-y-6 mb-8">
              {initialProduct.colors && initialProduct.colors.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#1a1917] mb-3">
                    Available Finishes
                  </h3>
                  <div className="flex gap-3">
                    {initialProduct.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? "border-primary ring-4 ring-primary/20 scale-110"
                            : "border-black/10 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {initialProduct.sizes && initialProduct.sizes.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#1a1917] mb-3">
                    Size / Variant
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {initialProduct.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                          selectedSize === size
                            ? "bg-[#1a1917] text-white border-[#1a1917]"
                            : "bg-white text-[#1a1917] border-black/10 hover:border-black/30 hover:bg-black/5"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {initialProduct.features && initialProduct.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#1a1917] mb-4">
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {initialProduct.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground font-medium">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isSuccess || initialProduct.stockQuantity <= 0}
                className={`flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-widest shadow-md transition-all duration-300 ${
                  initialProduct.stockQuantity <= 0
                    ? "bg-black/5 text-muted-foreground cursor-not-allowed"
                    : isSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-[#1a1917] text-white hover:bg-black hover:shadow-black/20"
                }`}
              >
                {initialProduct.stockQuantity <= 0 ? (
                  "Out of Stock"
                ) : isAdding ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                ) : isSuccess ? (
                  <><Check className="h-4 w-4" /> Added to Cart</>
                ) : (
                  <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={initialProduct.stockQuantity <= 0}
                className={`flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-widest shadow-md transition-all duration-300 ${
                  initialProduct.stockQuantity <= 0
                    ? "bg-black/5 text-muted-foreground cursor-not-allowed hidden sm:flex"
                    : "bg-primary text-white hover:bg-primary/90 hover:shadow-primary/20"
                }`}
              >
                <Zap className="h-4 w-4" /> Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(initialProduct.id)}
                className={`flex items-center justify-center h-[52px] w-[52px] rounded-full border transition-all ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100"
                    : "bg-white text-[#1a1917] border-black/10 hover:bg-black/5"
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-black/5 pt-6">
              <div className="flex flex-col items-center justify-center p-2 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-black/5 text-center">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-1.5 sm:mb-2" />
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#1a1917]">Secure</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Checkout</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-black/5 text-center">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-1.5 sm:mb-2" />
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#1a1917]">Fast</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Delivery</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-black/5 text-center">
                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-1.5 sm:mb-2" />
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#1a1917]">7 Days</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section (Description, Features, Specifications) */}
        <div className="border-t border-black/5 pt-16 mb-16">
          <div className="flex gap-8 border-b border-black/5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['description', 'features', 'specifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-[#1a1917]'
                    : 'border-transparent text-muted-foreground hover:text-[#1a1917]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500">
                {initialProduct.longDescription ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{initialProduct.longDescription}</p>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{initialProduct.description}</p>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {initialProduct.features && initialProduct.features.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {initialProduct.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground font-medium p-4 bg-white rounded-2xl border border-black/5 shadow-sm">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-black/5 rounded-[24px] p-8 text-center text-sm font-medium text-muted-foreground">
                    No key features listed for this product.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {hasSpecs ? (
                  <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden shadow-sm">
                    {Object.entries(specifications).map(([key, value], index) => (
                      <div 
                        key={key} 
                        className={`flex flex-col sm:flex-row sm:justify-between px-6 py-4 text-sm ${
                          index !== Object.entries(specifications).length - 1 ? 'border-b border-black/5' : ''
                        }`}
                      >
                        <span className="font-semibold text-muted-foreground mb-1 sm:mb-0">{key}</span>
                        <span className="font-bold text-[#1a1917] sm:text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/5 rounded-[24px] p-8 text-center text-sm font-medium text-muted-foreground">
                    No technical specifications provided for this product.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-black/5 pt-16">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#1a1917] mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Add to Cart */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-black/10 z-50 flex gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          onClick={handleBuyNow}
          disabled={initialProduct.stockQuantity <= 0}
          className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-xs font-bold uppercase tracking-widest shadow-md transition-all ${
            initialProduct.stockQuantity <= 0
              ? "bg-black/5 text-muted-foreground cursor-not-allowed"
              : "bg-primary text-white"
          }`}
        >
          <Zap className="h-4 w-4" /> Buy Now
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isSuccess || initialProduct.stockQuantity <= 0}
          className={`flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all ${
            initialProduct.stockQuantity <= 0
              ? "bg-black/20 cursor-not-allowed"
              : "bg-[#1a1917]"
          }`}
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuccess ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
        </button>
      </div>

      <Footer />
    </div>
  );
}
