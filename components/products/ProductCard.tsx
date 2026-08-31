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
      if (addTimerRef.current !== null) window.clearTimeout(addTimerRef.current);
      if (successTimerRef.current !== null) window.clearTimeout(successTimerRef.current);
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
    if (isSuccess || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) return;

    if (addTimerRef.current !== null) window.clearTimeout(addTimerRef.current);
    if (successTimerRef.current !== null) window.clearTimeout(successTimerRef.current);

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
      onClick={handleCardClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
    >
      {/* Image Gallery */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-gray-50">
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
              className="h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </Link>

        {/* Carousel Controls */}
        {product.images.length > 1 && (
          <div className="absolute inset-0 z-10 flex items-center justify-between px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={prevImage}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-black transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          {product.isNew && (
            <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="rounded bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Best Seller
            </span>
          )}
          {pricing.hasDiscount && (
            <span className="rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
              {pricing.discountType === 'percentage' ? `-${pricing.discountValue}%` : `-Rs. ${pricing.discountAmount}`}
            </span>
          )}
          {product.stockQuantity !== undefined && product.stockQuantity <= 0 && (
            <span className="rounded bg-gray-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions (Top Right) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:translate-x-4 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              toggleWishlist(product.id);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all ${
              isWishlisted
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
            }`}
            title="Wishlist"
          >
            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleQuickViewClick}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md backdrop-blur-sm hover:bg-white hover:text-primary transition-all"
            title="Quick View"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-grow flex-col justify-between p-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 tracking-wide uppercase line-clamp-1 pr-2">
              {product.category || product.brand}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            </div>
          </div>

          <Link href={`/shop/${product.slug || product.id}`}>
            <h3 className="mb-2 line-clamp-2 min-h-[40px] text-sm font-medium text-gray-900 transition-colors hover:text-primary leading-tight">
              {product.name}
            </h3>
          </Link>

          <div className="mb-4 flex items-end gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900 leading-none">
              Rs. {pricing.finalPrice.toLocaleString()}
            </span>
            {pricing.hasDiscount && (
              <span className="text-sm text-gray-400 line-through leading-none mb-[1px]">
                Rs. {pricing.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAddToCart(e);
            }}
            disabled={isAdding || isSuccess || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/20 py-2 text-xs font-bold transition-colors ${
              product.stockQuantity !== undefined && product.stockQuantity <= 0
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : isSuccess
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-primary/5 text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isSuccess ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            {isSuccess ? "Added" : "Cart"}
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={product.stockQuantity !== undefined && product.stockQuantity <= 0}
            className={`flex flex-1 items-center justify-center rounded-lg py-2 text-xs font-bold transition-colors ${
              product.stockQuantity !== undefined && product.stockQuantity <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed hidden sm:flex"
                : "bg-primary text-white hover:bg-primary/90 shadow-sm"
            }`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
