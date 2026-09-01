"use client";

import { useEffect, useRef, useState } from "react";
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
  Minus,
  Plus,
  Clock,
  Lock
} from "lucide-react";
import {
  useCartActions,
  useWishlistActions,
  useWishlistState,
  useOverlayActions,
  useCartState
} from "@/context/AppContext";
import { calculateProductPrice } from "@/lib/discount-engine";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGallery } from "@/components/products/ProductGallery";
import { SellerCard } from "@/components/products/SellerCard";
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

  const hasReviews = initialProduct.reviewCount > 0;
  const rating = initialProduct.averageRating ? Number(initialProduct.averageRating).toFixed(1) : "0.0";

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-16">
          
          {/* LEFT COLUMN: Images Section (4/12) */}
          <div className="lg:col-span-4">
            <ProductGallery 
              images={initialProduct.images || []}
              productName={initialProduct.name}
              isNew={initialProduct.isNew}
            />
          </div>

          {/* CENTER COLUMN: Details, Variants, Action Buttons (5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Title, Brand, Rating */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-sm w-max">
                {initialProduct.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {initialProduct.name}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  onClick={() => {
                    setActiveTab('reviews');
                    window.scrollTo({ top: 600, behavior: 'smooth' }); // Rough scroll, could be improved with refs
                  }}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <div className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{rating}</span>
                  <span className="text-sm text-blue-600 font-medium">
                    ({initialProduct.reviewCount || 0} Reviews)
                  </span>
                </button>

                {initialProduct.brand && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500 font-medium">Brand: <span className="text-gray-900 font-bold">{initialProduct.brand}</span></span>
                  </>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Pricing Section */}
            <div className="flex flex-col gap-1">
              {pricing.hasDiscount ? (
                <>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-primary">
                      Rs. {pricing.finalPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-gray-400 line-through mb-1">
                      Rs. {pricing.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm w-max mt-1">
                    -{pricing.discountType === 'percentage' 
                        ? `${pricing.discountValue}%` 
                        : `Rs. ${pricing.discountValue}`}
                  </span>
                </>
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-gray-900">
                  Rs. {pricing.finalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Variants */}
            {(initialProduct.colors?.length > 0 || initialProduct.sizes?.length > 0) && (
              <div className="flex flex-col gap-5">
                {initialProduct.colors?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-gray-900">Color Family</span>
                    <div className="flex flex-wrap gap-2">
                      {initialProduct.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                            selectedColor === color
                              ? "border-primary text-primary bg-primary/5"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {initialProduct.sizes?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-gray-900">Size / Option</span>
                    <div className="flex flex-wrap gap-2">
                      {initialProduct.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                            selectedSize === size
                              ? "border-primary text-primary bg-primary/5"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Quantity</span>
                <span className="text-xs font-medium text-gray-500">{initialProduct.stockQuantity || 0} pieces available</span>
              </div>
              <div className="flex items-center w-max bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 font-bold text-gray-900 text-sm border-x border-gray-100 min-w-[50px] text-center">
                  {quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  disabled={quantity >= (initialProduct.stockQuantity || 1)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions (Add to Cart / Buy Now / Wishlist) */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={initialProduct.stockQuantity <= 0}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all bg-primary text-white hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="h-4 w-4" /> Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(initialProduct.id)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm border transition-all shrink-0 ${
                    isWishlisted
                      ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                      : "bg-white text-gray-500 border-gray-200 hover:text-red-500 hover:bg-gray-50"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isSuccess || initialProduct.stockQuantity <= 0}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-sm transition-all border ${
                  initialProduct.stockQuantity <= 0
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : isSuccess
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-white text-primary border-primary hover:bg-primary/5"
                }`}
              >
                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : isSuccess ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                {initialProduct.stockQuantity <= 0 ? "Out of Stock" : isSuccess ? "Added to Cart" : "Add to Cart"}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Trust Box & Delivery Info & Seller (3/12) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Delivery & Policies */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 text-sm tracking-wide uppercase">Delivery</h3>
              
              <div className="flex items-start gap-4">
                <div className="text-gray-400 shrink-0 mt-0.5">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Standard Delivery</h4>
                  <p className="text-xs text-gray-500 mt-0.5">3-5 working days across Pakistan.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="text-gray-400 shrink-0 mt-0.5">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Return Policy</h4>
                  <p className="text-xs text-gray-500 mt-0.5">7 days hassle-free return policy if items are damaged or incorrect.</p>
                </div>
              </div>

              {/* Warranty (if applicable, mocking for layout) */}
              <div className="flex items-start gap-4">
                <div className="text-gray-400 shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Warranty</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Brand warranty applies if specified on product.</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <SellerCard />

            {/* Safety & Payment Assurances */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <Lock className="w-4 h-4 text-emerald-500" /> Secure Checkout
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <Check className="w-4 h-4 text-emerald-500" /> Cash on Delivery Available
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
