"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send, Phone, MessageSquare, Clock, MapPin, CheckCircle2, Loader2, ArrowRight
} from "lucide-react";

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
      alert("Please fill in all required fields (Name, Email, Message).");
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
      title: "Showroom Location",
      value: "Opposite Gulbarag Town, Bahawalpur Road, Hasilpur",
      linkText: "Get Directions →",
      href: "https://maps.google.com/?q=Jinnah+Hardware+Store+Hasilpur",
      icon: MapPin,
    },
    {
      title: "Direct WhatsApp",
      value: "+92 300 0421772",
      linkText: "Message Us →",
      href: "https://wa.me/923000421772",
      icon: MessageSquare,
    },
    {
      title: "Commercial Inquiries",
      value: "info@jinnah-hardwarestore.com",
      linkText: "Send Email →",
      href: "mailto:info@jinnah-hardwarestore.com",
      icon: Send,
    },
    {
      title: "Operating Hours",
      value: "Mon - Sat: 10:00 AM - 8:00 PM\nSunday: Closed",
      linkText: "",
      href: "",
      icon: Clock,
    },
  ];

  return (
    <section id="contact-section" className="py-24 md:py-32 bg-black/[0.01] border-y border-black/5 relative z-10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full glow-blob-orange opacity-[0.1]" />

      <div className="max-w-[1740px] mx-auto px-6 md:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">

          {/* Left Side: Contact Information & WhatsApp Links */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Direct Desk</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
                Get In Touch <br />
                <span className="text-primary">With Our Desk</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Whether you have a specific custom brass handle model in mind, need a commercial tools quote, or wish to schedule a physical walkthrough, contact our desk.
              </p>
            </div>

            {/* Quick Contact Desk options */}
            <div className="space-y-4">
              {contactOptions.map((opt) => {
                const OptIcon = opt.icon;
                return (
                  <div
                    key={opt.title}
                    className="group rounded-[1.5rem] md:rounded-[2rem] border border-white/10 transition-all duration-700 h-auto flex flex-col justify-start relative z-20 pt-12 pb-6 px-6 md:px-8 mt-6 bg-gradient-to-br from-[#202020]/95 via-[#171717]/95 to-[#111111]/95 backdrop-blur-2xl hover:border-[#FF6A2A]/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:-translate-y-1 hover:scale-[1.01] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.02)]"
                  >
                    <div 
                      className="absolute top-0 left-6 -translate-y-1/2 w-[54px] h-[54px] rounded-[1rem] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] backdrop-blur-xl bg-gradient-to-br from-[#FF9A55] to-[#FF6A2A] border border-white/20 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] rotate-6 group-hover:shadow-[0_12px_30px_-8px_rgba(255,106,42,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover:rotate-0 group-hover:scale-110"
                    >
                      <OptIcon className="h-6 w-6 transition-all duration-700 text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110" />
                    </div>
                    
                    <h4 className="font-extrabold text-sm md:text-base uppercase tracking-tight text-white mb-2">
                      {opt.title}
                    </h4>
                    <p className="text-xs md:text-sm leading-relaxed font-medium text-white/70 whitespace-pre-line mb-3">
                      {opt.value}
                    </p>
                    
                    {opt.href && (
                      <a
                        href={opt.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto text-xs font-bold text-[#FF6A2A] hover:text-white transition-colors"
                      >
                        {opt.linkText}
                      </a>
                    )}
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13601.597793740926!2d74.3259!3d31.5401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391904c000000000%3A0x0!2sJinnah+Hardware+Store!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
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
