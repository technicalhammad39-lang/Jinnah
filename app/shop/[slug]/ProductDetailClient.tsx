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
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ChevronLeft,
  Minus,
  Plus,
  Info,
  Clock,
  ThumbsUp
} from "lucide-react";
import {
  useCartActions,
  useWishlistActions,
  useWishlistState,
  useOverlayActions,
  useCartState
} from "@/context/AppContext";
import { calculateProductPrice } from "@/lib/discount-engine";
import { getPublicUploadUrl } from "@/lib/utils";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import dynamic from "next/dynamic";

const ReviewsTab = dynamic(() => import("@/components/products/ReviewsTab"), {
  loading: () => <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

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
  const { discounts } = useCartState();
  
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
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

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && quantity < (initialProduct.stockQuantity || 1)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleBuyNow = () => {
    addToCart(initialProduct, quantity, selectedColor, selectedSize);
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
      addToCart(initialProduct, quantity, selectedColor, selectedSize);
      
      setCartOpen(true);

      successTimerRef.current = window.setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 600);
  };

  const rawSpecs = initialProduct.specifications;
  const specifications = (rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs)) ? rawSpecs : {};
  const hasSpecs = Object.keys(specifications).length > 0;
  
  const formatHTML = (html: string) => {
    if (!html) return '';
    if (!/<[a-z][\s\S]*>/i.test(html)) {
      return html.replace(/\n/g, '<br />');
    }
    return html;
  };

  // Price calculations using discount engine
  const pricing = calculateProductPrice(initialProduct.price, initialProduct.id, discounts || []);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] pt-28">
      <Navbar />
      
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 pb-32 sm:pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#1a1917] truncate max-w-[150px] sm:max-w-[200px]">{initialProduct.name}</span>
        </div>

        {/* TOP SECTION: 3 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* LEFT COLUMN: Images Section (5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 group">
              {activeImage && (
                <Image
                  src={getPublicUploadUrl(activeImage)}
                  alt={initialProduct.name}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              )}
              {initialProduct.isNew && (
                <div className="absolute top-4 left-4 z-10 rounded bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                  New Arrival
                </div>
              )}
              {/* Prev / Next Buttons overlay (Optional for future) */}
            </div>

            {/* Thumbnails */}
            {initialProduct.images && initialProduct.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {initialProduct.images.map((img: string) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-white transition-all ${
                      activeImage === img ? "border-primary shadow-sm" : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={getPublicUploadUrl(img)}
                      alt="Thumbnail"
                      fill
                      sizes="80px"
                      className="object-contain p-2 mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CENTER COLUMN: Details, Variants, Action Buttons (4/12) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
                {initialProduct.brand || initialProduct.category}
              </span>
              <button
                onClick={() => toggleWishlist(initialProduct.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm border transition-all ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                    : "bg-white text-gray-500 border-gray-200 hover:text-red-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3 leading-tight">
              {initialProduct.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('reviews')}>
                <div className="flex text-amber-400">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold text-gray-900 ml-1">{initialProduct.rating || "0.0"}</span>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  ({initialProduct.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-black text-gray-900">
                Rs. {pricing.finalPrice.toLocaleString()}
              </span>
              {pricing.hasDiscount && (
                <>
                  <span className="text-lg font-semibold text-gray-400 line-through mb-0.5">
                    Rs. {pricing.originalPrice.toLocaleString()}
                  </span>
                  <span className="mb-1 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                    -{pricing.discountType === 'percentage' 
                        ? `${pricing.discountValue}%` 
                        : `Rs. ${pricing.discountValue}`}
                  </span>
                </>
              )}
            </div>

            {/* Options */}
            <div className="space-y-6 mb-8">
              {initialProduct.colors && initialProduct.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Color: <span className="text-gray-500 font-normal">{selectedColor}</span>
                  </h3>
                  <div className="flex gap-3">
                    {initialProduct.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? "border-primary ring-4 ring-primary/20 scale-110"
                            : "border-gray-200 hover:scale-105"
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
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Size: <span className="text-gray-500 font-normal">{selectedSize}</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {initialProduct.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                          selectedSize === size
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inline Purchase Actions (Desktop Center Column) */}
            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Quantity</span>
                <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center font-bold text-gray-900 text-sm border-x border-gray-100">
                    {quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= (initialProduct.stockQuantity || 1)}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {initialProduct.stockQuantity <= 0 ? (
                <div className="py-4 px-4 bg-red-50 text-red-600 rounded-xl text-center font-bold text-sm border border-red-100">
                  Currently Out of Stock
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || isSuccess}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-sm transition-all border ${
                      isSuccess
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-white text-primary border-primary hover:bg-primary/5"
                    }`}
                  >
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : isSuccess ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    {isSuccess ? "Added to Cart" : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all bg-primary text-white hover:bg-primary/90 hover:shadow-lg"
                  >
                    <Zap className="h-4 w-4" /> Buy Now
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Trust Box & Delivery Info (3/12) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5 sticky top-32">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Delivery & Policies</h3>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-2.5 rounded-full text-blue-600 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Standard Delivery</h4>
                  <p className="text-xs text-gray-500 mt-0.5">3-5 working days across Pakistan. Special rates apply for heavy items.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-600 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Secure Payment</h4>
                  <p className="text-xs text-gray-500 mt-0.5">We use SSL encryption to ensure safe and secure transactions.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-amber-50 p-2.5 rounded-full text-amber-600 shrink-0">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Return Policy</h4>
                  <p className="text-xs text-gray-500 mt-0.5">7 days hassle-free return policy if items are damaged or incorrect.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-50 p-2.5 rounded-full text-purple-600 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">24/7 Support</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Dedicated customer service to assist with your queries.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tabs Section (Description, Features, Specifications, Reviews) */}
        <div className="border-t border-gray-200 pt-16 mb-16">
          <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['description', 'features', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
                {tab === 'reviews' && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {initialProduct.reviewCount || 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose prose-base max-w-4xl text-gray-600 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div 
                  className="leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-2"
                  dangerouslySetInnerHTML={{ 
                    __html: formatHTML(initialProduct.longDescription || initialProduct.description) 
                  }} 
                />
              </div>
            )}

            {activeTab === 'features' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
                {initialProduct.features && initialProduct.features.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {initialProduct.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 font-medium p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-sm font-medium text-gray-500 border border-gray-100">
                    No key features listed for this product.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
                {hasSpecs ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {Object.entries(specifications).map(([key, value], index) => (
                      <div 
                        key={key} 
                        className={`flex flex-col sm:flex-row sm:justify-between px-6 py-4 text-sm ${
                          index !== Object.entries(specifications).length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <span className="font-semibold text-gray-600 mb-1 sm:mb-0 w-1/3">{key}</span>
                        <span className="font-medium text-gray-900 w-2/3">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-sm font-medium text-gray-500 border border-gray-100">
                    No technical specifications provided for this product.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ReviewsTab product={initialProduct} />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Universal Sticky Bottom Purchase Bar (Mobile ONLY now) */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50 items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleBuyNow}
            disabled={initialProduct.stockQuantity <= 0}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold shadow-md transition-all ${
              initialProduct.stockQuantity <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-primary text-white"
            }`}
          >
            <Zap className="h-4 w-4" /> Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isSuccess || initialProduct.stockQuantity <= 0}
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg shadow-md transition-all border ${
              initialProduct.stockQuantity <= 0
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : isSuccess
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-white text-primary border-primary"
            }`}
          >
            {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : isSuccess ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
