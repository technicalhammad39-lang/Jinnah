"use client";

import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
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

      <main className="flex-1 pt-24 pb-20">

        {/* HERO SECTION */}
        <section className="relative px-6 py-20 md:py-32 bg-black/[0.02]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                Get In <span className="text-primary font-stylish normal-case text-[1.1em]">Touch</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Whether you are an architect sourcing for a mega-project, or a homeowner looking for the perfect handle, our specialists are ready to assist.
            </motion.p>
          </div>
        </section>

        {/* CONTACT GRID */}
        <section className="py-20 px-6 max-w-[1740px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, i) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-white border border-black/5 text-center shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#1a1917] mb-2">{info.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line mb-6 flex-1">{info.desc}</p>

                  {info.action && info.href && (
                    <a href={info.href} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-[#1a1917] transition-colors mt-auto">
                      {info.action} &rarr;
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">

            {/* FORM */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
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
                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all bg-black/[0.02]" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input required type="email" className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all bg-black/[0.02]" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all bg-black/[0.02]" placeholder="+92 300 0000000" />
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Message</label>
                  <textarea required rows={5} className="w-full flex-1 px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all resize-none bg-black/[0.02]" placeholder="How can we help you?"></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full py-4 rounded-xl bg-[#1a1917] text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-auto"
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Message Sent</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-4 w-4" />
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d3403.497576551694!2d74.3312893151515!3d31.45549098139103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391906a23362a225%3A0xc3435fae1ea78233!2sTownship%20Hardware%20Market!5e0!3m2!1sen!2s!4v1689233054124!5m2!1sen!2s"
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
