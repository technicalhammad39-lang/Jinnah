"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import ConfettiCelebration from "@/components/animations/ConfettiCelebration";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import {
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
  Package,
  Clock,
  Printer,
  MessageCircle,
  Copy,
  Check,
  MapPin,
  ArrowRight,
  ChevronRight,
  Loader2,
  Edit3,
  CreditCard,
  Banknote,
  Building2,
  Lock,
  Phone,
  User as UserIcon,
  Mail,
  Home,
  Navigation,
  FileText,
  BadgeCheck,
  Percent,
  CheckCircle,
  Info,
  QrCode
} from "lucide-react";
import { useCartState, useCartActions, useOverlayActions } from "@/context/AppContext";
import { useAuth } from "@/lib/auth-context";
import { getPublicUploadUrl } from "@/lib/utils";
import { getPaymentMethods } from "@/lib/data-fetcher";
import { toast } from "sonner";
import { calculateProductPrice } from "@/lib/discount-engine";
import { getStockInfo } from "@/lib/inventory-engine";

interface CustomerFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  notes: string;
}

const STORAGE_CUSTOMER_KEY = "jh_checkout_customer";

export default function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartDiscountTotal,
    cartFinalTotal,
    discounts,
    shippingSettings,
    shippingResult
  } = useCartState();
  const { clearCart } = useCartActions();
  const { setCartOpen } = useOverlayActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [placedOrderSummary, setPlacedOrderSummary] = useState<any>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    area: "",
    postalCode: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);

  // 1. Fetch Dynamic Payment Methods from Admin
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPaymentMethods(true);
    getPaymentMethods()
      .then((methods) => {
        if (!isMounted) return;
        if (methods && methods.length > 0) {
          setAvailablePaymentMethods(methods);
          setPaymentMethod(methods[0].id);
        } else {
          // Fallback if none configured
          const defaults = [
            {
              id: "cod",
              title: "Cash on Delivery (COD)",
              description: "Pay with cash when your package is delivered to your doorstep.",
              instructions: "Please keep exact change ready upon courier delivery."
            },
            {
              id: "bank",
              title: "Direct Bank Transfer",
              description: "Transfer directly to our official company bank account.",
              instructions: "Please share payment receipt on WhatsApp with your Order ID."
            },
          ];
          setAvailablePaymentMethods(defaults);
          setPaymentMethod("cod");
        }
      })
      .catch((err) => {
        console.error("Error fetching payment methods:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPaymentMethods(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Pre-fill customer information from Auth or localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOMER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || parsed.fullName || "",
          phone: prev.phone || parsed.phone || "",
          email: prev.email || parsed.email || "",
          address: prev.address || parsed.address || "",
          city: prev.city || parsed.city || "",
          area: prev.area || parsed.area || "",
          postalCode: prev.postalCode || parsed.postalCode || "",
        }));
      }
    } catch (e) {
      console.warn("Could not load stored customer data", e);
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phoneNumber || "",
      }));
    }
  }, [user]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CustomerFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Copy helper
  const handleCopyText = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    toast.success("Order & Tracking ID copied to clipboard!");
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  // Estimate delivery text dynamically
  const deliveryEstimate = useMemo(() => {
    for (const item of cart) {
      if (item.product?.deliveryEstimate) {
        return item.product.deliveryEstimate;
      }
    }
    return shippingSettings?.defaultDeliveryEstimate || "3-5 business days";
  }, [cart, shippingSettings]);

  // Selected Payment Method Object
  const selectedPaymentMethodObj = useMemo(() => {
    return availablePaymentMethods.find((m) => m.id === paymentMethod) || null;
  }, [availablePaymentMethods, paymentMethod]);

  // Comprehensive Form Validation
  const validateForm = () => {
    const errors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = "Please enter your complete name.";
    }

    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, "");
    if (!cleanPhone) {
      errors.phone = "Phone number is required.";
    } else if (cleanPhone.length < 10) {
      errors.phone = "Please enter a valid phone number (e.g. 0300 1234567).";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.address.trim()) {
      errors.address = "Delivery street address is required.";
    } else if (formData.address.trim().length < 6) {
      errors.address = "Please enter a complete delivery address.";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return false;
    }

    return true;
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // Pre-flight client-side inventory check
    for (const item of cart) {
      const stockInfo = getStockInfo(item.product, item.selectedColor, item.selectedSize);
      if (!stockInfo.isAvailable || stockInfo.stock <= 0) {
        toast.error(`"${item.product.name}" is currently out of stock. Please remove it from your cart to proceed.`);
        return;
      }
      if (item.quantity > stockInfo.stock) {
        toast.error(`"${item.product.name}" only has ${stockInfo.stock} units in stock. Please adjust your cart.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Split full name into firstName and lastName for backward compatibility
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Combine address and area for complete shipping destination
      const fullShippingAddress = formData.area.trim()
        ? `${formData.address.trim()}, ${formData.area.trim()}`
        : formData.address.trim();

      const customerPayload = {
        fullName: formData.fullName.trim(),
        firstName,
        lastName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: fullShippingAddress,
        city: formData.city.trim(),
        area: formData.area.trim(),
        postalCode: formData.postalCode.trim(),
        notes: formData.notes.trim(),
      };

      const orderPayload = {
        customerInfo: customerPayload,
        customerType: user ? "account" : "guest",
        paymentMethod,
        items: cart,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.outOfStock) {
          throw new Error(data.error || "Some items in your cart are no longer available in the requested quantity.");
        }
        throw new Error(data.error || "Unable to place your order right now. Please try again.");
      }

      // Save customer info for future visits
      try {
        localStorage.setItem(
          STORAGE_CUSTOMER_KEY,
          JSON.stringify({
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            area: formData.area,
            postalCode: formData.postalCode,
          })
        );
      } catch (e) {
        // Non-fatal
      }

      // Record placed order summary for success screen
      setPlacedOrderSummary({
        id: data.orderId,
        customerInfo: customerPayload,
        paymentMethodTitle: selectedPaymentMethodObj?.title || paymentMethod,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: cartDiscountTotal,
        shipping: shippingResult?.finalShippingFee ?? 0,
        appliedBenefit: shippingResult?.appliedBenefit ?? null,
        total: cartFinalTotal,
      });

      setOrderId(data.orderId);
      setOrderSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("[Checkout Client Error]:", error);
      toast.error(error.message || "Unable to complete order. Please verify your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // VIEW: ORDER SUCCESS CONFIRMATION
  // =========================================================================
  if (orderSuccess) {
    const customer = placedOrderSummary?.customerInfo || formData;
    const items = placedOrderSummary?.items || [];
    const total = placedOrderSummary?.total ?? cartFinalTotal;
    const subtotal = placedOrderSummary?.subtotal ?? cartSubtotal;
    const discount = placedOrderSummary?.discount ?? cartDiscountTotal;
    const shipping = placedOrderSummary?.shipping ?? (shippingResult?.finalShippingFee || 0);
    const paymentTitle = placedOrderSummary?.paymentMethodTitle || (selectedPaymentMethodObj?.title || paymentMethod);

    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#1a1917] flex flex-col justify-between">
        <Navbar />
        <ConfettiCelebration duration={5500} particleCount={140} />

        <main className="flex-grow pt-28 pb-24 md:pt-36">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Top Celebration Card */}
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 md:p-10 text-center shadow-lg shadow-black/5">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                {/* Animated Celebration Icon */}
                <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-40" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md">
                    <Sparkles className="h-3.5 w-3.5 fill-amber-950" />
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Order Placed Successfully
                </span>

                <h1 className="mt-4 mb-2 text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  Shukriya, {customer.firstName || customer.fullName || "Valued Customer"}!
                </h1>
                <p className="mx-auto max-w-xl text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Aapka order receive ho chuka hai. Humara warehouse staff order verify kar raha hai aur TCS / PostEx courier dispatch process shuru kiya ja raha hai.
                </p>

                {/* Highlighted Order & Tracking ID Box */}
                <div className="mt-8 mx-auto max-w-xl rounded-2xl border-2 border-dashed border-primary/35 bg-primary/[0.04] p-5 md:p-6 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                        Official Order & Tracking ID
                      </p>
                      <p className="mt-1 font-mono text-xl md:text-2xl font-black text-foreground tracking-tight">
                        #{orderId}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Save this ID to check your live order & shipment status anytime.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyOrderId}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 bg-white px-3.5 py-2 text-xs font-bold text-foreground shadow-xs transition-all hover:bg-black/5 hover:border-black/25 active:scale-95 cursor-pointer"
                      >
                        {copiedOrderId ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-primary/15 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/track-order/${orderId}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/95 active:scale-98"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Track Order Live</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <a
                      href={`https://wa.me/923000421772?text=${encodeURIComponent(
                        `Salam Jinnah Hardware Store! Maine abhi website par order place kia hai. Mera Order ID hai: #${orderId}. Kindly confirm.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs md:text-sm font-bold text-emerald-900 transition-all hover:bg-emerald-100 active:scale-98"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <span>WhatsApp Support</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 3-Step Journey Timeline */}
              <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-xs">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-5">
                  Order Processing Milestones
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="relative rounded-2xl bg-[#faf9f6] p-4.5 border border-black/5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">1</span>
                      <h3 className="text-sm font-bold text-foreground">Order Verification</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Sales team verifies inventory stock and prepares genuine items for packing.
                    </p>
                  </div>

                  <div className="relative rounded-2xl bg-[#faf9f6] p-4.5 border border-black/5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
                      <h3 className="text-sm font-bold text-foreground">Warehouse Dispatch</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Secure shock-proof packing and handover to courier with consignment tracking.
                    </p>
                  </div>

                  <div className="relative rounded-2xl bg-[#faf9f6] p-4.5 border border-black/5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-foreground text-xs font-bold">3</span>
                      <h3 className="text-sm font-bold text-foreground">Doorstep Delivery</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Arrives within {deliveryEstimate}. Inspect parcel and complete payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Grid: Shipping & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Details */}
                <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
                    </h2>
                    <div className="space-y-1.5 text-xs md:text-sm">
                      <p className="font-bold text-foreground text-base">
                        {customer.fullName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim()}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">{customer.address}</p>
                      <p className="text-muted-foreground">
                        {customer.city} {customer.postalCode ? `• ${customer.postalCode}` : ""}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground pt-1.5">
                        Phone: <span className="text-foreground font-semibold">{customer.phone}</span>
                      </p>
                      {customer.email && (
                        <p className="text-xs text-muted-foreground">
                          Email: <span className="text-foreground font-semibold">{customer.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Payment Mode:</span>
                    <span className="font-bold text-foreground bg-black/5 px-2.5 py-1 rounded-lg">
                      {paymentTitle}
                    </span>
                  </div>
                </div>

                {/* Order Summary & Financials */}
                <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" /> Order Snapshot
                    </h2>

                    {items.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
                        {items.map((item: any, idx: number) => {
                          const p = item.product || item;
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs border-b border-black/5 pb-2">
                              <div className="truncate pr-3">
                                <p className="font-bold text-foreground truncate">{p.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ""} {item.selectedColor ? `• ${item.selectedColor}` : ""}
                                </p>
                              </div>
                              <span className="font-mono font-bold text-foreground shrink-0">
                                Rs. {((p.price || 0) * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Items stored in fulfillment order.</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-black/10 space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-foreground">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-rose-600 font-medium">
                        <span>Discount</span>
                        <span className="font-mono font-bold">-Rs. {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      {shipping === 0 ? (
                        <span className="font-bold text-emerald-600">Free Delivery</span>
                      ) : (
                        <span className="font-mono font-semibold text-foreground">Rs. {shipping.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm md:text-base font-black text-foreground pt-2 border-t border-black/5">
                      <span>Total Payable</span>
                      <span className="text-primary font-mono">Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={`/track-order/${orderId}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/95"
                >
                  <Truck className="h-4 w-4" />
                  <span>Go to Tracking Portal</span>
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-6 py-3 text-xs md:text-sm font-bold text-foreground shadow-xs transition-all hover:bg-black/5 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>

                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-6 py-3 text-xs md:text-sm font-bold text-foreground shadow-xs transition-all hover:bg-black/5"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================================================================
  // VIEW: EMPTY CART STATE
  // =========================================================================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#1a1917] flex flex-col justify-between">
        <Navbar />

        <main className="flex-grow pt-32 pb-24 md:pt-40 flex items-center justify-center">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-black/5 text-muted-foreground border border-black/5 shadow-xs">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Your Cart is Empty
            </h1>
            <p className="mb-8 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Looks like you haven&apos;t added any architectural hardware, smart locks, or tools to your cart yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/95 active:scale-98"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN CHECKOUT INTERFACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1917] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 md:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Checkout Header & Progress Indicator */}
          <div className="mb-8 md:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Checkout
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Complete your order details below. Fast nationwide delivery with inspection guarantee.
                </p>
              </div>

              {/* Progress Stepper (1. Cart -> 2. Checkout -> 3. Confirmation) */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[11px] font-bold text-foreground">
                    1
                  </span>
                  <span>Cart</span>
                </button>

                <ChevronRight className="h-3.5 w-3.5 text-black/30" />

                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">
                    2
                  </span>
                  <span>Checkout</span>
                </div>

                <ChevronRight className="h-3.5 w-3.5 text-black/30" />

                <div className="flex items-center gap-1.5 text-muted-foreground/60 font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5 text-[11px] text-muted-foreground">
                    3
                  </span>
                  <span>Confirmation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Order Summary 2-Column Grid */}
          <form onSubmit={handleSubmitOrder} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* LEFT / MAIN COLUMN (approx 65%) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6 md:space-y-8">
                {/* 1. CUSTOMER INFORMATION */}
                <section className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-black/5 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-foreground tracking-tight">
                        Customer Information
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        Your contact information for order confirmation and live delivery alerts.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                        <span>Full Name <span className="text-rose-500">*</span></span>
                        {formErrors.fullName && (
                          <span className="text-[11px] text-rose-500 normal-case font-medium">{formErrors.fullName}</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Muhammad Bilal"
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none transition-all ${
                            formErrors.fullName
                              ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400"
                              : "border-black/15 focus:border-primary focus:ring-1 focus:ring-primary"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                        <span>Phone Number <span className="text-rose-500">*</span></span>
                        {formErrors.phone && (
                          <span className="text-[11px] text-rose-500 normal-case font-medium">{formErrors.phone}</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0300 1234567"
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none transition-all ${
                            formErrors.phone
                              ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400"
                              : "border-black/15 focus:border-primary focus:ring-1 focus:ring-primary"
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Required for delivery agent coordination.</p>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                        <span>Email Address <span className="text-muted-foreground font-normal lowercase">(optional)</span></span>
                        {formErrors.email && (
                          <span className="text-[11px] text-rose-500 normal-case font-medium">{formErrors.email}</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@example.com"
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none transition-all ${
                            formErrors.email
                              ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400"
                              : "border-black/15 focus:border-primary focus:ring-1 focus:ring-primary"
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Receive invoice copy & dispatch tracking updates.</p>
                    </div>
                  </div>
                </section>

                {/* 2. DELIVERY ADDRESS */}
                <section className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-black/5 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-foreground tracking-tight">
                        Delivery Address
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        Where should we deliver your hardware products?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Street Address */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                        <span>Street Address / House No. <span className="text-rose-500">*</span></span>
                        {formErrors.address && (
                          <span className="text-[11px] text-rose-500 normal-case font-medium">{formErrors.address}</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="House # / Flat #, Street #, Sector / Phase"
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none transition-all ${
                          formErrors.address
                            ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400"
                            : "border-black/15 focus:border-primary focus:ring-1 focus:ring-primary"
                        }`}
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                        <span>City <span className="text-rose-500">*</span></span>
                        {formErrors.city && (
                          <span className="text-[11px] text-rose-500 normal-case font-medium">{formErrors.city}</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none transition-all ${
                          formErrors.city
                            ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400"
                            : "border-black/15 focus:border-primary focus:ring-1 focus:ring-primary"
                        }`}
                      />
                    </div>

                    {/* Area / Locality */}
                    <div className="space-y-1.5">
                      <label htmlFor="area" className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Area / Locality <span className="text-muted-foreground font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="e.g. DHA Phase 5, Gulberg, Model Town"
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1.5">
                      <label htmlFor="postalCode" className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Postal Code <span className="text-muted-foreground font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="54000"
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Order Notes */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Delivery Notes <span className="text-muted-foreground font-normal lowercase">(optional)</span>
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special instructions for the courier rider or landmark..."
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* 3. DELIVERY METHOD */}
                <section className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-black/5 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-foreground tracking-tight">
                        Delivery Method
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        Configured courier service and estimated transit schedule.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-2 border-primary/25 bg-primary/[0.03] p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-foreground">
                            Standard Courier Delivery
                          </h3>
                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-foreground">
                            TCS / PostEx
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Estimated Delivery: <strong className="text-foreground">{deliveryEstimate}</strong>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Fragile items packed with high-grade multi-layer shock absorption.
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      {shippingResult?.isFreeShipping || shippingResult?.finalShippingFee === 0 ? (
                        <span className="inline-block font-extrabold text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          FREE DELIVERY
                        </span>
                      ) : (
                        <span className="font-mono font-extrabold text-sm text-foreground">
                          Rs. {shippingResult?.finalShippingFee.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                {/* 4. PAYMENT METHOD */}
                <section className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-black/5 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-foreground tracking-tight">
                        Payment Method
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        Select your preferred payment method.
                      </p>
                    </div>
                  </div>

                  {isLoadingPaymentMethods ? (
                    <div className="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs">Loading available payment options...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availablePaymentMethods.map((method) => {
                        const isSelected = paymentMethod === method.id;
                        return (
                          <div
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`rounded-2xl border-2 transition-all p-4 cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/[0.02] shadow-xs"
                                : "border-black/10 hover:border-black/20 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="radio"
                                  id={`pm-${method.id}`}
                                  name="paymentMethod"
                                  value={method.id}
                                  checked={isSelected}
                                  onChange={() => setPaymentMethod(method.id)}
                                  className="h-4 w-4 text-primary accent-primary cursor-pointer shrink-0"
                                />

                                {method.logo && (
                                  <div className="relative h-8 w-10 shrink-0 bg-white rounded-lg border border-black/10 overflow-hidden flex items-center justify-center p-1">
                                    <Image
                                      src={method.logo.startsWith("http") ? method.logo : getPublicUploadUrl(method.logo)}
                                      alt={method.title}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <label
                                    htmlFor={`pm-${method.id}`}
                                    className="text-sm font-bold text-foreground cursor-pointer block truncate"
                                  >
                                    {method.title}
                                  </label>
                                  {method.description && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {method.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0">
                                {method.id === "cod" || method.title?.toLowerCase().includes("cash") ? (
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-black/5 px-2.5 py-1 rounded-md">
                                    <Banknote className="h-3.5 w-3.5" />
                                    <span>Cash</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-black/5 px-2.5 py-1 rounded-md">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>Transfer</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Collapsible Details & Instructions for Selected Method */}
                            {isSelected && (
                              <div className="mt-4 pt-3.5 border-t border-black/5 text-xs animate-in fade-in duration-200">
                                {/* If method is COD */}
                                {(method.id === "cod" || method.title?.toLowerCase().includes("cash")) ? (
                                  <div className="rounded-xl bg-[#faf9f6] p-3.5 border border-black/5 text-muted-foreground space-y-1">
                                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                      <span>Pay when your order is delivered</span>
                                    </p>
                                    <p className="text-[11px] leading-relaxed">
                                      You can inspect your package upon delivery and hand over the cash to the courier agent. Please keep the exact amount ready if possible.
                                    </p>
                                  </div>
                                ) : (
                                  /* Bank Transfer / Manual Details */
                                  <div className="space-y-3">
                                    {(method.bankName || method.accountTitle || method.accountNumber || method.iban) && (
                                      <div className="rounded-xl bg-[#faf9f6] p-3.5 border border-black/5 space-y-2">
                                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                                          Official Account Details
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                          {method.bankName && (
                                            <div>
                                              <span className="text-muted-foreground">Bank Name:</span>{" "}
                                              <strong className="text-foreground">{method.bankName}</strong>
                                            </div>
                                          )}
                                          {method.accountTitle && (
                                            <div>
                                              <span className="text-muted-foreground">Account Title:</span>{" "}
                                              <strong className="text-foreground">{method.accountTitle}</strong>
                                            </div>
                                          )}
                                          {method.accountNumber && (
                                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-black/10">
                                              <div>
                                                <span className="text-muted-foreground text-[11px]">Account #:</span>{" "}
                                                <span className="font-mono font-bold text-foreground">{method.accountNumber}</span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleCopyText(method.accountNumber, `acc-${method.id}`);
                                                }}
                                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                              >
                                                {copiedField === `acc-${method.id}` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                                <span>{copiedField === `acc-${method.id}` ? "Copied" : "Copy"}</span>
                                              </button>
                                            </div>
                                          )}
                                          {method.iban && (
                                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-black/10 sm:col-span-2">
                                              <div className="truncate pr-2">
                                                <span className="text-muted-foreground text-[11px]">IBAN:</span>{" "}
                                                <span className="font-mono font-bold text-foreground text-[11px] truncate">{method.iban}</span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleCopyText(method.iban, `iban-${method.id}`);
                                                }}
                                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                                              >
                                                {copiedField === `iban-${method.id}` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                                <span>{copiedField === `iban-${method.id}` ? "Copied" : "Copy"}</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* QR Code */}
                                    {method.qrCode && (
                                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-black/10">
                                        <div className="relative h-16 w-16 shrink-0 bg-white border border-black/10 rounded-lg overflow-hidden">
                                          <Image
                                            src={method.qrCode.startsWith("http") ? method.qrCode : getPublicUploadUrl(method.qrCode)}
                                            alt="Payment QR Code"
                                            fill
                                            className="object-contain p-1"
                                          />
                                        </div>
                                        <div className="text-xs">
                                          <p className="font-bold text-foreground">Scan QR Code to Pay</p>
                                          <p className="text-[11px] text-muted-foreground">
                                            Scan via your mobile banking app (Raast / Banking QR).
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Instructions */}
                                    {method.instructions && (
                                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-[#faf9f6] p-3 rounded-xl border border-black/5">
                                        <strong>Instructions:</strong> {method.instructions}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* 5. YOUR ORDER / CART DETAILS */}
                <section className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-foreground tracking-tight">
                          Your Order
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          {cartCount} {cartCount === 1 ? "item" : "items"} in cart
                        </p>
                      </div>
                    </div>

                    {/* Edit Cart Button */}
                    <button
                      type="button"
                      onClick={() => setCartOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Cart</span>
                    </button>
                  </div>

                  <div className="divide-y divide-black/5">
                    {cart.map((item, idx) => {
                      const pricing = calculateProductPrice(item.product.price, item.product.id, discounts);
                      const itemSubtotal = pricing.finalPrice * item.quantity;
                      const imageSrc = item.selectedImage || item.product.images?.[0];

                      return (
                        <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                          {/* Image */}
                          <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-xl bg-[#efece6] border border-black/5">
                            <Image
                              src={imageSrc ? getPublicUploadUrl(imageSrc) : "/placeholder.jpg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug break-words">
                              {item.product.name}
                            </h3>

                            {/* Variants Badges */}
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                              {item.selectedColor && (
                                <span className="bg-black/5 px-2 py-0.5 rounded-md font-medium">
                                  Color: <strong className="text-foreground">{item.selectedColor}</strong>
                                </span>
                              )}
                              {item.selectedSize && (
                                <span className="bg-black/5 px-2 py-0.5 rounded-md font-medium">
                                  Size: <strong className="text-foreground">{item.selectedSize}</strong>
                                </span>
                              )}
                              <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                                Qty: {item.quantity}
                              </span>
                            </div>

                            {/* Unit Price */}
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Unit Price: Rs. {pricing.finalPrice.toLocaleString()}
                              {pricing.hasDiscount && (
                                <span className="ml-1.5 line-through text-[10px] text-muted-foreground">
                                  Rs. {pricing.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right shrink-0">
                            <p className="font-mono text-xs sm:text-sm font-extrabold text-foreground">
                              Rs. {itemSubtotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN (approx 35%, Sticky on Desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 space-y-5">
                {/* Free Shipping / Threshold Promotion Hype Card */}
                {shippingSettings?.thresholdEnabled && shippingSettings.thresholdAmount > 0 && (
                  <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-amber-500/[0.03] p-4.5 shadow-xs">
                    {shippingResult?.thresholdReached ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                            Promotion Unlocked!
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {shippingSettings.benefitType === "free_shipping"
                              ? "You unlocked FREE SHIPPING!"
                              : "You unlocked your extra threshold discount!"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span>
                              {shippingSettings.benefitType === "free_shipping"
                                ? "Free Shipping Offer"
                                : "Special Offer"}
                            </span>
                          </span>
                          <span className="font-mono font-bold text-primary text-[11px]">
                            Rs. {cartSubtotal.toLocaleString()} / {shippingSettings.thresholdAmount.toLocaleString()}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, (cartSubtotal / shippingSettings.thresholdAmount) * 100))}%`,
                            }}
                          />
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Add <strong className="text-primary font-mono">Rs. {shippingResult?.thresholdRemaining.toLocaleString()}</strong> more to unlock {shippingSettings.benefitType === "free_shipping" ? "Free Delivery" : "extra discount"}.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Order Summary Card */}
                <div className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 sm:p-7 shadow-sm space-y-5">
                  <h2 className="text-base font-extrabold text-foreground tracking-tight border-b border-black/5 pb-3">
                    Order Summary
                  </h2>

                  {/* Financial Rows */}
                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Subtotal */}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-foreground">
                        Rs. {cartSubtotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Automatic Product Discounts */}
                    {cartDiscountTotal > 0 && (
                      <div className="flex justify-between text-rose-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Percent className="h-3.5 w-3.5" />
                          <span>Product Discount</span>
                        </span>
                        <span className="font-mono font-bold">
                          -Rs. {cartDiscountTotal.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Threshold Benefit if discount */}
                    {shippingResult?.appliedBenefit && shippingResult.appliedBenefit.type !== "free_shipping" && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Threshold Discount</span>
                        <span className="font-mono font-bold">
                          -Rs. {shippingResult.appliedBenefit.value.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Shipping Fee */}
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Shipping Fee</span>
                      {shippingResult?.isFreeShipping || shippingResult?.finalShippingFee === 0 ? (
                        <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          Free Delivery
                        </span>
                      ) : (
                        <span className="font-mono font-semibold text-foreground">
                          Rs. {shippingResult?.finalShippingFee.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-black/10 my-2" />

                    {/* Final Total */}
                    <div className="flex justify-between items-baseline pt-1">
                      <div>
                        <span className="text-sm font-extrabold text-foreground block">Total Payable</span>
                        <span className="text-[10px] text-muted-foreground">Inclusive of all applicable taxes</span>
                      </div>
                      <span className="font-mono text-xl sm:text-2xl font-black text-primary">
                        Rs. {cartFinalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Place Order • Rs. {cartFinalTotal.toLocaleString()}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Trust Guarantees */}
                  <div className="pt-2 border-t border-black/5 space-y-2.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>100% Genuine Architectural Hardware Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary shrink-0" />
                      <span>Safe Multi-Layer Shockproof Delivery Packaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>Encrypted SSL Secure Checkout Transmission</span>
                    </div>
                  </div>
                </div>

                {/* Helpline / WhatsApp Quick Assist */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 text-xs flex items-center justify-between shadow-xs">
                  <div>
                    <p className="font-bold text-foreground">Need help ordering?</p>
                    <p className="text-[11px] text-muted-foreground">Call or WhatsApp our team 24/7</p>
                  </div>
                  <a
                    href="https://wa.me/923000421772"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
