"use client";

import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    clearCart,
  } = useApp();

  // Prevent scroll background
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [cartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            id="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm cursor-pointer"
          />

          {/* Side Drawer */}
          <motion.div
            key="drawer"
            id="cart-drawer-container"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#faf9f6] shadow-2xl border-l border-black/5 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Your Order</h3>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button
                id="close-cart-btn"
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-[#1a1917] transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary/40">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base">Cart is Empty</h4>
                    <p className="text-muted-foreground text-sm max-w-[240px] mt-1.5">
                      Explore our premium hardware collections to start building.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                    }}
                    className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all shadow-md uppercase tracking-wider cursor-pointer"
                  >
                    Browse Shop All
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-4 p-3 rounded-2xl bg-black/5 hover:bg-white border border-transparent hover:border-black/5 transition-all duration-300 group"
                  >
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-[#efece6] flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() =>
                              removeFromCart(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize
                              )
                            }
                            className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/5 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
                          {item.product.brand}
                        </p>
                        {/* Selected Options */}
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-black/5 font-medium text-black/70">
                            Finish:{" "}
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 font-medium text-black/70">
                            Size: {item.selectedSize}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-black/10 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="p-1.5 hover:bg-black/5 transition-all cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold min-w-[20px] text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            className="p-1.5 hover:bg-black/5 transition-all cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-black/5 bg-black/[0.02] space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">Free Delivery</span>
                  </div>
                  <div className="h-[1px] bg-black/5 my-2" />
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Estimated Total</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (confirm("Proceed to checkout? (This is a frontend demo checkout)")) {
                        clearCart();
                        setCartOpen(false);
                        alert("Thank you! Your mock order has been placed successfully.");
                      }
                    }}
                    className="col-span-2 py-3 px-4 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25 transition-all cursor-pointer"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => clearCart()}
                    className="py-2.5 px-4 rounded-full border border-black/10 hover:border-black/25 text-[#1a1917] hover:bg-black/5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="py-2.5 px-4 rounded-full border border-black/10 hover:border-black/25 text-[#1a1917] hover:bg-black/5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
