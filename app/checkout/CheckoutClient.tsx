"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import ConfettiCelebration from "@/components/animations/ConfettiCelebration";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  ShieldCheck, 
  ShoppingBag, 
  Copy, 
  Check, 
  Truck, 
  Package, 
  Clock, 
  Printer, 
  MessageCircle, 
  Sparkles,
  MapPin
} from "lucide-react";
import { useCartState, useCartActions } from "@/context/AppContext";
import { useAuth } from "@/lib/auth-context";
import { getPublicUploadUrl } from "@/lib/utils";
import { getPaymentMethods } from "@/lib/data-fetcher";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { calculateProductPrice } from "@/lib/discount-engine";
import { getStockInfo } from "@/lib/inventory-engine";

export default function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartSubtotal, cartDiscountTotal, cartFinalTotal, discounts } = useCartState();
  const { clearCart } = useCartActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [placedOrderSummary, setPlacedOrderSummary] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([]);

  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    getPaymentMethods().then((methods) => {
      if (methods.length > 0) {
        setAvailablePaymentMethods(methods);
        setPaymentMethod(methods[0].id); // default to first active method
      } else {
        // Fallback defaults
        setAvailablePaymentMethods([
          { id: "cod", title: "Cash on Delivery", description: "Pay when you receive" },
          { id: "bank", title: "Bank Transfer", description: "Direct to our account" },
        ]);
      }
    });
  }, []);

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    toast.success("Order & Tracking ID copied to clipboard!");
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  if (orderSuccess) {
    const customer = placedOrderSummary?.customerInfo || formData;
    const items = placedOrderSummary?.items || [];
    const total = placedOrderSummary?.total ?? cartFinalTotal;
    const subtotal = placedOrderSummary?.subtotal ?? cartSubtotal;

    return (
      <div className="relative min-h-screen bg-[#faf9f6] pt-24 pb-24 md:pt-28">
        <ConfettiCelebration duration={5500} particleCount={130} />

        <div className="mx-auto max-w-4xl px-4 md:px-6">
          {/* Main Success Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Top Celebration Card */}
            <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white p-8 text-center shadow-xl shadow-black/5 md:p-12">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              {/* Animated Celebration Icon */}
              <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-40" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md">
                  <Sparkles className="h-4 w-4 fill-amber-950" />
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Order Placed Successfully
              </span>

              <h1 className="mt-4 mb-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Shukriya, {customer.firstName || "Customer"}!
              </h1>
              <p className="mx-auto max-w-xl text-sm md:text-base text-muted-foreground">
                Aapka order receive ho chuka hai. Hum jald hi order verify karke packaging aur courier dispatch process shuru kar rahe hain.
              </p>

              {/* Highlighted Order & Tracking ID Box */}
              <div className="mt-8 mx-auto max-w-lg rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 md:p-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                      Official Tracking / Order ID
                    </p>
                    <p className="mt-1 font-mono text-2xl font-extrabold text-foreground tracking-tight">
                      #{orderId}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Use this ID anytime to track your package live.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyOrderId}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-black/5 hover:border-black/20 active:scale-95"
                    >
                      {copiedOrderId ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-muted-foreground" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-primary/15 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/track-order/${orderId}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/95 hover:shadow-primary/35 active:scale-98"
                  >
                    <Truck className="h-4 w-4" />
                    <span>Track Your Order Live</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href={`https://wa.me/923000421772?text=${encodeURIComponent(
                      `Salam Jinnah Hardware Store! Maine abhi website par order place kia hai. Mera Order ID hai: #${orderId}. Please update me on delivery.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs md:text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-100/80 active:scale-98"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 3-Step Journey Timeline */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                What Happens Next? (Delivery Milestones)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative rounded-2xl bg-[#faf9f6] p-5 border border-black/5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">1</span>
                    <h4 className="text-sm font-bold text-foreground">Order Verification</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Our sales team will confirm your order details and check item inventory.
                  </p>
                </div>

                <div className="relative rounded-2xl bg-[#faf9f6] p-5 border border-black/5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
                    <h4 className="text-sm font-bold text-foreground">Warehouse Dispatch</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Packaged securely and handed over to TCS / PostEx courier with live tracking.
                  </p>
                </div>

                <div className="relative rounded-2xl bg-[#faf9f6] p-5 border border-black/5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-foreground text-xs font-bold">3</span>
                    <h4 className="text-sm font-bold text-foreground">Doorstep Delivery</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Arrives at your door in 2-4 working days. Inspect and pay via Cash on Delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid: Shipping & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Details */}
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-bold text-foreground text-base">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-muted-foreground">{customer.address}</p>
                  <p className="text-muted-foreground">{customer.city}, {customer.postalCode}</p>
                  <p className="font-mono text-xs text-muted-foreground pt-1">
                    Phone: <span className="text-foreground font-semibold">{customer.phone}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email: <span className="text-foreground font-semibold">{customer.email}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-bold uppercase tracking-wide text-foreground bg-black/5 px-2.5 py-1 rounded-md">
                      {paymentMethod === "cod" ? "Cash on Delivery (COD)" : paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary & Financials */}
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> Order Snapshot
                  </h3>

                  {items.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
                      {items.map((item: any, idx: number) => {
                        const p = item.product || item;
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs border-b border-black/5 pb-2">
                            <div className="truncate pr-2">
                              <p className="font-semibold text-foreground truncate">{p.name}</p>
                              <p className="text-muted-foreground">
                                Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ""}
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

                <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">Free Delivery</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-foreground pt-1 border-t border-black/5">
                    <span>Total Payable</span>
                    <span className="text-primary font-mono">Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <h5 className="text-xs font-bold text-foreground">100% Genuine</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5">Authentic hardware</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <h5 className="text-xs font-bold text-foreground">Safe Packing</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5">Dispatched securely</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                <Clock className="h-6 w-6 text-primary mb-2" />
                <h5 className="text-xs font-bold text-foreground">Fast Delivery</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5">2-4 working days</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                <MessageCircle className="h-6 w-6 text-primary mb-2" />
                <h5 className="text-xs font-bold text-foreground">Support 24/7</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5">Active helpline</p>
              </div>
            </div>

            {/* Bottom Navigation CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={`/track-order/${orderId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/95"
              >
                <Truck className="h-4 w-4" />
                <span>Go to Tracking Portal</span>
              </Link>

              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-xs md:text-sm font-bold text-foreground shadow-sm transition-all hover:bg-black/5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>

              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-xs md:text-sm font-bold text-foreground shadow-sm transition-all hover:bg-black/5"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-4 text-center md:px-6">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-black/5 text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="mb-3 text-2xl font-bold">Your Cart is Empty</h1>
          <p className="mb-8 text-muted-foreground">
            You have no items in your cart to checkout.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary/95"
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required contact information.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address || !formData.city) {
      toast.error("Please fill in all required shipping details.");
      return false;
    }
    return true;
  };

  const nextStep = (step: 2 | 3) => {
    if (step === 2 && validateStep1()) {
      setCheckoutStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === 3 && validateStep2()) {
      setCheckoutStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

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
      const orderPayload = {
        customerInfo: formData,
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
        throw new Error(data.error || "Failed to process checkout");
      }

      setPlacedOrderSummary({
        id: data.orderId,
        customerInfo: { ...formData },
        paymentMethod,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: cartDiscountTotal,
        total: cartFinalTotal,
      });
      setOrderId(data.orderId);
      setOrderSuccess(true);
      clearCart();
      window.scrollTo(0, 0);
      
      toast.success("Order placed successfully.");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Unable to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-28 pb-20 md:pt-32">
      <div className="mx-auto max-w-[1920px] px-4 md:px-6">
        {/* Breadcrumb / Step Indicator */}
        <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:mb-12">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => setCheckoutStep(1)} className={checkoutStep >= 1 ? "text-primary" : ""}>Information</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => checkoutStep >= 2 && setCheckoutStep(2)} className={checkoutStep >= 2 ? "text-primary cursor-pointer" : "cursor-not-allowed opacity-50"}>Shipping</button>
          <ChevronRight className="h-3 w-3" />
          <span className={checkoutStep === 3 ? "text-primary" : "opacity-50"}>Payment</span>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Checkout Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <h1 className="mb-8 text-3xl font-extrabold text-foreground md:text-4xl">
              Secure Checkout
            </h1>

            <div className="space-y-8">
              {/* Step 1: Contact Information */}
              <div className={`rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm transition-all ${checkoutStep !== 1 ? 'opacity-70' : 'ring-1 ring-primary/20'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">1</span>
                    Contact Information
                  </h2>
                  {checkoutStep > 1 && (
                    <button onClick={() => setCheckoutStep(1)} className="text-sm font-semibold text-primary hover:underline">Edit</button>
                  )}
                </div>

                {checkoutStep === 1 ? (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                      <input required type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="John" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                      <input required type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <input required type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                      <input required type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="0300 0000000" />
                    </div>
                    <div className="col-span-full mt-4">
                      <button onClick={() => nextStep(2)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white transition-all hover:bg-primary/95">
                        Continue to Shipping
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {formData.email} • {formData.phone}
                  </div>
                )}
              </div>

              {/* Step 2: Shipping Details */}
              <div className={`rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm transition-all ${checkoutStep !== 2 ? 'opacity-70' : 'ring-1 ring-primary/20'} ${checkoutStep < 2 ? 'pointer-events-none opacity-40' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${checkoutStep >= 2 ? 'bg-primary/10 text-primary' : 'bg-black/5 text-muted-foreground'}`}>2</span>
                    Shipping Details
                  </h2>
                  {checkoutStep > 2 && (
                    <button onClick={() => setCheckoutStep(2)} className="text-sm font-semibold text-primary hover:underline">Edit</button>
                  )}
                </div>

                {checkoutStep === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Complete Address</label>
                      <input required type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="House/Office No, Street, Area" />
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</label>
                        <input required type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Lahore" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="postalCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Postal Code (Optional)</label>
                        <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="54000" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Notes (Optional)</label>
                      <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Special instructions for delivery..." />
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button onClick={() => setCheckoutStep(1)} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-4 text-sm font-bold text-foreground transition-all hover:bg-black/5">
                        Back
                      </button>
                      <button onClick={() => nextStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white transition-all hover:bg-primary/95">
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}
                
                {checkoutStep > 2 && (
                  <div className="text-sm text-muted-foreground">
                    {formData.address}, {formData.city} {formData.postalCode}
                  </div>
                )}
              </div>

              {/* Step 3: Payment Method */}
              <div className={`rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm transition-all ${checkoutStep !== 3 ? 'opacity-70' : 'ring-1 ring-primary/20'} ${checkoutStep < 3 ? 'pointer-events-none opacity-40' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${checkoutStep >= 3 ? 'bg-primary/10 text-primary' : 'bg-black/5 text-muted-foreground'}`}>3</span>
                    Payment Method
                  </h2>
                </div>

                {checkoutStep === 3 && (
                  <form id="checkout-form" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-8">
                      {availablePaymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                            paymentMethod === method.id ? "border-primary bg-primary/5" : "border-black/5 bg-white hover:border-black/15"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-5 w-5 cursor-pointer accent-primary shrink-0"
                          />
                          {method.logo && (
                            <div className="h-10 w-12 flex-shrink-0 bg-white rounded border border-black/10 overflow-hidden flex items-center justify-center p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={method.logo.startsWith('http') ? method.logo : `/uploads/${method.logo}`} alt={method.title} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold">{method.title}</h4>
                            <p className="text-xs text-muted-foreground">{method.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32 rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
              <h3 className="mb-6 text-lg font-bold text-foreground">Order Summary</h3>
              
              <div className="mb-6 max-h-[320px] space-y-4 overflow-y-auto pr-2">
                {cart.map((item) => {
                  const pricing = calculateProductPrice(item.product.price, item.product.id, discounts);
                  return (
                  <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#efece6]">
                      <Image
                        src={item.product.images?.[0] ? getPublicUploadUrl(item.product.images[0]) : "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-grow flex-col justify-center min-w-0">
                      <h4 className="line-clamp-1 text-sm font-semibold">{item.product.name}</h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Qty: {item.quantity}</span>
                        {item.selectedSize && (
                          <>
                            <span>•</span>
                            <span>{item.selectedSize}</span>
                          </>
                        )}
                        {item.selectedColor && (
                          <>
                            <span>•</span>
                            <span>{item.selectedColor}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-1 font-bold">
                        Rs. {(pricing.finalPrice * item.quantity).toLocaleString()}
                        {pricing.hasDiscount && (
                          <span className="ml-2 text-xs font-semibold text-muted-foreground line-through">
                            Rs. {(pricing.originalPrice * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>

              <div className="space-y-3 border-t border-black/5 pt-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                   <span>Subtotal</span>
                   <span className="font-semibold text-foreground">Rs. {cartSubtotal.toLocaleString()}</span>
                 </div>
                 {cartDiscountTotal > 0 && (
                   <div className="flex justify-between text-sm text-rose-500">
                     <span>Discount</span>
                     <span className="font-semibold">-Rs. {cartDiscountTotal.toLocaleString()}</span>
                   </div>
                 )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free Delivery</span>
                </div>
                <div className="my-2 h-[1px] bg-black/5" />
                <div className="flex justify-between text-lg font-extrabold text-foreground">
                  <span>Total</span>
                  <span>Rs. {cartFinalTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#faf9f6] p-4 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-8 w-8 text-emerald-500 flex-shrink-0" />
                <p>
                  Secure checkout powered by industry standard encryption. Your data is safe.
                </p>
              </div>

              {checkoutStep === 3 && (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
