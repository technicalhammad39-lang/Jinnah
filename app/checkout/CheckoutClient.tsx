"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Loader2, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCartState, useCartActions } from "@/context/AppContext";
import { getPublicUploadUrl } from "@/lib/utils";

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, cartSubtotal } = useCartState();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      const newOrderId = Date.now().toString(36).toUpperCase();
      
      const orderData = {
        id: newOrderId,
        customerInfo: formData,
        paymentMethod,
        items: cart,
        subtotal: cartSubtotal,
        total: cartSubtotal,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const ordersRef = collection(db, "orders");
      await addDoc(ordersRef, orderData);

      setOrderId(newOrderId);
      setOrderSuccess(true);
      clearCart();
      window.scrollTo(0, 0);

      // Optional: Redirect to WhatsApp to notify admin
      const text = `*New Order Alert!*
Order ID: #${newOrderId}
Name: ${formData.firstName} ${formData.lastName}
Total: Rs. ${cartSubtotal.toLocaleString()}
Status: Pending`;
      // We could use fetch to send an SMS or just let the DB handle it for now.
      
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-28 pb-20 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:mb-12">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Checkout</span>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Checkout Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <h1 className="mb-8 text-3xl font-extrabold text-foreground md:text-4xl">
              Secure Checkout
            </h1>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
              {/* Contact Information */}
              <section>
                <h2 className="mb-5 text-xl font-bold text-foreground">Contact Information</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                    <input
                      required
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                    <input
                      required
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      required
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                    <input
                      required
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0300 0000000"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h2 className="mb-5 text-xl font-bold text-foreground">Shipping Details</h2>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Complete Address</label>
                    <input
                      required
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="House/Office No, Street, Area"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</label>
                      <input
                        required
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="Lahore"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="postalCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Postal Code (Optional)</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="54000"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Notes (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section>
                <h2 className="mb-5 text-xl font-bold text-foreground">Payment Method</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-black/5 bg-white hover:border-black/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-5 w-5 cursor-pointer accent-primary"
                    />
                    <div>
                      <h4 className="text-sm font-bold">Cash on Delivery</h4>
                      <p className="text-xs text-muted-foreground">Pay when you receive</p>
                    </div>
                  </label>
                  
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-black/5 bg-white hover:border-black/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-5 w-5 cursor-pointer accent-primary"
                    />
                    <div>
                      <h4 className="text-sm font-bold">Bank Transfer</h4>
                      <p className="text-xs text-muted-foreground">Direct to our account</p>
                    </div>
                  </label>
                </div>
              </section>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32 rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
              <h3 className="mb-6 text-lg font-bold text-foreground">Order Summary</h3>
              
              <div className="mb-6 max-h-[320px] space-y-4 overflow-y-auto pr-2">
                {cart.map((item) => (
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
                        <span>•</span>
                        <span>{item.selectedSize}</span>
                      </div>
                      <div className="mt-1 font-bold">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-black/5 pt-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free Delivery</span>
                </div>
                <div className="my-2 h-[1px] bg-black/5" />
                <div className="flex justify-between text-lg font-extrabold text-foreground">
                  <span>Total</span>
                  <span>Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#faf9f6] p-4 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
                <p>
                  Secure checkout powered by industry standard encryption. Your data is safe.
                </p>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
