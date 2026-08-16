"use client";

import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        read: false,
        createdAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      title: "Showroom Location",
      desc: "Opposite Gulbarag Town, Bahawalpur Road, Hasilpur",
      icon: MapPin,
      action: "Get Directions",
      href: "https://maps.google.com/?q=Jinnah+Hardware+Store",
    },
    {
      title: "Direct WhatsApp",
      desc: "+92 300 0421772",
      icon: Phone,
      action: "Message Us",
      href: "https://wa.me/923000421772",
    },
    {
      title: "Commercial Inquiries",
      desc: "info@jinnah-hardwarestore.com",
      icon: Mail,
      action: "Send Email",
      href: "mailto:info@jinnah-hardwarestore.com",
    },
    {
      title: "Operating Hours",
      desc: "Mon - Sat: 10:00 AM - 8:00 PM\nSunday: Closed",
      icon: Clock,
      action: null,
      href: null,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#faf9f6] flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pb-20">

        {/* HERO SECTION */}
        <section className="relative px-6 pt-32 pb-4 md:pt-48 md:pb-12 bg-transparent overflow-hidden">
          {/* Top Orange Dotted Gradient */}
          <div 
            className="absolute top-0 left-0 right-0 h-96 pointer-events-none z-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at center, #FF6A2A 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px',
              opacity: 0.5,
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            }}
          />

          <div className="relative z-10 max-w-[1740px] mx-auto w-full px-0 md:px-6 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="w-full md:w-1/2 space-y-6 text-center md:text-left pl-0 lg:pl-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                  Get In <span className="text-primary font-stylish normal-case text-[1.1em]">Touch</span>
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed font-medium"
              >
                Whether you are an architect sourcing for a mega-project, or a homeowner looking for the perfect handle, our specialists are ready to assist.
              </motion.p>
            </div>

            {/* Right Cartoon */}
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end">
              <motion.div
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-[500px] h-[300px] md:h-[450px]"
              >
                <Image 
                  src="/contact-cartoon.png" 
                  alt="Contact Cartoon" 
                  fill 
                  className="object-contain object-center md:object-right" 
                  priority 
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CONTACT GRID */}
        <section className="pt-8 pb-20 px-6 max-w-[1740px] mx-auto relative mt-0">
          {/* Top-down Orange Glow Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none -z-10 rounded-full blur-3xl opacity-60" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 relative z-10">
            {contactInfo.map((info, i) => {
              const Icon = info.icon;
              const CardWrapper = info.href ? 'a' : 'div';
              const wrapperProps = info.href ? { href: info.href, target: "_blank", rel: "noopener noreferrer" } : {};
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="h-full pt-10"
                >
                  <CardWrapper
                    {...wrapperProps}
                    className={`group relative p-8 md:p-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#202020]/95 via-[#171717]/95 to-[#111111]/95 text-center flex flex-col h-full transition-all duration-500 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.02)] ${info.href ? 'cursor-pointer hover:border-[#FF6A2A]/60 hover:shadow-[0_30px_80px_rgba(255,106,42,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:-translate-y-2 hover:scale-[1.02]' : ''}`}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-[#FF9A55] to-[#FF6A2A] shadow-[0_10px_25px_-5px_rgba(255,106,42,0.4)] text-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                      <Icon className="h-8 w-8 drop-shadow-md" />
                    </div>
                    
                    <div className="mt-6 flex-1 flex flex-col items-center justify-center space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">{info.title}</h3>
                      <p className="text-lg md:text-xl font-bold text-white whitespace-pre-line leading-snug">{info.desc}</p>
                    </div>
                  </CardWrapper>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">

            {/* FORM */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 md:p-12 rounded-[32px] border border-black/5 shadow-xl h-full flex flex-col"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight text-[#1a1917] mb-2">Send a Message</h2>
                <p className="text-sm text-muted-foreground">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all bg-black/[0.02]" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all bg-black/[0.02]" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all bg-black/[0.02]" placeholder="+92 300 0000000" />
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Message</label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full flex-1 px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all resize-none bg-black/[0.02]" placeholder="How can we help you?"></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitted || loading}
                  className="w-full py-4 rounded-xl bg-[#1a1917] text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-auto"
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Message Sent</span>
                    </>
                  ) : (
                    <>
                      <span>{loading ? "Sending..." : "Send Message"}</span>
                      {!loading && <Send className="h-4 w-4" />}
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* MAP */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] overflow-hidden border border-black/5 shadow-xl h-[500px] lg:h-auto min-h-[500px] bg-black/5"
            >
              <iframe
                src="https://maps.google.com/maps?q=Jinnah%20Hardware%20Store,%20Bahawalpur%20Road,%20Hasilpur&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-90 contrast-125 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              ></iframe>
            </motion.div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
