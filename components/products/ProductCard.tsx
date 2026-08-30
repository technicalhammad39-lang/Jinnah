"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  ShoppingCart,
  Star,
} from "lucide-react";
import {
  useCartActions,
  useOverlayActions,
  useWishlistActions,
  useWishlistState,
} from "@/context/AppContext";
import { Product } from "@/data/products";
import { getPublicUploadUrl } from "@/lib/utils";
import { calculateProductPrice } from "@/lib/discount-engine";
import { useCartState } from "@/context/AppContext";

interface ProductCardProps {
  product: Product;
}

function ProductCardComponent({ product }: ProductCardProps) {
  const { addToCart } = useCartActions();
  const { wishlist } = useWishlistState();
  const { discounts } = useCartState();
  const { toggleWishlist } = useWishlistActions();
  const { setQuickViewProduct, setCartOpen } = useOverlayActions();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>((product.sizes && product.sizes.length > 0) ? product.sizes[0] : null);

  // Update selected size when product changes (for quick view)
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [product]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const addTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
    setSelectedSize((product.sizes && product.sizes.length > 0) ? product.sizes[0] : null);
  }, [product]);

  useEffect(() => {
    return () => {
      if (addTimerRef.current !== null) {
        window.clearTimeout(addTimerRef.current);
      }

      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const isWishlisted = wishlist.includes(product.id);
  const pricing = calculateProductPrice(product.price, product.id, discounts);

  const nextImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (isSuccess) {
      return;
    }

    if (addTimerRef.current !== null) {
      window.clearTimeout(addTimerRef.current);
    }

    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
    }

    if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
      return;
    }

    setIsAdding(true);
    addTimerRef.current = window.setTimeout(() => {
      setIsAdding(false);
      setIsSuccess(true);
      addToCart(product, 1, product.colors?.[0] || "", selectedSize || undefined);
      setCartOpen(true);

      successTimerRef.current = window.setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 600);
  };

  const handleQuickViewClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setQuickViewProduct(product);
  };

  const handleBuyNow = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (product.stockQuantity !== undefined && product.stockQuantity <= 0) return;
    addToCart(product, 1, product.colors?.[0] || "", selectedSize || undefined);
    router.push('/checkout');
  };

  const handleCardClick = () => {
    router.push(`/shop/${product.slug || product.id}`);
  };

  return (
    <div
      data-no-premium-reveal
      onClick={handleCardClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-[#faf9f6] shadow-sm transition-all duration-500 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 h-full premium-transform cursor-pointer"
    >
      <div className="relative h-[180px] xs:h-[220px] sm:h-[280px] lg:h-[300px] w-full shrink-0 overflow-hidden bg-[#efece6]" data-cursor="view">
        <Link href={`/shop/${product.slug || product.id}`} className="block h-full w-full">
          <motion.div
            key={product.images?.[currentImageIndex] || "fallback"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            <Image
              src={getPublicUploadUrl(product.images?.[currentImageIndex] || "/placeholder.jpg")}
              alt={`${product.name} - View ${currentImageIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </Link>

        <div className="absolute inset-0 z-10 flex items-center justify-between p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={prevImage}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5">
          {product.images.map((image, index) => (
            <button
              key={image}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setCurrentImageIndex(index);
              }}
              className={`cursor-pointer rounded-full transition-all ${
                index === currentImageIndex ? "h-1.5 w-4.5 bg-primary" : "h-1.5 w-1.5 bg-primary/30"
              }`}
            />
          ))}
        </div>

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-md">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-md">
              BEST SELLER
            </span>
          )}
          {pricing.hasDiscount && (
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-md">
              {pricing.discountType === 'percentage' ? `-${pricing.discountValue}%` : `-Rs. ${pricing.discountAmount}`}
            </span>
          )}
          {product.stockQuantity !== undefined && product.stockQuantity <= 0 && (
            <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-md">
              OUT OF STOCK
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
          <button
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              toggleWishlist(product.id);
            }}
            className={`flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all ${
              isWishlisted
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-white/80 text-[#1a1917] hover:bg-white"
            }`}
          >
            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-white" : ""}`} />
          </button>

          <button
            onClick={handleQuickViewClick}
            className="h-8.5 w-8.5 cursor-pointer rounded-full bg-white/80 text-[#1a1917] shadow-md backdrop-blur-sm opacity-0 translate-x-2 transition-all duration-300 hover:bg-white hover:text-primary group-hover:translate-x-0 group-hover:opacity-100"
            title="Quick View"
          >
            <Eye className="mx-auto h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-grow flex-col justify-between p-3 sm:p-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none tracking-widest text-primary">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary text-primary" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#1a1917]">{product.rating}</span>
              <span className="text-[8px] sm:text-[9px] font-semibold text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          <Link href={`/shop/${product.slug || product.id}`}>
            <h3 className="mb-2 line-clamp-1 text-left text-[12px] sm:text-sm font-bold text-foreground transition-colors hover:text-primary md:text-base">
              {product.name}
            </h3>
          </Link>

          <div className="mb-4 flex items-center flex-wrap gap-1.5 sm:gap-2">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-[13px] sm:text-base font-black text-foreground md:text-lg">
                Rs. {pricing.finalPrice.toLocaleString()}
              </span>
              {pricing.hasDiscount && (
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground line-through">
                  Rs. {pricing.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {pricing.hasDiscount && (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                {pricing.discountType === 'percentage' ? `${pricing.discountValue}% OFF` : `Rs. ${pricing.discountAmount} OFF`}
              </span>
            )}
          </div>

          <div className="space-y-2.5 border-t border-black/[0.04] pt-3 pb-4 text-left">            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-black/50 uppercase tracking-wider">
                  Available Sizes
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelectedSize(size);
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all border ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "bg-white text-black/70 border-black/10 hover:border-black/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleBuyNow}
            disabled={isAdding || isSuccess || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
            className={`flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              product.stockQuantity !== undefined && product.stockQuantity <= 0
                ? "bg-black/10 text-muted-foreground cursor-not-allowed"
                : isSuccess
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-[#1a1917] to-zinc-700 text-white hover:from-black hover:to-zinc-800 hover:shadow-lg hover:shadow-black/20"
            }`}
          >
            {product.stockQuantity !== undefined && product.stockQuantity <= 0 ? (
              <span>Out of Stock</span>
            ) : isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <span>Buy Now</span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAddToCart(e);
            }}
            disabled={isAdding || isSuccess || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
            className={`flex h-[32px] w-[32px] sm:h-[38px] sm:w-[38px] flex-shrink-0 cursor-pointer items-center justify-center rounded-xl text-white transition-all duration-300 ${
              product.stockQuantity !== undefined && product.stockQuantity <= 0
                ? "bg-black/20 cursor-not-allowed"
                : "bg-[#1a1917] hover:bg-black/80 hover:shadow-md"
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
