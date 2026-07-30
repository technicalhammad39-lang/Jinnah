"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, PRODUCTS } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  quickViewProduct: Product | null;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateCartQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  clearCart: () => void;
  cartSubtotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("jinnah_cart");
      const savedWishlist = localStorage.getItem("jinnah_wishlist");
      setTimeout(() => {
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      }, 0);
    } catch (e) {
      console.error("Error loading local storage state:", e);
    }
  }, []);

  // Save to local storage on state changes
  useEffect(() => {
    try {
      localStorage.setItem("jinnah_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart to local storage:", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("jinnah_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Error saving wishlist to local storage:", e);
    }
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    const finalColor = color || product.colors[0] || "Default";
    const finalSize = size || product.sizes[0] || "Standard";

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === finalColor &&
          item.selectedSize === finalSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { product, quantity, selectedColor: finalColor, selectedSize: finalSize }];
    });
    
    // Automatically trigger cart open as high-quality feedback
    setCartOpen(true);
  };

  const removeFromCart = (productId: string, color: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedColor === color &&
            item.selectedSize === size
          )
      )
    );
  };

  const updateCartQuantity = (productId: string, color: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.selectedColor === color &&
        item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        cartOpen,
        searchOpen,
        quickViewProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        setCartOpen,
        setSearchOpen,
        setQuickViewProduct,
        clearCart,
        cartSubtotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
