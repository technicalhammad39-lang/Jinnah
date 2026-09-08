"use client";

import { useEffect, useState } from "react";
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
  RotateCcw
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
  const queryParam = searchParams.get("id") || searchParams.get("query") || initialReference;

  const [searchInput, setSearchInput] = useState(queryParam || "");
  const [activeOrder, setActiveOrder] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [copiedCourierCn, setCopiedCourierCn] = useState(false);

  // Fetch order tracking from API
  const fetchTracking = async (term: string) => {
    if (!term || !term.trim()) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(term.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order not found with provided tracking reference.");
      }

      setActiveOrder(data.order);
      setErrorMessage("");
    } catch (err: any) {
      setActiveOrder(null);
      setErrorMessage(err.message || "Unable to retrieve order details. Please double-check your ID.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on queryParam change
  useEffect(() => {
    if (queryParam && queryParam.trim()) {
      setSearchInput(queryParam.trim());
      fetchTracking(queryParam.trim());
    }
  }, [queryParam]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter an Order ID or Courier CN to track");
      return;
    }

    router.push(`/track-order?id=${encodeURIComponent(searchInput.trim())}`);
    fetchTracking(searchInput.trim());
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

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col justify-between overflow-x-hidden">
      {/* Site Navigation */}
      <Navbar />

      {/* Main Track Order Content */}
      <main className="flex-1 w-full pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-28">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          
          {/* Navigation Breadcrumb */}
          <div className="mb-6 sm:mb-8 flex items-center justify-start">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Store</span>
            </Link>
          </div>

          {/* Hero Section & Search Bar - Full-Width Edge to Edge */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] bg-[#11100e] text-white p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 shadow-2xl mb-10 sm:mb-14">
            <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-5 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/90 backdrop-blur-md mb-5 sm:mb-6 border border-white/10 shadow-sm">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span>Jinnah Express Tracking Portal</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4 sm:mb-6 leading-tight">
                Track Your Shipment
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-12 max-w-3xl mx-auto font-normal leading-relaxed">
                Real-time consignment status, warehouse processing, and courier milestones across Pakistan.
              </p>

              {/* Logistics Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative mx-auto max-w-3xl w-full">
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-3xl bg-white p-2 sm:p-2.5 shadow-2xl shadow-black/60 gap-2 sm:gap-0">
                  <Search className="h-6 w-6 text-muted-foreground ml-4 hidden sm:block shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter Order ID (e.g. #JH-XXXX-XXXX), Courier CN, or Phone"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-transparent px-4 py-3.5 sm:py-5 text-base sm:text-lg font-bold text-[#11100e] outline-none placeholder:text-muted-foreground/60 placeholder:font-normal"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-primary px-8 sm:px-12 py-3.5 sm:py-5 text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-white shadow-xl transition-all hover:bg-primary/95 disabled:opacity-70 shrink-0"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Searching...
                      </span>
                    ) : (
                      <span>Track Order</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick helper chips */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/70">
                <span className="font-semibold">Examples:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("JH-");
                  }}
                  className="rounded-full bg-white/10 px-3.5 py-1 font-mono text-xs sm:text-sm text-white hover:bg-white/20 transition-colors border border-white/15 cursor-pointer font-bold"
                >
                  #JH-XXXX-XXXX
                </button>
                <span className="text-white/40">•</span>
                <span>Courier CN (TCS / PostEx / Trax)</span>
                <span className="text-white/40">•</span>
                <span>Customer Phone Number</span>
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
                      `Salam Jinnah Hardware Store! I need help tracking my order with reference: "${searchInput}".`
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
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-2">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-rose-800 border border-rose-200 shadow-sm">
                          <AlertCircle className="h-5 w-5" /> Order Cancelled
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2.5 rounded-full px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider shadow-sm ${
                            activeOrder.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : activeOrder.status === "shipped" || activeOrder.status === "out_for_delivery"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                          {activeOrder.status === "delivered"
                            ? "Delivered Successfully"
                            : activeOrder.status === "shipped"
                            ? "In Transit (Shipped)"
                            : activeOrder.status === "out_for_delivery"
                            ? "Out for Delivery"
                            : activeOrder.status === "processing"
                            ? "In Warehouse / Packing"
                            : "Order Placed & Pending"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                      Estimated Delivery:{" "}
                      <span className="font-black text-foreground text-sm sm:text-base md:text-lg">
                        {activeOrder.estimatedDelivery || "2-4 Business Days"}
                      </span>
                    </p>
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
                  <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-8 bg-[#faf9f6] rounded-2xl sm:rounded-3xl border border-black/5 mt-8 overflow-x-auto custom-scrollbar">
                    <div className="min-w-[650px] sm:min-w-0">
                      <div className="relative">
                        {/* Background track line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-2 sm:h-3 rounded-full bg-black/10 md:left-12 md:right-12" />

                        {/* Active progress fill line */}
                        <div
                          className="absolute left-6 top-1/2 -translate-y-1/2 h-2 sm:h-3 rounded-full bg-gradient-to-r from-primary via-amber-500 to-emerald-500 transition-all duration-700 md:left-12"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, (currentStepIndex / (steps.length - 1)) * 100)
                            )}%`,
                          }}
                        />

                        {/* Step milestones */}
                        <div className="relative flex justify-between">
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            const Icon = step.icon;

                            return (
                              <div
                                key={step.id}
                                className="flex flex-col items-center text-center max-w-[120px] sm:max-w-[150px]"
                              >
                                <div
                                  className={`relative flex h-14 w-14 sm:h-18 sm:w-18 md:h-22 md:w-22 items-center justify-center rounded-full border-4 sm:border-[6px] border-white transition-all duration-500 shadow-xl ${
                                    isCompleted
                                      ? "bg-primary text-white scale-105"
                                      : "bg-black/10 text-muted-foreground"
                                  }`}
                                >
                                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                                  {isCurrent && (
                                    <span className="absolute -inset-1.5 rounded-full border-2 sm:border-3 border-primary animate-ping opacity-60 pointer-events-none" />
                                  )}
                                </div>

                                <p
                                  className={`mt-4 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider leading-tight ${
                                    isCompleted ? "text-foreground" : "text-muted-foreground"
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
                  </div>
                )}

                {/* Courier Partner & Consignment Box (If Dispatched) */}
                {(activeOrder.courierName || activeOrder.trackingNumber) && (
                  <div className="mt-8 rounded-2xl sm:rounded-3xl border-2 border-primary/25 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-amber-500/5 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white shadow-md border border-primary/20 text-primary shrink-0">
                          <Truck className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-primary">
                              Logistics Courier Partner
                            </span>
                            <span className="rounded-md bg-primary/20 px-2.5 py-0.5 text-xs font-black uppercase text-primary">
                              {activeOrder.courierName || "Express Courier"}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-3">
                            <p className="text-base sm:text-lg md:text-xl font-mono font-black text-foreground">
                              CN #{activeOrder.trackingNumber || "Assigned"}
                            </p>
                            {activeOrder.trackingNumber && (
                              <button
                                onClick={() => handleCopy(activeOrder.trackingNumber!, "courier")}
                                className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-black/10 shadow-xs"
                              >
                                {copiedCourierCn ? (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                <span>Copy CN</span>
                              </button>
                            )}
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
                            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white border border-black/10 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-black text-foreground shadow-md hover:border-primary hover:text-primary transition-all"
                          >
                            <span>Track on {activeOrder.courierName} Portal</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                    </div>

                    {activeOrder.adminNotes && (
                      <div className="mt-5 pt-4 border-t border-primary/15 text-xs sm:text-sm text-foreground/85">
                        <span className="font-bold text-foreground">Special Delivery Note: </span>
                        {activeOrder.adminNotes}
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
                        setSearchInput("");
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
