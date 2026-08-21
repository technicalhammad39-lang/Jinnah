"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send, Phone, MessageSquare, Clock, MapPin, CheckCircle2, Loader2, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setIsSubmitting(true);
    submitTimerRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      resetTimerRef.current = window.setTimeout(() => setIsSuccess(false), 5000);
    }, 1200);
  };

  const contactOptions = [
    {
      title: "Shop Location",
      value: "Opposite Gulbarag Town, Bahawalpur Road, Hasilpur",
      icon: MapPin,
    },
    {
      title: "Direct WhatsApp",
      value: "+92 300 0421772",
      icon: MessageSquare,
    },
    {
      title: "Commercial Inquiries",
      value: "info@jinnah-hardwarestore.com",
      icon: Send,
    },
    {
      title: "Operating Hours",
      value: "Mon - Sun: 8:00 AM - 8:00 PM",
      icon: Clock,
    },
  ];

  return (
    <section id="contact-section" className="py-24 md:py-32 bg-black/[0.01] border-y border-black/5 relative z-10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.1]" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">

          {/* Left Side: Contact Information & WhatsApp Links */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Direct Desk</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] leading-[0.95]">
                Get In Touch <br />
                <span className="text-primary">With Our Desk</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Whether you have a specific custom brass handle model in mind, need a commercial tools quote, or wish to schedule a physical walkthrough, contact our desk.
              </p>
            </div>

            {/* Quick Contact Desk options */}
            <div className="space-y-6 mt-8">
              {contactOptions.map((opt) => {
                const OptIcon = opt.icon;
                return (
                  <div
                    key={opt.title}
                    className="group flex items-start gap-5 transition-all duration-500"
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center transition-all duration-500 bg-black/5 text-[#1a1917] group-hover:bg-primary group-hover:text-white group-hover:-translate-y-1 shadow-sm"
                    >
                      <OptIcon className="h-5 w-5 transition-colors" />
                    </div>

                    <div className="pt-0.5">
                      <h4 className="font-extrabold text-sm md:text-[15px] uppercase tracking-tight text-[#1a1917] mb-1">
                        {opt.title}
                      </h4>
                      <p className="text-sm leading-relaxed font-medium text-muted-foreground whitespace-pre-line">
                        {opt.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Inquiry Form with dynamic success states */}
          <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[32px] shadow-xl border border-black/5 text-left relative flex flex-col justify-center h-full">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="form-name" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                        Full Name <span className="text-primary">*</span>
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4.5 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium bg-black/[0.01]"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="form-email" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                        Email Address <span className="text-primary">*</span>
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4.5 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium bg-black/[0.01]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="form-phone" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="form-phone"
                      type="tel"
                      placeholder="e.g., 0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4.5 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium bg-black/[0.01]"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="form-message" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                      Detailed Message / Bill of Material specs <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="form-message"
                      required
                      rows={4}
                      placeholder="What specifications or quantity sizes are you drafting?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4.5 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium bg-black/[0.01] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      id="submit-inquiry-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-full bg-[#1a1917] hover:bg-primary text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-primary/20 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          <span>Routing Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send Inquiry Desk</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground uppercase tracking-tight">
                      Inquiry Dispatched Successfully
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-2 font-medium leading-relaxed">
                      Thank you for contacting Jinnah Hardware Store. Our technical estimators have registered your ticket and will follow up via email or phone within 2 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 px-6 py-2.5 rounded-full border border-black/10 hover:border-[#1a1917] hover:bg-black/5 text-[#1a1917] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Submit New Inquiry</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Full-Width Premium Edge-to-Edge Map */}
        <div className="mt-16 md:mt-24 w-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-[#efece6] h-[400px] md:h-[500px] relative">
          <iframe
            src="https://maps.google.com/maps?q=Jinnah%20Hardware%20Store,%20Bahawalpur%20Road,%20Hasilpur&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="filter contrast-100 saturate-100"
          />
        </div>
      </div>
    </section>
  );
}
