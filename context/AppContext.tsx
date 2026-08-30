"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product } from "@/data/products";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Discount, calculateProductPrice } from "@/lib/discount-engine";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

interface CartStateContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDiscountTotal: number;
  cartFinalTotal: number;
  discounts: Discount[];
}

interface CartActionsContextType {
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateCartQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

interface WishlistStateContextType {
  wishlist: string[];
  wishlistCount: number;
}

interface WishlistActionsContextType {
  toggleWishlist: (productId: string) => void;
}

interface OverlayStateContextType {
  cartOpen: boolean;
  searchOpen: boolean;
  quickViewProduct: Product | null;
  ticker: { enabled: boolean; text: string; link: string };
}

interface OverlayActionsContextType {
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
}

interface AppContextType
  extends CartStateContextType,
    CartActionsContextType,
    WishlistStateContextType,
    WishlistActionsContextType,
    OverlayStateContextType,
    OverlayActionsContextType {}

const CartStateContext = createContext<CartStateContextType | undefined>(undefined);
const CartActionsContext = createContext<CartActionsContextType | undefined>(undefined);
const WishlistStateContext = createContext<WishlistStateContextType | undefined>(undefined);
const WishlistActionsContext = createContext<WishlistActionsContextType | undefined>(undefined);
const OverlayStateContext = createContext<OverlayStateContextType | undefined>(undefined);
const OverlayActionsContext = createContext<OverlayActionsContextType | undefined>(undefined);

const CART_STORAGE_KEY = "jinnah_cart";
const WISHLIST_STORAGE_KEY = "jinnah_wishlist";

function useRequiredContext<T>(context: React.Context<T | undefined>, name: string) {
  const value = useContext(context);

  if (!value) {
    throw new Error(`${name} must be used within an AppProvider`);
  }

  return value;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpenState] = useState(false);
  const [searchOpen, setSearchOpenState] = useState(false);
  const [quickViewProduct, setQuickViewProductState] = useState<Product | null>(null);
  const [ticker, setTicker] = useState({ enabled: false, text: "", link: "" });
  const [storageReady, setStorageReady] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  useEffect(() => {
    async function fetchDiscounts() {
      try {
        const q = query(collection(db, "discounts"), where("isActive", "==", true));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discount));
        setDiscounts(data);
      } catch (err) {
        console.error("Error fetching discounts:", err);
      }
    }
    fetchDiscounts();

    import("firebase/firestore").then(({ doc, onSnapshot }) => {
      const unsub = onSnapshot(doc(db, "settings", "global"), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setTicker({
            enabled: !!data.tickerEnabled,
            text: data.tickerText || "",
            link: data.tickerLink || "",
          });
        }
      });
      return () => unsub();
    });
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Error loading local storage state:", error);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to local storage:", error);
    }
  }, [cart, storageReady]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error("Error saving wishlist to local storage:", error);
    }
  }, [wishlist, storageReady]);

  const setCartOpen = useCallback((open: boolean) => {
    setCartOpenState(open);
  }, []);

  const setSearchOpen = useCallback((open: boolean) => {
    setSearchOpenState(open);
  }, []);

  const setQuickViewProduct = useCallback((product: Product | null) => {
    setQuickViewProductState(product);
  }, []);

  const removeFromCart = useCallback((productId: string, color: string, size: string) => {
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
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, color: string, size: string, quantity: number) => {
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
    },
    [removeFromCart]
  );

  const addToCart = useCallback(
    (product: Product, quantity = 1, color?: string, size?: string) => {
      const finalColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : "Default");
      const finalSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard");

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.selectedColor === finalColor &&
            item.selectedSize === finalSize
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        return [...prev, { product, quantity, selectedColor: finalColor, selectedSize: finalSize }];
      });

      setCartOpen(true);
    },
    [setCartOpen]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const cartDiscountTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const pricing = calculateProductPrice(item.product.price, item.product.id, discounts);
      return sum + (pricing.discountAmount * item.quantity);
    }, 0);
  }, [cart, discounts]);

  const cartFinalTotal = useMemo(() => {
    return cartSubtotal - cartDiscountTotal;
  }, [cartSubtotal, cartDiscountTotal]);

  const cartStateValue = useMemo(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      cartDiscountTotal,
      cartFinalTotal,
      discounts,
    }),
    [cart, cartCount, cartSubtotal, cartDiscountTotal, cartFinalTotal, discounts]
  );

  const cartActionsValue = useMemo(
    () => ({
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
    }),
    [addToCart, removeFromCart, updateCartQuantity, clearCart]
  );

  const wishlistStateValue = useMemo(
    () => ({
      wishlist,
      wishlistCount: wishlist.length,
    }),
    [wishlist]
  );

  const wishlistActionsValue = useMemo(
    () => ({
      toggleWishlist,
    }),
    [toggleWishlist]
  );

  const overlayStateValue = useMemo(
    () => ({
      cartOpen,
      searchOpen,
      quickViewProduct,
      ticker,
    }),
    [cartOpen, searchOpen, quickViewProduct, ticker]
  );

  const overlayActionsValue = useMemo(
    () => ({
      setCartOpen,
      setSearchOpen,
      setQuickViewProduct,
    }),
    [setCartOpen, setSearchOpen, setQuickViewProduct]
  );

  return (
    <CartStateContext.Provider value={cartStateValue}>
      <CartActionsContext.Provider value={cartActionsValue}>
        <WishlistStateContext.Provider value={wishlistStateValue}>
          <WishlistActionsContext.Provider value={wishlistActionsValue}>
            <OverlayStateContext.Provider value={overlayStateValue}>
              <OverlayActionsContext.Provider value={overlayActionsValue}>
                {children}
              </OverlayActionsContext.Provider>
            </OverlayStateContext.Provider>
          </WishlistActionsContext.Provider>
        </WishlistStateContext.Provider>
      </CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
}

export function useCartState() {
  return useRequiredContext(CartStateContext, "useCartState");
}

export function useCartActions() {
  return useRequiredContext(CartActionsContext, "useCartActions");
}

export function useWishlistState() {
  return useRequiredContext(WishlistStateContext, "useWishlistState");
}

export function useWishlistActions() {
  return useRequiredContext(WishlistActionsContext, "useWishlistActions");
}

export function useOverlayState() {
  return useRequiredContext(OverlayStateContext, "useOverlayState");
}

export function useOverlayActions() {
  return useRequiredContext(OverlayActionsContext, "useOverlayActions");
}

export function useApp(): AppContextType {
  return {
    ...useCartState(),
    ...useCartActions(),
    ...useWishlistState(),
    ...useWishlistActions(),
    ...useOverlayState(),
    ...useOverlayActions(),
  };
}
