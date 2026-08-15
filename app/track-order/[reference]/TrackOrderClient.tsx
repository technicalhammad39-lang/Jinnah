"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Clock, PackageCheck, Truck, Loader2, MapPin } from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";

export default function TrackOrderClient({ reference }: { reference: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      if (!reference) return;
      try {
        const q = query(collection(db, "orders"), where("id", "==", reference));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setOrder({ dbKey: docSnap.id, ...docSnap.data() });
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrder();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500">
          <CheckCircle2 className="h-12 w-12 opacity-50" />
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-foreground">Order Not Found</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          We couldn't find an order with the reference number: <strong>{reference}</strong>
        </p>
        <Link
          href="/shop"
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/95"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const steps = [
    { id: "pending", label: "Order Placed", icon: Clock },
    { id: "processing", label: "Processing", icon: CheckCircle2 },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: PackageCheck },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status) !== -1 
    ? steps.findIndex(s => s.id === order.status) 
    : order.status === "cancelled" ? -1 : 0;

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-28 pb-20 md:pt-32">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>

        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground md:text-4xl">Track Your Order</h1>
          <p className="text-muted-foreground">Order Reference: <span className="font-mono font-bold text-black">#{order.id}</span></p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-10">
          
          {order.status === "cancelled" ? (
            <div className="mb-12 rounded-2xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
              <h3 className="text-xl font-bold mb-2">Order Cancelled</h3>
              <p className="text-sm">This order has been cancelled. Please contact support for more information.</p>
            </div>
          ) : (
            <div className="mb-16">
              <div className="relative">
                <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-black/5"></div>
                <div 
                  className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>
                
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-3">
                        <div className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-4 sm:border-[6px] border-white transition-colors duration-500 ${
                          isCompleted ? "bg-primary text-white" : "bg-black/10 text-muted-foreground"
                        }`}>
                          <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${isActive && "animate-pulse"}`} />
                        </div>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${
                          isCompleted ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <h3 className="mb-6 text-lg font-bold">Delivery Details</h3>
              <div className="space-y-4 rounded-2xl bg-black/5 p-6">
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{order.customerInfo.address}</p>
                    <p className="text-sm text-muted-foreground">{order.customerInfo.city}, {order.customerInfo.postalCode}</p>
                    <p className="mt-2 text-sm font-mono text-muted-foreground">{order.customerInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-lg font-bold">Order Summary</h3>
              <div className="space-y-4 rounded-2xl border border-black/5 p-6">
                <div className="max-h-[240px] space-y-4 overflow-y-auto pr-2">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#efece6]">
                        <Image
                          src={item.product.images?.[0] ? getPublicUploadUrl(item.product.images[0]) : "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} | {item.selectedSize}
                        </p>
                      </div>
                      <div className="text-sm font-bold">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 border-t border-black/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">Rs. {order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-black/10">
                    <span>Total</span>
                    <span>Rs. {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
