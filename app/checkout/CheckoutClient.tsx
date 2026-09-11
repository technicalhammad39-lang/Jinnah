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
  QrCode,
  Upload,
  Trash2,
  Smartphone,
  PartyPopper,
  PackageCheck,
  Plus,
  Minus
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
  const { clearCart, updateCartQuantity, removeFromCart } = useCartActions();
  const { setCartOpen } = useOverlayActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [trackingId, setTrackingId] = useState("");
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
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Distinguish COD vs Online/Transfer without confusing JazzCash/EasyPaisa
  const isCodMethod = (m: any) => {
    if (!m) return false;
    const id = (m.id || "").toLowerCase();
    const type = (m.type || "").toLowerCase();
    const title = (m.title || "").toLowerCase().trim();
    return id === "cod" || type === "cod" || title === "cod" || title === "cash on delivery" || title.includes("cash on delivery");
  };

  const isWalletMethod = (m: any) => {
    if (!m) return false;
    const type = (m.type || "").toLowerCase();
    const title = (m.title || "").toLowerCase();
    return type === "wallet" || title.includes("jazzcash") || title.includes("easypaisa") || title.includes("sadapay") || title.includes("nayapay") || title.includes("wallet");
  };

  const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setIsUploadingProof(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "payment-proofs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload screenshot");
      }

      const data = await res.json();
      setPaymentProofUrl(data.url);
      toast.success("Payment screenshot attached successfully!");
    } catch (err: any) {
      console.error("Proof upload error:", err);
      toast.error(err.message || "Failed to upload receipt. You can also send it via WhatsApp.");
    } finally {
      setIsUploadingProof(false);
    }
  };

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
    const idToCopy = trackingId || orderId;
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopiedOrderId(true);
    toast.success("Tracking ID copied to clipboard!");
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
        paymentProof: paymentProofUrl || null,
        transactionId: transactionId.trim() || null,
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
        paymentProof: paymentProofUrl || null,
        transactionId: transactionId.trim() || null,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: cartDiscountTotal,
        shipping: shippingResult?.finalShippingFee ?? 0,
        appliedBenefit: shippingResult?.appliedBenefit ?? null,
        total: cartFinalTotal,
      });

      setOrderId(data.orderId);
      setTrackingId(data.trackingId || data.orderId);
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
                        Official Tracking ID
                      </p>
                      <p className="mt-1 font-mono text-xl md:text-2xl font-black text-foreground tracking-tight">
                        {trackingId || orderId}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Save this Tracking ID to track your live order status anytime without needing a phone number.
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
                            <span>Copy Tracking ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-primary/15 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/track-order/${trackingId || orderId}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/95 active:scale-98"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Track Order Live</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <a
                      href={`https://wa.me/923000421772?text=${encodeURIComponent(
                        `Salam Jinnah Hardware Store! Maine abhi website par order place kia hai. Mera Tracking ID hai: ${trackingId || orderId}. Kindly confirm.`
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
                  href={`/track-order/${trackingId || orderId}`}
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
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

                {/* 3. PAYMENT METHOD */}
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
                    <div className="space-y-3.5">
                      {availablePaymentMethods.map((method) => {
                        const isSelected = paymentMethod === method.id;
                        const isCod = isCodMethod(method);
                        const isWallet = isWalletMethod(method);

                        return (
                          <div
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`rounded-2xl border-2 transition-all p-4 sm:p-5 cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/[0.015] shadow-xs"
                                : "border-black/10 hover:border-black/20 bg-white"
                            }`}
                          >
                            {/* Top row: Radio, Logo, Title, Badge */}
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
                                  <div className="relative h-8 w-11 shrink-0 bg-white rounded-xl border border-black/10 overflow-hidden flex items-center justify-center p-1 shadow-2xs">
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
                                    className="text-sm sm:text-base font-bold text-foreground cursor-pointer block truncate"
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
                                {isCod ? (
                                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                                    <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Cash</span>
                                  </span>
                                ) : isWallet ? (
                                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-lg">
                                    <Smartphone className="h-3.5 w-3.5 text-purple-600" />
                                    <span>Wallet</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-lg">
                                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Transfer</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Clean Expanded Content (NO NESTED BOXES - Just clean typography and divider lines) */}
                            {isSelected && (
                              <div className="mt-4 pt-4 border-t border-black/10 text-xs animate-in fade-in duration-200 space-y-4">
                                {isCod ? (
                                  /* Clean COD info */
                                  <div className="flex items-start gap-3 text-stone-700 py-1">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                      <p className="font-bold text-gray-900 text-xs sm:text-sm">Pay Cash on Delivery</p>
                                      <p className="text-xs text-stone-500 leading-relaxed">
                                        Pay safely with cash when your package arrives at your doorstep. Please keep the exact payable amount (<strong>Rs. {cartFinalTotal.toLocaleString()}</strong>) ready for the courier rider.
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  /* Bank Transfer / Mobile Wallet info (Clean typography with divider lines, NO nested boxes) */
                                  <div className="space-y-4">
                                    {/* Account Details */}
                                    {(method.bankName || method.accountTitle || method.accountNumber || method.iban) && (
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {method.bankName && (
                                            <div>
                                              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Bank / Provider</span>
                                              <span className="font-bold text-gray-900 text-sm sm:text-base">{method.bankName}</span>
                                            </div>
                                          )}
                                          {method.accountTitle && (
                                            <div>
                                              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Account Title</span>
                                              <span className="font-bold text-gray-900 text-sm sm:text-base">{method.accountTitle}</span>
                                            </div>
                                          )}
                                        </div>

                                        {method.accountNumber && (
                                          <div className="flex items-center justify-between py-2 border-t border-b border-black/10">
                                            <div>
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Account / Mobile Number</span>
                                              <span className="font-mono font-black text-gray-900 text-base sm:text-lg tracking-wider">{method.accountNumber}</span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyText(method.accountNumber, `acc-${method.id}`);
                                              }}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs font-bold text-primary hover:bg-primary/5 transition-all shadow-2xs cursor-pointer active:scale-95"
                                            >
                                              {copiedField === `acc-${method.id}` ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                              <span>{copiedField === `acc-${method.id}` ? "Copied" : "Copy"}</span>
                                            </button>
                                          </div>
                                        )}

                                        {method.iban && (
                                          <div className="flex items-center justify-between py-2 border-b border-black/10">
                                            <div className="min-w-0 pr-2">
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">IBAN / Raast ID</span>
                                              <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm truncate block">{method.iban}</span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyText(method.iban, `iban-${method.id}`);
                                              }}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/15 bg-white text-xs font-bold text-primary hover:bg-primary/5 transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95"
                                            >
                                              {copiedField === `iban-${method.id}` ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                              <span>{copiedField === `iban-${method.id}` ? "Copied" : "Copy"}</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* QR Code if provided */}
                                    {method.qrCode && (
                                      <div className="flex items-center gap-4 py-2 border-t border-black/10">
                                        <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-black/15 bg-white shadow-2xs">
                                          <Image
                                            src={method.qrCode.startsWith("http") ? method.qrCode : getPublicUploadUrl(method.qrCode)}
                                            alt="Payment QR Code"
                                            fill
                                            className="object-contain p-1"
                                          />
                                        </div>
                                        <div>
                                          <p className="font-bold text-gray-900 text-sm">Scan QR Code to Pay</p>
                                          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                            Scan using your mobile banking or wallet app (Meezan, Raast, JazzCash, EasyPaisa, SadaPay, NayaPay).
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Instructions */}
                                    {method.instructions && (
                                      <div className="py-2 border-t border-black/10">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Instructions</span>
                                        <p className="text-xs text-stone-700 leading-relaxed">
                                          {method.instructions}
                                        </p>
                                      </div>
                                    )}

                                    {/* Payment Screenshot Upload Zone */}
                                    <div className="pt-3 border-t border-black/10 space-y-3">
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                            Attach Payment Screenshot / Proof {method.requireProof && <span className="text-rose-500">*</span>}
                                          </label>
                                          {method.requireProof && (
                                            <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                                              Required
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-stone-500 mb-2.5">
                                          Transfer the payable amount (<strong>Rs. {cartFinalTotal.toLocaleString()}</strong>), take a screenshot of your successful transaction receipt, and attach it below:
                                        </p>

                                        {paymentProofUrl ? (
                                          <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                                            <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0">
                                              <Image src={paymentProofUrl} alt="Payment Proof" fill className="object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1 text-xs">
                                              <p className="font-bold text-emerald-800 flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                <span>Receipt Screenshot Attached</span>
                                              </p>
                                              <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-semibold mt-0.5 block truncate">
                                                Click to view uploaded receipt
                                              </a>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setPaymentProofUrl("");
                                              }}
                                              className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                              title="Remove screenshot"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ) : (
                                          <label 
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 border-2 border-dashed border-black/20 hover:border-primary rounded-xl cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-all text-center sm:text-left"
                                          >
                                            {isUploadingProof ? (
                                              <>
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                <span className="text-xs font-bold text-stone-700">Uploading receipt screenshot...</span>
                                              </>
                                            ) : (
                                              <>
                                                <Upload className="h-5 w-5 text-primary shrink-0" />
                                                <div>
                                                  <span className="text-xs font-bold text-gray-900">Click to upload payment screenshot</span>
                                                  <span className="text-[11px] text-stone-400 block sm:inline sm:ml-2">(PNG, JPG, WEBP max 10MB)</span>
                                                </div>
                                              </>
                                            )}
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              disabled={isUploadingProof}
                                              onChange={handlePaymentProofUpload}
                                            />
                                          </label>
                                        )}
                                      </div>

                                      {/* Transaction ID */}
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                                          Transaction ID / Reference # <span className="text-stone-400 font-normal lowercase">(optional)</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={transactionId}
                                          onChange={(e) => setTransactionId(e.target.value)}
                                          placeholder="e.g. TID-9821389 or bank SMS reference"
                                          className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-xs font-mono outline-none focus:border-primary"
                                        />
                                      </div>
                                    </div>
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
              </div>

              {/* RIGHT COLUMN (approx 35%, Sticky on Desktop) */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-5">
                  {/* Free Shipping / Threshold Promotion Hype Card */}
                  {shippingSettings?.thresholdEnabled && shippingSettings.thresholdAmount > 0 && (
                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-amber-500/[0.03] p-4.5 shadow-xs">
                      {shippingResult?.thresholdReached ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0 stroke-[2.3]" />
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                                Promotion Unlocked!
                              </p>
                              <p className="text-xs font-bold text-foreground truncate sm:text-clip">
                                {shippingSettings.benefitType === "free_shipping"
                                  ? "You unlocked FREE SHIPPING!"
                                  : "You unlocked your extra threshold discount!"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-center shrink-0 text-amber-500 pr-0.5">
                            <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 drop-shadow-xs" />
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
                    <div className="flex items-center justify-between border-b border-black/5 pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground tracking-tight">
                          Order Summary
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          {cartCount} {cartCount === 1 ? "item" : "items"} in cart
                        </p>
                      </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 divide-y divide-black/5">
                      {cart.map((item) => {
                        const { finalPrice } = calculateProductPrice(item.product.price, item.product.id, discounts);
                        const stockInfo = getStockInfo(item.product, item.selectedColor || "", item.selectedSize || "");
                        const isMaxStock = stockInfo.stock > 0 && item.quantity >= stockInfo.stock;

                        return (
                          <div
                            key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                            className="pt-3.5 first:pt-0 flex gap-3 items-start"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative h-16 w-16 rounded-xl border border-black/10 bg-stone-50 overflow-hidden shrink-0">
                              <Image
                                src={item.product.images?.[0] || "/placeholder.jpg"}
                                alt={item.product.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>

                            {/* Product Details & Actions */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5">
                                <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">
                                  {item.product.name}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(
                                      item.product.id,
                                      item.selectedColor || "",
                                      item.selectedSize || ""
                                    )
                                  }
                                  className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Color & Size Variant Chips */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                                {item.selectedColor && (
                                  <span className="flex items-center gap-1">
                                    <span>Color:</span>
                                    <strong className="text-foreground capitalize">{item.selectedColor}</strong>
                                  </span>
                                )}
                                {item.selectedColor && item.selectedSize && <span>•</span>}
                                {item.selectedSize && (
                                  <span>
                                    Size: <strong className="text-foreground uppercase">{item.selectedSize}</strong>
                                  </span>
                                )}
                                {(item.selectedColor || item.selectedSize) && <span>•</span>}
                                <span className="font-mono">
                                  Unit: Rs. {finalPrice.toLocaleString()}
                                </span>
                              </div>

                              {/* Bottom Row: Quantity Stepper + Item Total Price */}
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <div className="flex items-center rounded-lg border border-black/10 bg-stone-50/80 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCartQuantity(
                                        item.product.id,
                                        item.selectedColor || "",
                                        item.selectedSize || "",
                                        item.quantity - 1
                                      )
                                    }
                                    className="cursor-pointer p-1 sm:p-1.5 text-stone-600 hover:bg-black/5 hover:text-foreground transition-colors"
                                    title="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="min-w-[24px] px-1 text-center text-xs font-bold select-none text-foreground font-mono">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isMaxStock}
                                    onClick={() =>
                                      updateCartQuantity(
                                        item.product.id,
                                        item.selectedColor || "",
                                        item.selectedSize || "",
                                        item.quantity + 1
                                      )
                                    }
                                    className={`p-1 sm:p-1.5 transition-colors ${
                                      isMaxStock
                                        ? "cursor-not-allowed opacity-30 text-muted-foreground"
                                        : "cursor-pointer text-stone-600 hover:bg-black/5 hover:text-foreground"
                                    }`}
                                    title={isMaxStock ? `Max stock (${stockInfo.stock}) reached` : "Increase quantity"}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>

                                <span className="text-xs font-mono font-bold text-foreground">
                                  Rs. {(finalPrice * item.quantity).toLocaleString()}
                                </span>
                              </div>

                              {isMaxStock && (
                                <span className="block text-[10px] font-medium text-amber-600 mt-1">
                                  Max stock reached ({stockInfo.stock})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

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
                          <span className="font-bold text-xs sm:text-sm text-emerald-600">
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
                          <PackageCheck className="h-4.5 w-4.5" />
                          <span>Place Order</span>
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
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
