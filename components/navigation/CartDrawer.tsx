"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import {
  useCartActions,
  useCartState,
  useOverlayActions,
  useOverlayState,
} from "@/context/AppContext";

export function CartDrawer() {
  const { cart, cartCount, cartSubtotal } = useCartState();
  const { updateCartQuantity, removeFromCart, clearCart } = useCartActions();
  const { cartOpen } = useOverlayState();
  const { setCartOpen } = useOverlayActions();

  useEffect(() => {
    if (!cartOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.__lenis?.start?.();
    };
  }, [cartOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            key="backdrop"
            id="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 cursor-pointer bg-black/30 backdrop-blur-sm"
          />

          <motion.div
            data-lenis-prevent
            key="drawer"
            id="cart-drawer-container"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-black/5 bg-[#faf9f6] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/5 p-6">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Your Order</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {cartCount}
                </span>
              </div>
              <button
                id="close-cart-btn"
                onClick={() => setCartOpen(false)}
                className="cursor-pointer rounded-full p-2 text-[#1a1917] transition-all hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-grow space-y-4 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary/40">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">Cart is Empty</h4>
                    <p className="mt-1.5 max-w-[240px] text-sm text-muted-foreground">
                      Explore our premium hardware collections to start building.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={() => setCartOpen(false)}
                    className="mt-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary/95 cursor-pointer"
                  >
                    Browse Shop All
                  </Link>
                </div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex gap-4 rounded-2xl border border-transparent bg-black/5 p-3 transition-all duration-300 hover:border-black/5 hover:bg-white"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#efece6]">
                      <Image
                        src={item.product.images?.[0] || "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
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
                            className="cursor-pointer rounded-full p-1 text-muted-foreground transition-all hover:bg-destructive/5 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {item.product.brand}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black/70">
                            Finish:
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                          </span>
                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black/70">
                            Size: {item.selectedSize}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-lg border border-black/10 bg-white/50 backdrop-blur-sm">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="cursor-pointer p-1.5 transition-all hover:bg-black/5"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[20px] px-2.5 text-center text-xs font-bold select-none">
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
                            className="cursor-pointer p-1.5 transition-all hover:bg-black/5"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 border-t border-black/5 bg-black/[0.02] p-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">
                      Rs. {cartSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">Free Delivery</span>
                  </div>
                  <div className="my-2 h-[1px] bg-black/5" />
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Estimated Total</span>
                    <span>Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      const text = "Hello Jinnah Hardware, I would like to place an order for:\n\n" + 
                        cart.map(item => `- ${item.quantity}x ${item.product.name} (Finish: ${item.selectedColor}, Size: ${item.selectedSize}) - Rs. ${(item.product.price * item.quantity).toLocaleString()}`).join("\n") +
                        `\n\nEstimated Total: Rs. ${cartSubtotal.toLocaleString()}`;
                      window.open(`https://wa.me/923000421772?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/95 hover:shadow-primary/25"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => clearCart()}
                    className="cursor-pointer rounded-full border border-black/10 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#1a1917] transition-all hover:border-black/25 hover:bg-black/5"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="cursor-pointer rounded-full border border-black/10 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#1a1917] transition-all hover:border-black/25 hover:bg-black/5"
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
