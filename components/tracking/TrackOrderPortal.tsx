"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ArrowLeft, 
  Clock, 
  Truck, 
  PackageCheck, 
  Package, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  MessageCircle, 
  AlertCircle, 
  Navigation, 
  RotateCcw,
  Phone,
  ShieldCheck
} from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

interface OrderTrackingData {
  id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;
  courierName?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  trackingHistory?: Array<{
    status: string;
    title: string;
    description: string;
    timestamp: string;
    location?: string;
  }>;
  adminNotes?: string | null;
  createdAt: string;
  items: Array<{
    name: string;
    image?: string | null;
    price: number;
    quantity: number;
    selectedSize?: string | null;
    selectedColor?: string | null;
  }>;
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  paymentMethod: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    city: string;
    address: string;
    postalCode?: string;
    phone?: string;
  };
}

interface TrackOrderPortalProps {
  initialReference?: string;
}

export default function TrackOrderPortal({ initialReference = "" }: TrackOrderPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id") || searchParams.get("query") || initialReference || "";
  const phoneParam = searchParams.get("phone") || "";

  const [orderIdInput, setOrderIdInput] = useState(idParam);
  const [phoneInput, setPhoneInput] = useState(phoneParam);
  const [activeOrder, setActiveOrder] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [copiedCourierCn, setCopiedCourierCn] = useState(false);

  // Fetch order tracking from API
  const fetchTracking = async (idToFetch?: string, phoneToFetch?: string) => {
    const id = (idToFetch ?? orderIdInput).trim();
    const phone = (phoneToFetch ?? phoneInput).trim();

    if (!id) {
      toast.error("Please enter your Order ID (#JH-XXXX-XXXX)");
      return;
    }
    if (!phone) {
      toast.error("Please enter the contact phone number used during checkout");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/orders/track?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order not found or verification details did not match.");
      }

      setActiveOrder(data.order);
      setErrorMessage("");
    } catch (err: any) {
      setActiveOrder(null);
      setErrorMessage(err.message || "Unable to retrieve order details. Please verify your Order ID and phone number.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch if both parameters exist in URL query params
  useEffect(() => {
    if (idParam) setOrderIdInput(idParam);
    if (phoneParam) setPhoneInput(phoneParam);
    if (idParam && phoneParam) {
      fetchTracking(idParam, phoneParam);
    }
  }, [idParam, phoneParam]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderIdInput.trim();
    const cleanPhone = phoneInput.trim();

    if (!cleanId) {
      toast.error("Please enter your Order ID (#JH-XXXX-XXXX)");
      return;
    }
    if (!cleanPhone) {
      toast.error("Please enter the contact phone number used during checkout");
      return;
    }

    router.push(`/track-order?id=${encodeURIComponent(cleanId)}&phone=${encodeURIComponent(cleanPhone)}`);
    fetchTracking(cleanId, cleanPhone);
  };

  // Copy tracking helper
  const handleCopy = (text: string, type: "order" | "courier") => {
    navigator.clipboard.writeText(text);
    if (type === "order") {
      setCopiedTrackingId(true);
      setTimeout(() => setCopiedTrackingId(false), 2000);
      toast.success("Order ID copied to clipboard");
    } else {
      setCopiedCourierCn(true);
      setTimeout(() => setCopiedCourierCn(false), 2000);
      toast.success("Consignment Number copied to clipboard");
    }
  };

  // Get external courier URL helper
  const getCourierTrackingUrl = (courier?: string | null, cn?: string | null) => {
    if (!cn) return null;
    const lower = (courier || "").toLowerCase();
    if (lower.includes("postex")) return `https://postex.pk/tracking?cn=${encodeURIComponent(cn)}`;
    if (lower.includes("tcs")) return `https://www.tcsexpress.com/track/${encodeURIComponent(cn)}`;
    if (lower.includes("leopard")) return `https://www.leopardscourier.com/tracking/?track_no=${encodeURIComponent(cn)}`;
    if (lower.includes("trax")) return `https://trax.pk/tracking/?cn=${encodeURIComponent(cn)}`;
    if (lower.includes("rider")) return `https://withrider.com/tracking?track=${encodeURIComponent(cn)}`;
    if (lower.includes("call courier") || lower.includes("callcourier")) return `https://callcourier.com.pk/tracking/?cn=${encodeURIComponent(cn)}`;
    if (lower.includes("m&p") || lower.includes("m and p")) return `https://mulphilog.com/track?cn=${encodeURIComponent(cn)}`;
    return null;
  };

  // Get external courier logo helper
  const getCourierLogo = (courier?: string | null): string | null => {
    if (!courier) return null;
    const lower = courier.toLowerCase().trim();
    if (lower.includes("postex")) return "/postex.png";
    if (lower.includes("tcs")) return "/tcs.png";
    if (lower.includes("leopard")) return "/leopards.png";
    if (lower.includes("m&p") || lower.includes("m and p") || lower.includes("mnp") || lower.includes("m & p")) return "/m&p.png";
    return null;
  };

  // Logistics steps definition
  const steps = [
    { 
      id: "pending", 
      label: "Order Placed", 
      desc: "Order received & payment registered",
      icon: Clock 
    },
    { 
      id: "processing", 
      label: "Confirmed & Packing", 
      desc: "Quality inspection in warehouse",
      icon: Package 
    },
    { 
      id: "shipped", 
      label: "In Transit", 
      desc: "Dispatched via courier express",
      icon: Truck 
    },
    { 
      id: "out_for_delivery", 
      label: "Out for Delivery", 
      desc: "Rider arriving at your address",
      icon: Navigation 
    },
    { 
      id: "delivered", 
      label: "Delivered", 
      desc: "Handed over to customer",
      icon: PackageCheck 
    },
  ];

  // Calculate current step index
  const getStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    if (status === "pending") return 0;
    if (status === "processing") return 1;
    if (status === "shipped") return 2;
    if (status === "out_for_delivery") return 3;
    if (status === "delivered") return 4;
    return 0;
  };

  const currentStepIndex = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const isCancelled = activeOrder?.status === "cancelled";
  const activeStep = steps[Math.max(0, Math.min(steps.length - 1, currentStepIndex))];

  const stepperContainerRef = useRef<HTMLDivElement | null>(null);
  const activeStepRef = useRef<HTMLDivElement | null>(null);

  // Auto-center active milestone on mobile when order is loaded
  useEffect(() => {
    if (activeOrder && activeStepRef.current && stepperContainerRef.current) {
      const timer = setTimeout(() => {
        if (!activeStepRef.current || !stepperContainerRef.current) return;
        const container = stepperContainerRef.current;
        const activeEl = activeStepRef.current;
        const containerWidth = container.clientWidth;
        const elLeft = activeEl.offsetLeft;
        const elWidth = activeEl.clientWidth;

        const scrollTarget = elLeft - containerWidth / 2 + elWidth / 2;
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: "smooth",
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [activeOrder, currentStepIndex]);

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col justify-between overflow-x-hidden">
      {/* Site Navigation */}
      <Navbar />

      {/* Main Track Order Content */}
      <main className="flex-1 w-full pt-36 sm:pt-40 md:pt-44 pb-20 sm:pb-28">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          
          {/* Navigation Breadcrumb */}
          <div className="mb-6 sm:mb-8 flex items-center justify-start">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Section & Search Bar - Full-Width Edge to Edge */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] bg-[#11100e] text-white p-4 min-[380px]:p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 shadow-2xl mb-10 sm:mb-14">
            <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-2 sm:gap-2.5 rounded-full bg-white/10 px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-extrabold uppercase tracking-wider text-white/90 backdrop-blur-md mb-4 sm:mb-6 border border-white/10 shadow-sm whitespace-nowrap max-w-full">
                <Truck className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span className="whitespace-nowrap">Jinnah Express Tracking Portal</span>
              </div>
              <h1 className="text-3xl min-[390px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-3 sm:mb-6 leading-tight">
                Track Your Order
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-12 max-w-3xl mx-auto font-normal leading-relaxed">
                Real-time consignment status, warehouse processing, and courier milestones across Pakistan.
              </p>

              {/* Dual-Factor Order Verification Form */}
              <form onSubmit={handleSearchSubmit} className="relative mx-auto max-w-3xl w-full">
                <div className="flex flex-col sm:flex-row items-stretch rounded-2xl sm:rounded-3xl bg-white p-2 sm:p-2.5 shadow-2xl shadow-black/60 gap-2 sm:gap-2">
                  {/* Order ID Input */}
                  <div className="flex-1 flex items-center bg-gray-50/90 rounded-xl sm:rounded-2xl px-3 py-1 border border-black/5 focus-within:border-primary focus-within:bg-white transition-all">
                    <Search className="h-5 w-5 text-muted-foreground ml-1 shrink-0" />
                    <input
                      type="text"
                      placeholder="Order ID (#JH-XXXX-XXXX)"
                      value={orderIdInput}
                      onChange={(e) => setOrderIdInput(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-sm sm:text-base font-bold text-[#11100e] outline-none placeholder:text-muted-foreground/60 placeholder:font-normal font-mono"
                      required
                    />
                  </div>

                  {/* Phone Verification Input */}
                  <div className="flex-1 flex items-center bg-gray-50/90 rounded-xl sm:rounded-2xl px-3 py-1 border border-black/5 focus-within:border-primary focus-within:bg-white transition-all">
                    <Phone className="h-5 w-5 text-muted-foreground ml-1 shrink-0" />
                    <input
                      type="tel"
                      placeholder="Billing Phone (03001234567)"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-sm sm:text-base font-bold text-[#11100e] outline-none placeholder:text-muted-foreground/60 placeholder:font-normal font-mono"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-primary px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wider text-white shadow-xl transition-all hover:bg-primary/95 disabled:opacity-70 shrink-0"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span>Track Order</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Security & Privacy Callout */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-white/80">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm border border-white/15">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Secure Dual Verification</span>
                </div>
                <span className="text-white/40 hidden sm:inline">•</span>
                <span className="text-white/70 text-xs">Requires Order ID and Phone used at checkout to protect customer privacy.</span>
              </div>
            </div>
          </div>

          {/* Error State */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-10 rounded-3xl border border-rose-200 bg-rose-50/90 p-8 text-center text-rose-900 shadow-sm max-w-3xl mx-auto"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <h4 className="font-extrabold text-lg sm:text-xl">Order Not Found</h4>
                <p className="text-sm sm:text-base text-rose-700 mt-2 max-w-lg mx-auto">{errorMessage}</p>
                <p className="text-xs sm:text-sm text-rose-600/90 mt-3 font-medium">
                  Need help finding your order? Contact our support team directly on WhatsApp.
                </p>
                <div className="mt-5">
                  <a
                    href={`https://wa.me/923000421772?text=${encodeURIComponent(
                      `Salam Jinnah Hardware Store! I need help tracking my order (${orderIdInput || "Order ID"}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Order Tracking Result Card */}
          {activeOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-10 sm:space-y-12"
            >
              {/* Top Bar with Status Badge and Order Header */}
              <div className="rounded-2xl sm:rounded-3xl lg:rounded-[36px] border border-black/5 bg-white p-6 sm:p-10 lg:p-12 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-black/5 pb-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Consignment Order
                      </span>
                      <button
                        onClick={() => handleCopy(activeOrder.id, "order")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm font-bold transition-all"
                      >
                        {copiedTrackingId ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" /> Copy ID
                          </>
                        )}
                      </button>
                    </div>
                    <h2 className="mt-2 font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                      #{activeOrder.id}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm md:text-base text-muted-foreground font-medium">
                      Placed on:{" "}
                      <span className="font-bold text-foreground">
                        {new Date(activeOrder.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Status Pill Badge & Estimated Delivery */}
                  <div className="w-full md:w-auto flex flex-col md:items-end gap-2">
                    {isCancelled && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-rose-800 border border-rose-200 shadow-sm mb-1">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" /> Order Cancelled
                      </span>
                    )}
                    {/* Estimated Delivery Highlight Banner (Orange & Black styling, full width on mobile) */}
                    <div className="w-full md:w-auto inline-flex items-center justify-between md:justify-end gap-3 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#11100e] border-2 border-primary text-white shadow-lg">
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 animate-pulse" />
                        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80">
                          Estimated Delivery:
                        </span>
                      </div>
                      <span className="text-base sm:text-lg md:text-xl font-black text-primary font-mono tracking-wide">
                        {activeOrder.estimatedDelivery || "2-4 Business Days"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancelled Alert or Progress Stepper */}
                {isCancelled ? (
                  <div className="my-8 rounded-3xl bg-rose-50 p-8 text-center border border-rose-100 text-rose-800">
                    <h4 className="font-black text-lg sm:text-xl mb-2">This order has been cancelled</h4>
                    <p className="text-xs sm:text-sm text-rose-600 max-w-lg mx-auto leading-relaxed">
                      If this was a mistake or you wish to re-order, please get in touch with our customer service desk.
                    </p>
                  </div>
                ) : (
                  /* Multi-Stage Visual Stepper - Enlarged & Mobile Responsive */
                  <div className="mt-8">
                    {/* Mobile Instant Active Status Spotlight Card */}
                    <div className="sm:hidden mb-4 p-4 rounded-2xl bg-gradient-to-r from-primary/[0.05] via-white to-primary/[0.02] border border-primary/20 shadow-xs flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                        <activeStep.icon className="h-5 w-5 animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Current Status</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <p className="text-sm font-black text-gray-900 leading-tight truncate">{activeStep.label}</p>
                        <p className="text-[11px] text-gray-500 leading-tight truncate">{activeStep.desc}</p>
                      </div>
                    </div>

                    <div 
                      ref={stepperContainerRef}
                      className="py-6 sm:py-12 md:py-16 px-1 sm:px-8 bg-transparent sm:bg-[#faf9f6] rounded-none sm:rounded-3xl border-0 sm:border sm:border-black/5 overflow-x-auto custom-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x"
                    >
                      <div className="min-w-[580px] sm:min-w-0 px-6 sm:px-0 py-3">
                        <div className="relative">
                          {/* Background Track Line & Dynamic Auto-Animated Progress Fill */}
                          {/* Placed at top-7 (28px on mobile), sm:top-9 (36px), md:top-11 (44px) to be EQUAL CENTER in the icon circles */}
                          <div className="absolute left-0 right-0 top-7 sm:top-9 md:top-11 -translate-y-1/2 px-7 sm:px-9 md:px-11 z-0 pointer-events-none">
                            <div className="relative w-full h-2 sm:h-2.5 md:h-3 rounded-full bg-black/10 overflow-hidden shadow-inner">
                              {/* Dynamic animated active progress beam */}
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-primary transition-all duration-1000 ease-out relative shadow-sm"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(100, (currentStepIndex / (steps.length - 1)) * 100)
                                  )}%`,
                                }}
                              >
                                {/* Auto-running dynamic light pulse sweep */}
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.7)_50%,transparent_100%)] animate-pulse w-full" />
                              </div>
                            </div>
                          </div>

                          {/* Step milestones */}
                          <div className="relative flex justify-between z-10">
                            {steps.map((step, idx) => {
                              const isPast = idx < currentStepIndex;
                              const isCurrent = idx === currentStepIndex;
                              const isFuture = idx > currentStepIndex;
                              const Icon = step.icon;

                              return (
                                <div
                                  key={step.id}
                                  ref={isCurrent ? activeStepRef : null}
                                  className={`flex flex-col items-center text-center max-w-[120px] sm:max-w-[150px] snap-center shrink-0 sm:shrink transition-all duration-300 ${
                                    isCurrent ? "scale-105" : isPast ? "opacity-95" : "opacity-60"
                                  }`}
                                >
                                  {/* Icon circle wrapper */}
                                  <div className="relative flex items-center justify-center">
                                    {/* Active step: rotating loader spinner rings */}
                                    {isCurrent && (
                                      <>
                                        <span className="absolute -inset-2 sm:-inset-3 rounded-full border-2 sm:border-3 border-dashed border-primary animate-[spin_4s_linear_infinite] pointer-events-none" />
                                        <span className="absolute -inset-3.5 sm:-inset-4.5 rounded-full border border-primary/25 animate-pulse pointer-events-none" />
                                      </>
                                    )}

                                    <div
                                      className={`relative flex h-14 w-14 sm:h-18 sm:w-18 md:h-22 md:w-22 items-center justify-center rounded-full border-4 sm:border-[6px] border-white transition-all duration-500 shadow-xl ${
                                        isCurrent
                                          ? "bg-primary text-white shadow-primary/50 ring-4 ring-primary/20 scale-105"
                                          : isPast
                                          ? "bg-emerald-500 text-white shadow-emerald-500/30"
                                          : "bg-black/10 text-muted-foreground"
                                      }`}
                                    >
                                      <Icon className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 ${isCurrent ? "animate-pulse" : ""}`} />

                                      {/* Completed step: green checkmark tick */}
                                      {isPast && (
                                        <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-white z-20">
                                          <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <p
                                    className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-wider leading-tight ${
                                      isCurrent
                                        ? "mt-3 sm:mt-4 text-primary"
                                        : isPast
                                        ? "mt-3.5 sm:mt-4 text-foreground"
                                        : "mt-3.5 sm:mt-4 text-muted-foreground"
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                  <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground leading-tight">
                                    {step.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Subtle slide hint on mobile */}
                      <div className="sm:hidden flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground/80 mt-1">
                        <span className="text-primary/70 animate-pulse">← Swipe milestones to view all →</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Courier Partner & Consignment Box (If Dispatched) */}
                {(activeOrder.courierName || activeOrder.trackingNumber) && (
                  <div className="mt-8 rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-white to-amber-500/[0.03] p-4 sm:p-7 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                      <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                        {/* Courier Logo Box */}
                        <div className="flex h-16 w-20 sm:h-20 sm:w-28 items-center justify-center rounded-2xl bg-white shadow-xs border border-black/10 p-2.5 shrink-0 overflow-hidden">
                          {getCourierLogo(activeOrder.courierName) ? (
                            <Image
                              src={getCourierLogo(activeOrder.courierName)!}
                              alt={activeOrder.courierName || "Courier Logo"}
                              width={90}
                              height={60}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Truck className="h-8 w-8 text-primary shrink-0" />
                          )}
                        </div>

                        {/* Courier Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary">
                              Logistics Partner
                            </span>
                            <span className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[11px] sm:text-xs font-black uppercase">
                              {activeOrder.courierName || "Express Courier"}
                            </span>
                          </div>
                          
                          {/* CN Number & Compact Copy Icon in Highlighted Box */}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 rounded-xl bg-white border-2 border-primary/30 shadow-xs hover:border-primary/60 transition-all">
                              <span className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">
                                CN
                              </span>
                              <span className="text-base sm:text-lg md:text-xl font-mono font-black text-gray-950 tracking-tight select-all">
                                #{activeOrder.trackingNumber || "Assigned"}
                              </span>
                              {activeOrder.trackingNumber && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(activeOrder.trackingNumber!, "courier")}
                                  title="Copy CN"
                                  className="ml-1 p-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer shrink-0"
                                >
                                  {copiedCourierCn ? (
                                    <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                                  ) : (
                                    <Copy className="h-4 w-4 stroke-[2.5]" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* External Link to Courier Website */}
                      {activeOrder.trackingNumber &&
                        getCourierTrackingUrl(activeOrder.courierName, activeOrder.trackingNumber) && (
                          <a
                            href={getCourierTrackingUrl(
                              activeOrder.courierName,
                              activeOrder.trackingNumber
                            )!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-white border border-black/10 px-5 sm:px-7 py-3 text-xs sm:text-sm font-black text-gray-900 shadow-sm hover:border-primary hover:text-primary hover:shadow-md transition-all shrink-0 cursor-pointer"
                          >
                            <span>Track on {activeOrder.courierName} Portal</span>
                            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </a>
                        )}
                    </div>

                    {/* Special Delivery Note Callout */}
                    {activeOrder.adminNotes && (
                      <div className="mt-4 pt-3.5 border-t border-primary/15 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 text-xs sm:text-sm bg-white/70 p-3 rounded-xl border border-black/5">
                        <span className="font-extrabold text-[#1a1917] shrink-0 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Special Delivery Note:
                        </span>
                        <span className="text-gray-700 leading-relaxed font-medium">
                          {activeOrder.adminNotes}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Two Column Grid: Package Breakdown & Delivery Info */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Order Items & Financials (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="rounded-2xl sm:rounded-3xl border border-black/5 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2.5">
                      <Package className="h-5 w-5 text-primary" /> Shipment Items ({activeOrder.items?.length || 0})
                    </h3>

                    <div className="divide-y divide-black/5">
                      {activeOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-5 py-4 first:pt-0 last:pb-0 items-center">
                          <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#efece6] border border-black/5">
                            <Image
                              src={
                                item.image
                                  ? getPublicUploadUrl(item.image)
                                  : "/placeholder.jpg"
                              }
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-center min-w-0">
                            <h4 className="text-base sm:text-lg font-black text-foreground line-clamp-2">
                              {item.name}
                            </h4>
                            <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
                              <span>Qty: {item.quantity}</span>
                              {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                              {item.selectedColor && (
                                <span className="inline-flex items-center gap-1">
                                  • Color: 
                                  <span
                                    style={{ backgroundColor: item.selectedColor }}
                                    className="inline-block h-3 w-3 rounded-full border border-black/20 ml-0.5"
                                  />
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 text-sm sm:text-base font-mono font-black text-primary">
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="mt-8 pt-6 border-t border-black/10 space-y-3 text-sm sm:text-base">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-bold text-foreground">
                          Rs. {activeOrder.subtotal?.toLocaleString()}
                        </span>
                      </div>
                      {activeOrder.discount ? (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount Applied</span>
                          <span className="font-bold">
                            -Rs. {activeOrder.discount.toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping Fee</span>
                        <span className="font-bold text-emerald-600">
                          {activeOrder.shipping && activeOrder.shipping > 0
                            ? `Rs. ${activeOrder.shipping.toLocaleString()}`
                            : "Free Delivery"}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg sm:text-2xl font-black text-foreground pt-4 border-t border-black/10">
                        <span>Total Amount Payable</span>
                        <span className="text-primary font-mono">
                          Rs. {activeOrder.total?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Info & Quick Actions (5 cols) */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Destination Card */}
                  <div className="rounded-2xl sm:rounded-3xl border border-black/5 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2.5">
                      <MapPin className="h-5 w-5 text-primary" /> Delivery Destination
                    </h3>

                    <div className="space-y-4 text-sm sm:text-base">
                      <div>
                        <p className="font-black text-foreground text-lg sm:text-xl">
                          {activeOrder.customerInfo.firstName} {activeOrder.customerInfo.lastName}
                        </p>
                        <p className="text-xs sm:text-sm font-mono font-bold text-muted-foreground mt-1">
                          Phone: {activeOrder.customerInfo.phone || "Protected"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#faf9f6] p-5 border border-black/5 text-xs sm:text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                        <p className="font-bold text-foreground">{activeOrder.customerInfo.address}</p>
                        <p className="font-medium">
                          {activeOrder.customerInfo.city}
                          {activeOrder.customerInfo.postalCode
                            ? `, ${activeOrder.customerInfo.postalCode}`
                            : ""}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground font-medium">Payment Mode:</span>
                        <span className="font-black uppercase tracking-wider text-foreground bg-black/5 px-3 py-1 rounded-lg">
                          {activeOrder.paymentMethod === "cod"
                            ? "Cash on Delivery (COD)"
                            : activeOrder.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Card */}
                  <div className="rounded-2xl sm:rounded-3xl border border-black/5 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-4">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Order Assistance & Actions
                    </h4>

                    <a
                      href={`https://wa.me/923000421772?text=${encodeURIComponent(
                        `Salam Jinnah Hardware Store! I am tracking Order #${activeOrder.id}. Please give me an update on delivery schedule.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-4 text-sm sm:text-base font-black text-white shadow-md transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Inquire on WhatsApp</span>
                    </a>

                    <button
                      onClick={() => window.print()}
                      className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-black/10 hover:border-black bg-white px-6 py-4 text-sm sm:text-base font-black text-foreground transition-all cursor-pointer shadow-xs"
                    >
                      <Printer className="h-5 w-5 text-muted-foreground" />
                      <span>Print Receipt / Invoice</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveOrder(null);
                        setOrderIdInput("");
                        setPhoneInput("");
                        router.push("/track-order");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black/5 px-6 py-3.5 text-xs sm:text-sm font-bold text-muted-foreground transition-all hover:bg-black/10 hover:text-foreground cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Track Another Order</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
