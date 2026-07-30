"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppContext";
import { Product } from "@/data/products";
import { 
  Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Check, Loader2, Eye 
} from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes[0] || null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isSuccess) return;

    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsSuccess(true);
      addToCart(product, 1, selectedColor, selectedSize || undefined);
      setTimeout(() => setIsSuccess(false), 2000);
    }, 600);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setQuickViewProduct(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col w-full bg-[#faf9f6] border border-black/5 hover:border-primary/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
    >
      {/* Image/Slider Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#efece6] w-full" data-cursor="view">
        <Link href={`/shop?product=${product.id}`} className="block w-full h-full">
          <motion.img
            key={currentImageIndex}
            src={product.images[currentImageIndex]}
            alt={`${product.name} - View ${currentImageIndex + 1}`}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        {/* Carousel Arrow Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={prevImage}
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-foreground backdrop-blur-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-foreground backdrop-blur-sm shadow-sm flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Carousel Dot Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {product.images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCurrentImageIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                index === currentImageIndex ? "bg-primary w-4.5" : "bg-primary/30"
              }`}
            />
          ))}
        </div>

        {/* Floating Action Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-primary text-white px-2.5 py-1 rounded-full shadow-md">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-full shadow-md">
              BEST SELLER
            </span>
          )}
          {product.discount && product.discount > 0 && (
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-rose-500 text-white px-2.5 py-1 rounded-full shadow-md">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className={`h-8.5 w-8.5 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center transition-all cursor-pointer ${
              isWishlisted 
                ? "bg-rose-500 text-white hover:bg-rose-600" 
                : "bg-white/80 hover:bg-white text-[#1a1917]"
            }`}
          >
            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-white" : ""}`} />
          </button>

          <button
            onClick={handleQuickViewClick}
            className="h-8.5 w-8.5 rounded-full bg-white/80 hover:bg-white text-[#1a1917] hover:text-primary backdrop-blur-sm shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 cursor-pointer duration-300"
            title="Quick View"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand & Star Rating Row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-[10px] font-bold text-[#1a1917]">
                {product.rating}
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Title with link */}
          <Link href={`/shop?product=${product.id}`}>
            <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-1 hover:text-primary transition-colors mb-2 text-left">
              {product.name}
            </h3>
          </Link>

          {/* Price Layout */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-base md:text-lg font-black text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through font-semibold">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Customizable Swatches */}
          <div className="space-y-2.5 pb-4 border-t border-black/[0.04] pt-3 text-left">
            {product.colors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider min-w-[32px]">
                  Finish:
                </span>
                <div className="flex gap-1.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-4.5 h-4.5 rounded-full border transition-all cursor-pointer ${
                        selectedColor === color
                          ? "ring-1.5 ring-primary ring-offset-1 border-primary/20 scale-110"
                          : "border-black/10 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider min-w-[32px]">
                  Spec:
                </span>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-primary text-white"
                          : "bg-black/5 hover:bg-black/10 text-black/70"
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

        {/* Add To Cart Trigger */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isSuccess}
          className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
            isSuccess
              ? "bg-emerald-600 text-white"
              : "bg-[#1a1917] hover:bg-primary hover:shadow-lg hover:shadow-primary/20 text-white"
          }`}
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Configuring...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// Wrapper Link to prevent overlapping clicks inside card
import Link from "next/link";
