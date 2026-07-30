"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, Star, Check, Loader2, Heart, Shield, Award } from "lucide-react";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, wishlist, toggleWishlist } = useApp();
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      // Small delay to allow enter animation to start smoothly
      setTimeout(() => {
        setActiveImage(quickViewProduct.images[0] || "");
        setSelectedColor(quickViewProduct.colors[0] || "");
        setSelectedSize(quickViewProduct.sizes[0] || "");
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isWishlisted = wishlist.includes(quickViewProduct.id);

  const handleAddToCart = () => {
    if (isSuccess) return;
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsSuccess(true);
      addToCart(quickViewProduct, 1, selectedColor, selectedSize);
      setTimeout(() => {
        setIsSuccess(false);
        setQuickViewProduct(null); // Close modal on success
      }, 1000);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div key="modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-4xl bg-[#faf9f6] rounded-[32px] overflow-hidden shadow-2xl border border-black/5 z-10 max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#1a1917]/5 hover:bg-[#1a1917]/10 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left: Gallery */}
          <div className="w-full md:w-1/2 p-6 md:p-8 bg-[#efece6] flex flex-col justify-between gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/40 shadow-sm flex items-center justify-center">
              {activeImage ? (
                <img src={activeImage} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              ) : null}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {quickViewProduct.images.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-14 w-14 rounded-xl overflow-hidden bg-white/40 border-2 flex-shrink-0 transition-all cursor-pointer ${
                    activeImage === img ? "border-primary scale-105" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Content details */}
          <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5 text-left">
              <div>
                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase">
                  {quickViewProduct.brand}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight mt-1 leading-tight">
                  {quickViewProduct.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="ml-1 text-xs font-extrabold text-[#1a1917]">{quickViewProduct.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    ({quickViewProduct.reviewCount} user evaluations)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-[#1a1917]">
                  ${quickViewProduct.price.toFixed(2)}
                </span>
                {quickViewProduct.originalPrice > quickViewProduct.price && (
                  <span className="text-sm text-muted-foreground line-through font-semibold">
                    ${quickViewProduct.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                {quickViewProduct.description}
              </p>

              {/* Specifications mini grid */}
              <div className="bg-black/[0.02] rounded-2xl p-4 border border-black/5 space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Key Specifications
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {Object.entries(quickViewProduct.specifications).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-black/[0.03]">
                      <span className="text-muted-foreground font-semibold">{key}:</span>
                      <span className="text-foreground font-extrabold truncate max-w-[120px]" title={value}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configurable Swatches */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {quickViewProduct.colors.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                      Select Finish
                    </span>
                    <div className="flex gap-2">
                      {quickViewProduct.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                            selectedColor === color
                              ? "ring-2 ring-primary ring-offset-2 border-primary/20 scale-110"
                              : "border-black/10 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {quickViewProduct.sizes.length > 0 && (
                  <div className="space-y-1.5 text-left flex-grow">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                      Select Size/Backset
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickViewProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            selectedSize === size
                              ? "bg-[#1a1917] text-white"
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

            {/* Quick Actions Footer */}
            <div className="flex items-center gap-3 mt-8 pt-4 border-t border-black/5">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isSuccess}
                className={`flex-grow py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
                  isSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-primary hover:bg-primary/95 text-white hover:shadow-primary/25"
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
                    <ShoppingCart className="h-4.5 w-4.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20"
                    : "border-black/10 hover:border-black/20 text-foreground hover:bg-black/5"
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
