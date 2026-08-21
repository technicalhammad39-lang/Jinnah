"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Loader2, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCartState, useCartActions } from "@/context/AppContext";
import { useAuth } from "@/lib/auth-context";
import { getPublicUploadUrl } from "@/lib/utils";
import { getPaymentMethods } from "@/lib/data-fetcher";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { calculateProductPrice } from "@/lib/discount-engine";

export default function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartSubtotal, cartDiscountTotal, cartFinalTotal, discounts } = useCartState();
  const { clearCart } = useCartActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

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

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="mb-3 text-3xl font-extrabold text-foreground">Order Confirmed!</h1>
            <p className="mb-2 text-muted-foreground">
              Thank you for choosing Jinnah Hardware Store. Your order has been successfully placed.
            </p>
            <div className="mb-8 rounded-lg bg-black/5 px-6 py-3 font-mono text-sm font-semibold">
              Order ID: #{orderId}
            </div>
            <Link
              href="/shop"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/95 hover:shadow-primary/25"
            >
              Continue Shopping
            </Link>
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
      <div className="mx-auto max-w-7xl px-4 md:px-6">
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
