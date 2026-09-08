"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
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
  ChevronRight, 
  Navigation, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Phone
} from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";
import { toast } from "sonner";

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
      setSearchInput(data.order.id);
    } catch (err: any) {
      console.error("Tracking error:", err);
      setErrorMessage(err.message || "Failed to locate order details. Please check and try again.");
      setActiveOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      setSearchInput(queryParam);
      fetchTracking(queryParam);
    }
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter an Order ID or Tracking Number");
      return;
    }
    fetchTracking(searchInput);
  };

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
    <div className="min-h-screen bg-[#faf9f6] pt-24 pb-24 md:pt-28">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Live Logistics Portal
            </span>
          </div>
        </div>

        {/* Hero Section & Search Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-[#11100e] text-white p-8 md:p-12 shadow-2xl mb-10">
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md mb-4">
              <Truck className="h-4 w-4 text-primary" />
              <span>Jinnah Express Tracking</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
              Track Your Shipment
            </h1>
            <p className="text-sm md:text-base text-white/70 mb-8">
              Real-time consignment status, warehouse processing, and courier milestones across Pakistan.
            </p>

            {/* Logistics Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative mx-auto max-w-xl">
              <div className="relative flex items-center rounded-2xl bg-white p-1.5 shadow-2xl shadow-black/40">
                <Search className="h-5 w-5 text-muted-foreground ml-3.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g. JH-ABCD-1234), Courier CN, or Phone"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-transparent px-3 py-3 text-sm font-medium text-[#11100e] outline-none placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary/95 disabled:opacity-70 shrink-0"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    <span>Track Order</span>
                  )}
                </button>
              </div>
            </form>

            {/* Quick helper chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/60">
              <span>Examples:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput("JH-");
                }}
                className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-white/80 hover:bg-white/20 transition-colors"
              >
                #JH-XXXX-XXXX
              </button>
              <span>•</span>
              <span>Courier CN (TCS / PostEx)</span>
              <span>•</span>
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
              className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/90 p-5 text-center text-rose-900 shadow-sm"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">Order Not Found</h4>
              <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{errorMessage}</p>
              <p className="text-[11px] text-rose-600/80 mt-2">
                Need help finding your order? Contact our support team directly on WhatsApp.
              </p>
              <div className="mt-3">
                <a
                  href={`https://wa.me/923000421772?text=${encodeURIComponent(
                    `Salam Jinnah Hardware Store! I need help tracking my order with reference: "${searchInput}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
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
            className="space-y-8"
          >
            {/* Top Bar with Status Badge and Order Header */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Consignment Order
                    </span>
                    <button
                      onClick={() => handleCopy(activeOrder.id, "order")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      {copiedTrackingId ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy ID
                        </>
                      )}
                    </button>
                  </div>
                  <h2 className="mt-1 font-mono text-2xl md:text-3xl font-extrabold text-foreground">
                    #{activeOrder.id}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed on:{" "}
                    <span className="font-semibold text-foreground">
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

                {/* Status Pill Badge */}
                <div className="flex flex-col sm:items-end gap-1.5">
                  <div className="flex items-center gap-2">
                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-800 border border-rose-200">
                        <AlertCircle className="h-4 w-4" /> Order Cancelled
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ${
                          activeOrder.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : activeOrder.status === "shipped" || activeOrder.status === "out_for_delivery"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
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
                  <p className="text-xs text-muted-foreground">
                    Estimated Delivery:{" "}
                    <span className="font-bold text-foreground">
                      {activeOrder.estimatedDelivery || "2-4 Business Days"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Cancelled Alert or Progress Stepper */}
              {isCancelled ? (
                <div className="my-8 rounded-2xl bg-rose-50 p-6 text-center border border-rose-100 text-rose-800">
                  <h4 className="font-bold text-base mb-1">This order has been cancelled</h4>
                  <p className="text-xs text-rose-600 max-w-lg mx-auto">
                    If this was a mistake or you wish to re-order, please get in touch with our customer service desk.
                  </p>
                </div>
              ) : (
                /* Multi-Stage Visual Stepper */
                <div className="py-8 md:py-12 px-2">
                  <div className="relative">
                    {/* Background track line */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-black/10 md:left-8 md:right-8" />

                    {/* Active progress fill line */}
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 md:left-8"
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
                            className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[120px]"
                          >
                            <div
                              className={`relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-4 border-white transition-all duration-500 shadow-md ${
                                isCompleted
                                  ? "bg-primary text-white scale-105"
                                  : "bg-black/10 text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                              {isCurrent && (
                                <span className="absolute -inset-1 rounded-full border-2 border-primary animate-ping opacity-60 pointer-events-none" />
                              )}
                            </div>

                            <p
                              className={`mt-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider leading-tight ${
                                isCompleted ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="hidden sm:block mt-1 text-[10px] text-muted-foreground leading-tight">
                              {step.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Courier Partner & Consignment Box (If Dispatched) */}
              {(activeOrder.courierName || activeOrder.trackingNumber) && (
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-black/5 text-primary shrink-0">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                            Logistics Partner
                          </span>
                          <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary">
                            {activeOrder.courierName || "Express Courier"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-sm font-mono font-bold text-foreground">
                            CN #{activeOrder.trackingNumber || "Assigned"}
                          </p>
                          {activeOrder.trackingNumber && (
                            <button
                              onClick={() => handleCopy(activeOrder.trackingNumber!, "courier")}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {copiedCourierCn ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
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
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-black/10 px-4 py-2.5 text-xs font-bold text-foreground shadow-sm hover:border-primary hover:text-primary transition-all"
                        >
                          <span>Track on {activeOrder.courierName} Portal</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                  </div>

                  {activeOrder.adminNotes && (
                    <div className="mt-4 pt-3 border-t border-primary/15 text-xs text-foreground/80">
                      <span className="font-bold text-foreground">Delivery Note: </span>
                      {activeOrder.adminNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Two Column Grid: Package Breakdown & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Order Items & Financials (7 cols) */}
              <div className="md:col-span-7 space-y-6">
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> Shipment Items ({activeOrder.items?.length || 0})
                  </h3>

                  <div className="divide-y divide-black/5">
                    {activeOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#efece6] border border-black/5">
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
                          <h4 className="line-clamp-1 text-sm font-bold text-foreground">
                            {item.name}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            {item.selectedSize && <span>• {item.selectedSize}</span>}
                            {item.selectedColor && (
                              <span
                                style={{ backgroundColor: item.selectedColor }}
                                className="inline-block h-2.5 w-2.5 rounded-full border border-black/20 ml-1"
                              />
                            )}
                          </div>
                          <p className="mt-1 text-xs font-mono font-bold text-foreground">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-6 pt-4 border-t border-black/10 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">
                        Rs. {activeOrder.subtotal?.toLocaleString()}
                      </span>
                    </div>
                    {activeOrder.discount ? (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount Applied</span>
                        <span className="font-semibold">
                          -Rs. {activeOrder.discount.toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span className="font-semibold text-emerald-600">
                        {activeOrder.shipping && activeOrder.shipping > 0
                          ? `Rs. ${activeOrder.shipping.toLocaleString()}`
                          : "Free Shipping"}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-black/5">
                      <span>Total Amount Payable</span>
                      <span className="text-primary font-mono">
                        Rs. {activeOrder.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Info & Quick Actions (5 cols) */}
              <div className="md:col-span-5 space-y-6">
                {/* Destination Card */}
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-bold text-foreground text-base">
                        {activeOrder.customerInfo.firstName} {activeOrder.customerInfo.lastName}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        Phone: {activeOrder.customerInfo.phone || "Protected"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#faf9f6] p-3.5 border border-black/5 text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{activeOrder.customerInfo.address}</p>
                      <p>
                        {activeOrder.customerInfo.city}
                        {activeOrder.customerInfo.postalCode
                          ? `, ${activeOrder.customerInfo.postalCode}`
                          : ""}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Payment Mode:</span>
                      <span className="font-bold uppercase tracking-wider text-foreground">
                        {activeOrder.paymentMethod === "cod"
                          ? "Cash on Delivery (COD)"
                          : activeOrder.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Card */}
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Order Assistance
                  </h4>

                  <a
                    href={`https://wa.me/923000421772?text=${encodeURIComponent(
                      `Salam Jinnah Hardware Store! I am tracking Order #${activeOrder.id}. Please give me an update on delivery schedule.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs md:text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>Inquire on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs md:text-sm font-bold text-foreground transition-all hover:bg-black/5"
                  >
                    <Printer className="h-4 w-4 text-muted-foreground" />
                    <span>Print Receipt / Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveOrder(null);
                      setSearchInput("");
                      router.push("/track-order");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black/5 px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-black/10 hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Track Another Order</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
