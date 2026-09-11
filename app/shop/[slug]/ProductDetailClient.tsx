"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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
  AlertCircle
} from "lucide-react";
import {
  useCartActions,
  useWishlistActions,
  useWishlistState,
  useOverlayActions,
  useCartState
} from "@/context/AppContext";
import { calculateProductPrice } from "@/lib/discount-engine";
import { getStockInfo } from "@/lib/inventory-engine";
import { getPublicUploadUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGallery } from "@/components/products/ProductGallery";
import { SellerCard } from "@/components/products/SellerCard";
import dynamic from "next/dynamic";

const ReviewsTab = dynamic(() => import("@/components/products/ReviewsTab"), {
  loading: () => <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

interface ColorOption {
  name: string;
  image?: string;
  variant?: any;
}

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
  const { discounts, shippingSettings, shippingResult } = useCartState();
  
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorImage, setSelectedColorImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [actualReviewCount, setActualReviewCount] = useState(initialProduct.reviewCount || 0);
  const [actualRating, setActualRating] = useState(initialProduct.averageRating || 0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);
  const mainActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If main actions are out of view, show sticky bar.
        // We only care about mobile, but we handle mobile classes in the JSX.
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" } // trigger when it scrolls out
    );

    if (mainActionsRef.current) {
      observer.observe(mainActionsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const availableColors = useMemo(() => {
    if (initialProduct?.colors && initialProduct.colors.length > 0) {
      return initialProduct.colors;
    }
    return Array.from(
      new Set(
        (initialProduct?.variants || [])
          .map((v: any) => v.color?.trim())
          .filter((c: any): c is string => Boolean(c))
      )
    );
  }, [initialProduct]);

  const availableSizes = useMemo(() => {
    if (initialProduct?.sizes && initialProduct.sizes.length > 0) {
      return initialProduct.sizes;
    }
    return Array.from(
      new Set(
        (initialProduct?.variants || [])
          .map((v: any) => v.size?.trim())
          .filter((s: any): s is string => Boolean(s))
      )
    );
  }, [initialProduct]);

  // Image-based color options resolving variant image, colorImages map, or fallback
  const colorOptions: ColorOption[] = useMemo(() => {
    return availableColors.map((colorName: string): ColorOption => {
      const clean = colorName.trim();
      const variant = initialProduct?.variants?.find(
        (v: any) => v.color?.trim().toLowerCase() === clean.toLowerCase() && v.image
      );
      const mappedImage = initialProduct?.colorImages?.[clean] || initialProduct?.colorImages?.[colorName];
      const image = variant?.image || mappedImage || undefined;
      return {
        name: clean,
        image,
        variant,
      };
    });
  }, [availableColors, initialProduct]);

  useEffect(() => {
    if (initialProduct) {
      if (availableColors.length > 0) {
        // Prefer an in-stock color option if available
        const inStockColor = availableColors.find((c: string) => {
          const v = initialProduct.variants?.find(
            (varItem: any) => varItem.color?.trim().toLowerCase() === c.trim().toLowerCase()
          );
          return v ? (Number(v.stockQuantity) || 0) > 0 : true;
        }) || availableColors[0];

        setSelectedColor(inStockColor);
        const opt = colorOptions.find((o: ColorOption) => o.name.toLowerCase() === inStockColor.toLowerCase());
        setSelectedColorImage(opt?.image || null);
      } else {
        setSelectedColor("");
        setSelectedColorImage(null);
      }
      setSelectedSize(availableSizes[0] || "");
    }
  }, [initialProduct, availableColors, availableSizes, colorOptions]);

  const handleColorSelect = (colorName: string, colorImg?: string) => {
    setSelectedColor(colorName);
    setValidationError(null);
    const opt = colorOptions.find((o: ColorOption) => o.name.toLowerCase() === colorName.toLowerCase());
    const imgToUse = colorImg || opt?.image;
    if (imgToUse) {
      setSelectedColorImage(imgToUse);
    }
  };

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

  const stockInfo = getStockInfo(initialProduct, selectedColor, selectedSize);

  useEffect(() => {
    if (initialProduct) {
      const currentStock = getStockInfo(initialProduct, selectedColor, selectedSize).stock;
      if (currentStock > 0 && quantity > currentStock) {
        setQuantity(currentStock);
      } else if (currentStock === 0) {
        setQuantity(1);
      }
    }
  }, [selectedColor, selectedSize, initialProduct]);

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && quantity < stockInfo.stock) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleBuyNow = () => {
    if (availableColors.length > 0 && !selectedColor) {
      setValidationError("Please select a color option.");
      toast.error("Please select a color option.");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      setValidationError("Please select a size / option.");
      toast.error("Please select a size/option.");
      return;
    }
    setValidationError(null);
    if (!stockInfo.isAvailable || stockInfo.stock <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }
    const added = addToCart(initialProduct, quantity, selectedColor, selectedSize, false);
    if (added) {
      router.push('/checkout');
    }
  };

  const handleAddToCart = () => {
    if (availableColors.length > 0 && !selectedColor) {
      setValidationError("Please select a color option.");
      toast.error("Please select a color option.");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      setValidationError("Please select a size / option.");
      toast.error("Please select a size/option.");
      return;
    }
    setValidationError(null);
    if (isSuccess || !stockInfo.isAvailable || stockInfo.stock <= 0) {
      if (!stockInfo.isAvailable || stockInfo.stock <= 0) {
        toast.error("This item is currently out of stock.");
      }
      return;
    }

    if (addTimerRef.current) window.clearTimeout(addTimerRef.current);
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);

    setIsAdding(true);
    addTimerRef.current = window.setTimeout(() => {
      setIsAdding(false);
      const added = addToCart(initialProduct, quantity, selectedColor, selectedSize, false);
      if (added) {
        setIsSuccess(true);
        toast.success("Added to cart");
        successTimerRef.current = window.setTimeout(() => {
          setIsSuccess(false);
        }, 2000);
      }
    }, 400);
  };

  // Dynamic specifications resolver: combines top-level attributes and custom specifications
  const specifications = useMemo(() => {
    if (!initialProduct) return {};
    const specs: Record<string, string> = {};

    // 1. Dimensions (from Admin Details)
    const dimensionsVal = initialProduct.dimensions?.trim() || initialProduct.specifications?.["Dimensions"]?.trim() || initialProduct.specifications?.["dimensions"]?.trim();
    if (dimensionsVal) {
      specs["Dimensions"] = dimensionsVal;
    }

    // 2. Weight (from Admin Details)
    const weightVal = initialProduct.weight?.trim() || initialProduct.specifications?.["Weight"]?.trim() || initialProduct.specifications?.["weight"]?.trim();
    if (weightVal) {
      specs["Weight"] = weightVal;
    }

    // 3. Brand
    const brandVal = initialProduct.brand?.trim() || initialProduct.specifications?.["Brand"]?.trim();
    if (brandVal) {
      specs["Brand"] = brandVal;
    }

    // 4. Category
    const categoryVal = initialProduct.category?.trim() || initialProduct.specifications?.["Category"]?.trim();
    if (categoryVal) {
      specs["Category"] = categoryVal;
    }

    // 5. Materials (from variants or top-level)
    const matList = initialProduct.materials && initialProduct.materials.length > 0 
      ? initialProduct.materials 
      : Array.from(new Set((initialProduct.variants || []).map((v: any) => v.material?.trim()).filter((m: any): m is string => Boolean(m))));
    if (matList.length > 0) {
      specs["Material"] = matList.join(", ");
    } else if (initialProduct.specifications?.["Material"]?.trim()) {
      specs["Material"] = initialProduct.specifications["Material"].trim();
    }

    // 6. Available Sizes / Options
    if (availableSizes.length > 0) {
      specs["Available Sizes"] = availableSizes.join(", ");
    }

    // 7. Shipping Class (from Admin Details)
    const shippingClassVal = initialProduct.shippingClass?.trim() || initialProduct.specifications?.["Shipping Class"]?.trim() || initialProduct.specifications?.["shippingClass"]?.trim();
    if (shippingClassVal) {
      specs["Shipping Class"] = shippingClassVal;
    }

    // 8. Custom Delivery Estimate
    const estimateVal = initialProduct.deliveryEstimate?.trim() || initialProduct.specifications?.["Delivery Estimate"]?.trim();
    if (estimateVal) {
      specs["Delivery Estimate"] = estimateVal;
    }

    // 9. Merge any custom specification key-values that are not yet in specs
    if (initialProduct.specifications && typeof initialProduct.specifications === "object" && !Array.isArray(initialProduct.specifications)) {
      for (const [key, val] of Object.entries(initialProduct.specifications)) {
        if (val && String(val).trim() && !specs[key]) {
          specs[key] = String(val).trim();
        }
      }
    }

    return specs;
  }, [initialProduct, availableSizes]);

  const hasSpecs = Object.keys(specifications).length > 0;

  // Normalized features list (supports array or newline-delimited string)
  const featuresList = useMemo(() => {
    if (!initialProduct?.features) return [];
    if (Array.isArray(initialProduct.features)) {
      return initialProduct.features.map((f: any) => String(f).trim()).filter(Boolean);
    }
    if (typeof initialProduct.features === "string") {
      return (initialProduct.features as string).split("\n").map((f: string) => f.trim()).filter(Boolean);
    }
    return [];
  }, [initialProduct?.features]);
  
  const formatHTML = (html: string) => {
    if (!html) return '';
    if (!/<[a-z][\s\S]*>/i.test(html)) {
      return html.replace(/\n/g, '<br />');
    }
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*(["'])[\s\S]*?\1/gi, '')
      .replace(/javascript:/gi, '');
  };

  // Effective base price considering variant pricing if available
  const currentBasePrice = (stockInfo.matchedVariant?.price && stockInfo.matchedVariant.price > 0)
    ? stockInfo.matchedVariant.price
    : initialProduct.price;

  // Price calculations using discount engine
  const pricing = calculateProductPrice(currentBasePrice, initialProduct.id, discounts || []);

  const hasReviews = actualReviewCount > 0;
  const rating = actualRating ? Number(actualRating).toFixed(1) : "0.0";
  
  // Display shipping fee
  const displayShippingFee = initialProduct.shippingType === 'free' ? 0 : 
                            initialProduct.shippingType === 'fixed' ? (initialProduct.shippingFee || 0) : 
                            (shippingSettings?.defaultShippingFee || 200);
                            
  const displayDeliveryEstimate = initialProduct.deliveryEstimate || shippingSettings?.defaultDeliveryEstimate || "3-5 working days";

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] pt-28">
      <Navbar />
      
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 pb-32 sm:pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          {initialProduct.category && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link href={`/shop?category=${encodeURIComponent(initialProduct.category.toLowerCase())}`} className="hover:text-primary transition-colors">
                {initialProduct.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-[#1a1917] truncate max-w-[150px] sm:max-w-[200px]">{initialProduct.name}</span>
        </div>

        {/* TOP SECTION: 3 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-16 min-w-0 w-full">
          
          {/* LEFT COLUMN: Images Section (4/12) */}
          <div className="lg:col-span-4 min-w-0 w-full">
            <ProductGallery 
              images={initialProduct.images || []}
              productName={initialProduct.name}
              isNew={initialProduct.isNew}
              selectedImage={selectedColorImage}
            />
          </div>

          {/* CENTER COLUMN: Details, Variants, Action Buttons (5/12) */}
          <div className="lg:col-span-5 min-w-0 w-full flex flex-col gap-6">
            
            {/* Title, Brand, Rating */}
            <div className="flex flex-col gap-3 min-w-0 w-full">
              {initialProduct.category && (
                <Link
                  href={`/shop?category=${encodeURIComponent(initialProduct.category.toLowerCase())}`}
                  className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-sm w-max transition-colors"
                >
                  {initialProduct.category}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight break-words [overflow-wrap:anywhere]">
                {initialProduct.name}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  onClick={() => {
                    const el = document.getElementById('reviews');
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <div className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{rating}</span>
                  <span className="text-sm text-blue-600 font-medium">
                    ({actualReviewCount} Reviews)
                  </span>
                </button>

                {initialProduct.brand && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500 font-medium">Brand: <Link href={`/shop?brand=${encodeURIComponent(initialProduct.brand.toLowerCase())}`} className="text-gray-900 font-bold hover:text-primary transition-colors">{initialProduct.brand}</Link></span>
                  </>
                )}
              </div>
            </div>

            {/* Short Description */}
            {initialProduct.shortDescription && (
              <div className="text-sm text-gray-600 leading-relaxed -mt-1 break-words [overflow-wrap:anywhere] whitespace-pre-line min-w-0 w-full">
                {initialProduct.shortDescription}
              </div>
            )}

            <hr className="border-gray-200" />

            {/* Pricing Section (Inline with Stock Status on all devices) */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {pricing.hasDiscount ? (
                <>
                  <div className="flex items-baseline gap-2.5 sm:gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-primary">
                      Rs. {pricing.finalPrice.toLocaleString()}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-400 line-through">
                      Rs. {pricing.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
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

              {/* Real-time Inventory Status Badge - Positioned inline next to price */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${stockInfo.badgeClass}`}>
                <span className={`h-2 w-2 rounded-full ${
                  stockInfo.status === 'in_stock'
                    ? 'bg-emerald-500'
                    : stockInfo.status === 'low_stock'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`} />
                {stockInfo.label}
              </span>
            </div>

            <hr className="border-gray-200" />

            {/* Variants */}
            {(colorOptions.length > 0 || availableSizes.length > 0) && (
              <div className="flex flex-col gap-5">
                {colorOptions.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Color Family</span>
                      {selectedColor && (
                        <span className="text-xs font-semibold text-gray-600 capitalize">
                          Selected: <span className="text-gray-900 font-bold">{selectedColor}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {colorOptions.map((opt: ColorOption) => {
                        const isSelected = selectedColor?.toLowerCase() === opt.name.toLowerCase();
                        const isColorOutOfStock = initialProduct.variants && initialProduct.variants.length > 0
                          ? selectedSize
                            ? (initialProduct.variants.find((v: any) => v.color?.trim().toLowerCase() === opt.name.toLowerCase() && v.size?.trim().toLowerCase() === selectedSize.trim().toLowerCase())?.stockQuantity ?? 0) <= 0
                            : !initialProduct.variants.some((v: any) => v.color?.trim().toLowerCase() === opt.name.toLowerCase() && (Number(v.stockQuantity) || 0) > 0)
                          : false;

                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => handleColorSelect(opt.name, opt.image)}
                            className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-[#1a1917] bg-[#1a1917]/5 text-[#1a1917] shadow-sm ring-1 ring-[#1a1917]"
                                : isColorOutOfStock
                                ? "border-gray-200 bg-gray-50/60 text-gray-400 hover:border-gray-300"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/80"
                            }`}
                          >
                            {opt.image ? (
                              <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                                <Image
                                  src={getPublicUploadUrl(opt.image)}
                                  alt={opt.name}
                                  fill
                                  sizes="36px"
                                  className={`object-cover ${isColorOutOfStock ? "opacity-50 grayscale" : ""}`}
                                />
                              </div>
                            ) : (
                              <div className="h-7 w-7 rounded-full border border-gray-200 shrink-0 flex items-center justify-center bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                                {opt.name.slice(0, 2)}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className={`text-xs sm:text-sm font-bold capitalize whitespace-nowrap ${isColorOutOfStock ? "line-through text-gray-400" : ""}`}>
                                {opt.name}
                              </span>
                              {isColorOutOfStock && (
                                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tight">
                                  Out of stock
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {availableSizes.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Size / Option</span>
                      {selectedSize && (
                        <span className="text-xs font-semibold text-gray-600">
                          Selected: <span className="text-gray-900 font-bold">{selectedSize}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size: string) => {
                        const isSelected = selectedSize === size;
                        const isSizeOutOfStock = initialProduct.variants && initialProduct.variants.length > 0
                          ? selectedColor
                            ? (initialProduct.variants.find((v: any) => v.size?.trim().toLowerCase() === size.trim().toLowerCase() && v.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase())?.stockQuantity ?? 0) <= 0
                            : !initialProduct.variants.some((v: any) => v.size?.trim().toLowerCase() === size.trim().toLowerCase() && (Number(v.stockQuantity) || 0) > 0)
                          : false;

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setSelectedSize(size);
                              setValidationError(null);
                            }}
                            className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "border-[#1a1917] bg-[#1a1917] text-white shadow-sm"
                                : isSizeOutOfStock
                                ? "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <span className={isSizeOutOfStock ? "line-through" : ""}>{size}</span>
                            {isSizeOutOfStock && (
                              <span className={`text-[10px] font-bold ${isSelected ? "text-rose-300" : "text-rose-500"}`}>
                                (Out)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Quantity</span>
                <span className="text-xs font-semibold">
                  {stockInfo.stock > 0 ? (
                    <span className={stockInfo.status === 'low_stock' ? "text-amber-600 font-bold" : "text-emerald-600 font-medium"}>
                      {stockInfo.status === 'low_stock' ? "Low stock - order soon" : "In stock"}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">Currently unavailable</span>
                  )}
                </span>
              </div>
              <div className="flex items-center w-max bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1 || stockInfo.stock <= 0}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 font-bold text-gray-900 text-sm border-x border-gray-100 min-w-[50px] text-center">
                  {stockInfo.stock > 0 ? quantity : 0}
                </div>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  disabled={quantity >= stockInfo.stock || stockInfo.stock <= 0}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm font-bold animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Actions (Add to Cart / Buy Now / Wishlist) */}
            <div ref={mainActionsRef} className="flex flex-col gap-3 mt-2">
              {/* Top row: Buy Now full width */}
              <button
                onClick={handleBuyNow}
                disabled={!stockInfo.isAvailable}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all ${
                  !stockInfo.isAvailable
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                    : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg"
                }`}
              >
                <Zap className="h-4 w-4" /> {!stockInfo.isAvailable ? "Out of Stock" : "Buy Now"}
              </button>
              
              {/* Bottom row: Add to Cart and Wishlist */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isSuccess || !stockInfo.isAvailable}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-sm transition-all border ${
                    !stockInfo.isAvailable
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : isSuccess
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-white text-primary border-primary hover:bg-primary/5"
                  }`}
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : isSuccess ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                  {!stockInfo.isAvailable ? "Out of Stock" : isSuccess ? "Added to Cart" : "Add to Cart"}
                </button>
                <button
                  onClick={() => toggleWishlist(initialProduct.id)}
                  className={`flex w-[52px] shrink-0 items-center justify-center rounded-xl shadow-sm border transition-all ${
                    isWishlisted
                      ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                      : "bg-white text-gray-500 border-gray-200 hover:text-red-500 hover:bg-gray-50"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Threshold Hype UI (Product Level) */}
            {shippingSettings?.thresholdEnabled && shippingResult && (
              <div className="bg-[#FF6A2A]/5 px-4 py-3 border border-[#FF6A2A]/20 rounded-xl mt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm text-[#FF6A2A]">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-[#1a1917]">
                      {shippingSettings.benefitType === "free_shipping" 
                        ? `Free Shipping on Orders Over Rs. ${shippingSettings.thresholdAmount.toLocaleString()}!` 
                        : `Extra Discount on Orders Over Rs. ${shippingSettings.thresholdAmount.toLocaleString()}!`}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {shippingResult.thresholdRemaining > 0
                        ? `Add Rs. ${shippingResult.thresholdRemaining.toLocaleString()} more to your cart to claim your benefit.`
                        : "🎉 Benefit unlocked in your cart!"}
                    </p>
                    {shippingResult.thresholdRemaining > 0 && (
                      <div className="w-full bg-black/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div 
                          className="bg-[#FF6A2A] h-1.5 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${shippingResult.thresholdProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Trust Box & Delivery Info & Seller (3/12) */}
          <div className="lg:col-span-3 min-w-0 w-full flex flex-col gap-6">
            
            {/* Delivery & Policies */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 text-sm tracking-wide uppercase">Delivery</h3>
              
              <div className="flex items-start gap-4">
                <div className="text-gray-400 shrink-0 mt-0.5">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {displayShippingFee === 0 ? "Free Delivery" : `Standard Delivery (Rs. ${displayShippingFee})`}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{displayDeliveryEstimate}</p>
                </div>
              </div>
              
              {initialProduct.shippingNote && (
                <div className="flex items-start gap-4">
                  <div className="text-[#FF6A2A] shrink-0 mt-0.5">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Delivery Note</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{initialProduct.shippingNote}</p>
                  </div>
                </div>
              )}
              
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

          </div>

        </div>

        {/* Tabs Section (Description, Features, Specifications, Reviews) */}
        <div className="border-t border-gray-200 pt-16 mb-16">
          <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['description', 'features', 'specifications'].map((tab) => (
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
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose prose-base max-w-4xl text-gray-600 animate-in fade-in slide-in-from-bottom-2 duration-500 min-w-0 w-full">
                <div 
                  className="leading-relaxed break-words [overflow-wrap:anywhere] [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-2"
                  dangerouslySetInnerHTML={{ 
                    __html: formatHTML(initialProduct.longDescription || initialProduct.description) 
                  }} 
                />
              </div>
            )}

            {activeTab === 'features' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
                {featuresList.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuresList.map((feature: string, idx: number) => (
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
          </div>
        </div>

        {/* Reviews Section - Always Visible */}
        <div id="reviews" className="border-t border-gray-200 pt-16 mb-16">
          <ReviewsTab 
            product={initialProduct} 
            onReviewsLoaded={(count, avg) => {
              setActualReviewCount(count);
              setActualRating(avg);
            }} 
          />
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
      <div 
        className={`flex md:hidden fixed left-4 right-4 p-2.5 bg-white/95 backdrop-blur-xl border border-gray-200 z-50 items-center justify-between rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out ${
          showStickyBar ? "translate-y-0" : "translate-y-[150%]"
        }`}
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
      >
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={handleBuyNow}
            disabled={!stockInfo.isAvailable}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold shadow-md transition-all ${
              !stockInfo.isAvailable
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-primary text-white"
            }`}
          >
            <Zap className="h-4 w-4" /> {!stockInfo.isAvailable ? "Out of Stock" : "Buy Now"}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isSuccess || !stockInfo.isAvailable}
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg shadow-md transition-all border ${
              !stockInfo.isAvailable
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
