"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ShoppingCart,
  Heart,
  X,
  Check,
  Loader2,
  Plus,
  Minus,
  MessageCircle,
  Zap,
  Star,
} from "lucide-react";
import {
  useCartActions,
  useOverlayActions,
  useOverlayState,
  useWishlistActions,
  useWishlistState,
} from "@/context/AppContext";

export function QuickViewModal() {
  const { quickViewProduct } = useOverlayState();
  const { setQuickViewProduct } = useOverlayActions();
  const { addToCart } = useCartActions();
  const { wishlist } = useWishlistState();
  const { toggleWishlist } = useWishlistActions();
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const addTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!quickViewProduct) {
      setActiveImage("");
      setSelectedColor("");
      setSelectedSize("");
      setIsAdding(false);
      setIsSuccess(false);
      return;
    }

    setActiveImage(quickViewProduct.images[0] || "");
    setSelectedColor(quickViewProduct.colors[0] || "");
    setSelectedSize(quickViewProduct.sizes[0] || "");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuickViewProduct(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.__lenis?.start?.();
    };
  }, [quickViewProduct, setQuickViewProduct]);

  useEffect(() => {
    return () => {
      if (addTimerRef.current !== null) {
        window.clearTimeout(addTimerRef.current);
      }

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const isWishlisted = quickViewProduct ? wishlist.includes(quickViewProduct.id) : false;

  const handleBuyNow = () => {
    if (!quickViewProduct) return;
    const text = `Hi, I want to order this product:\n\n*Product:* ${quickViewProduct.name}\n*Price:* $${quickViewProduct.price.toFixed(2)}\n${selectedColor ? `*Color:* ${selectedColor}\n` : ''}${selectedSize ? `*Size:* ${selectedSize}\n` : ''}\nIs it available?`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/923000421772?text=${encodedText}`, '_blank');
  };

  const handleAddToCart = () => {
    if (!quickViewProduct || isSuccess) {
      return;
    }

    if (addTimerRef.current !== null) {
      window.clearTimeout(addTimerRef.current);
    }

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    setIsAdding(true);
    addTimerRef.current = window.setTimeout(() => {
      setIsAdding(false);
      setIsSuccess(true);
      addToCart(quickViewProduct, 1, selectedColor, selectedSize);

      closeTimerRef.current = window.setTimeout(() => {
        setIsSuccess(false);
        setQuickViewProduct(null);
      }, 1000);
    }, 600);
  };

  return (
    <AnimatePresence>
      {quickViewProduct && (
        <div key={quickViewProduct.id} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewProduct(null)}
            className="fixed inset-0 cursor-pointer bg-black/40 backdrop-blur-md"
          />

          <motion.div
            data-lenis-prevent
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-black/5 bg-[#faf9f6] shadow-2xl md:flex-row"
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-20 cursor-pointer rounded-full bg-[#1a1917]/5 p-2 transition-all hover:bg-[#1a1917]/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex w-full flex-col justify-between gap-4 bg-[#efece6] p-6 md:w-1/2 md:p-8">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/40 shadow-sm">
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={quickViewProduct.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {quickViewProduct.images.map((image) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(image)}
                    className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white/40 transition-all cursor-pointer ${
                      activeImage === image ? "scale-105 border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt="Thumbnail"
                      fill
                      sizes="56px"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col justify-between overflow-y-auto p-6 md:w-1/2 md:p-8">
              <div className="space-y-5 text-left">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    {quickViewProduct.brand}
                  </span>
                  <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                    {quickViewProduct.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex items-center">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="ml-1 text-xs font-extrabold text-[#1a1917]">
                        {quickViewProduct.rating}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      ({quickViewProduct.reviewCount} user evaluations)
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-[#1a1917]">
                    Rs. {quickViewProduct.price.toLocaleString()}
                  </span>
                  {quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="text-sm font-semibold text-muted-foreground line-through">
                      Rs. {quickViewProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium leading-relaxed text-muted-foreground md:text-sm">
                  {quickViewProduct.description}
                </p>

                <div className="space-y-2 rounded-2xl border border-black/5 bg-black/[0.02] p-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {Object.entries(quickViewProduct.specifications)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b border-black/[0.03] py-1"
                        >
                          <span className="font-semibold text-muted-foreground">{key}:</span>
                          <span
                            className="max-w-[120px] truncate font-extrabold text-foreground"
                            title={value}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                  {quickViewProduct.colors.length > 0 && (
                    <div className="space-y-1.5 text-left">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Select Finish
                      </span>
                      <div className="flex gap-2">
                        {quickViewProduct.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`h-6 w-6 cursor-pointer rounded-full border transition-all ${
                              selectedColor === color
                                ? "scale-110 border-primary/20 ring-2 ring-primary ring-offset-2"
                                : "border-black/10 hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {quickViewProduct.sizes.length > 0 && (
                    <div className="flex-grow space-y-1.5 text-left">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Select Size/Backset
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quickViewProduct.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                              selectedSize === size
                                ? "bg-[#1a1917] text-white"
                                : "bg-black/5 text-black/70 hover:bg-black/10"
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

              <div className="mt-8 flex items-center gap-3 border-t border-black/5 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isSuccess}
                  className={`flex flex-grow cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 px-6 text-xs font-bold uppercase tracking-widest shadow-md transition-all duration-300 ${
                    isSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-white hover:bg-primary/95 hover:shadow-primary/25"
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
                  onClick={handleBuyNow}
                  className="flex flex-grow cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 px-6 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-[#20b858] hover:shadow-[#25D366]/25"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`cursor-pointer rounded-full border p-3.5 transition-all ${
                    isWishlisted
                      ? "border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                      : "border-black/10 text-foreground hover:border-black/20 hover:bg-black/5"
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rose-500" : ""}`} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
