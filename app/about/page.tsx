"use client";

import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import Image from "next/image";
import { motion } from "motion/react";
import { User, ShieldCheck, Briefcase, Target, Trophy, Clock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPublicUploadUrl } from "@/lib/utils";

export default function AboutPage() {
  const [leadership, setLeadership] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeadership() {
      try {
        const q = query(collection(db, "leadership"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        setLeadership(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching leadership:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeadership();
  }, []);
  const stats = [
    { label: "Years of Trust", value: "15+" },
    { label: "Premium Brands", value: "24" },
    { label: "Projects Supplied", value: "500+" },
    { label: "Expert Consultants", value: "12" },
  ];

  const timeline = [
    { year: "2010", title: "The Foundation", desc: "Jinnah Hardware started as a specialized local vendor in Lahore's historic market, initially focusing on providing highly durable architectural fittings for robust local construction projects." },
    { year: "2015", title: "Luxury Expansion", desc: "Expanded the catalog to include premium Italian and German brands, exclusively catering to luxury homes and establishing partnerships with top-tier international manufacturers." },
    { year: "2020", title: "Smart Integration", desc: "Introduced advanced smart security solutions and digital access control systems, becoming a certified and trusted dealer for major global biometric lock brands." },
    { year: "2026", title: "Industry Leader", desc: "Recognized as a premier, uncompromising supplier for Pakistan's elite architectural and commercial projects, trusted by the nation's most discerning contractors." }
  ];

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative px-6 pt-32 pb-4 md:pt-48 md:pb-12 bg-transparent overflow-hidden min-h-[60vh] flex flex-col justify-center">
          {/* Top Orange Dotted Gradient */}
          <div 
            className="absolute top-0 left-0 right-0 h-96 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at center, #FF6A2A 1.5px, transparent 1.5px)', backgroundSize: '24px 24px', opacity: 0.5 }}
          />
          
          <div className="relative z-10 max-w-5xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                Elevating <br className="hidden md:block" /><span className="text-primary font-stylish normal-case text-[1.1em]">Architecture</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium mt-6 md:mt-8"
            >
              Pakistan's premier destination for luxury architectural hardware.
            </motion.p>
          </div>
        </section>

        {/* FOUNDER STORY */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 bg-white rounded-t-[3rem] md:rounded-t-[4rem] relative overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.03)] -mt-12 z-20">
          {/* Top Orange Gradient */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/15 to-transparent pointer-events-none" />
          
          <div className="max-w-[1920px] mx-auto px-6 relative z-10">
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : leadership.length > 0 ? (
              leadership.map((member, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={member.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${index !== leadership.length - 1 ? 'mb-24 md:mb-32' : ''}`}>
                    <div className={`relative ${isEven ? '' : 'order-1 lg:order-2'}`}>
                      {/* Rotated Orange Shape Behind Image */}
                      <div className="absolute -top-4 -right-10 -bottom-8 -left-6 bg-primary rounded-[3rem] -rotate-6 z-0 shadow-lg" />
                      
                      <div className={`relative z-10 h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-black/5 shadow-2xl ring-4 ring-white`}>
                        {member.image ? (
                          <Image src={getPublicUploadUrl(member.image)} alt={member.name} fill className="object-cover object-top" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className={`absolute bottom-8 text-white ${isEven ? 'left-8' : 'right-8 text-right'}`}>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1">{member.role}</p>
                          <p className="text-3xl font-black">{member.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`space-y-8 ${isEven ? '' : 'order-2 lg:order-1'}`}>
                      <div className="space-y-4">
                        <h2 className="text-3xl font-extrabold uppercase tracking-tight">{member.name}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {member.description1}
                        </p>
                        {member.description2 && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {member.description2}
                          </p>
                        )}
                      </div>
                      <div className="relative mt-8 md:mt-12">
                        {/* Rotated Orange Shape Behind Options */}
                        <div className="absolute inset-0 bg-primary rounded-3xl -rotate-6 sm:-rotate-3 z-0 scale-[1.03] shadow-md" />
                        
                        <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-6 p-5 sm:p-6 bg-white rounded-3xl shadow-sm border border-black/5">
                          {member.feature1Title && (
                            <div className="space-y-2">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                              <p className="text-xs font-bold uppercase tracking-widest">{member.feature1Title}</p>
                            </div>
                          )}
                          {member.feature2Title && (
                            <div className="space-y-2">
                              <Briefcase className="h-5 w-5 text-primary" />
                              <p className="text-xs font-bold uppercase tracking-widest">{member.feature2Title}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>Leadership profiles will appear here.</p>
              </div>
            )}
          </div>
        </section>

        {/* TIMELINE SECTION */}
        <section className="py-24 px-6 max-w-[1920px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter text-[#1a1917]">Our Journey</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto font-medium">A legacy of precision and growth over the decades.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-8">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-6 lg:pl-0 lg:pt-8 border-l-2 lg:border-l-0 lg:border-t-2 border-primary/20 hover:border-primary transition-colors duration-300"
              >
                <div className="absolute left-[-9px] lg:left-0 lg:top-[-9px] w-4 h-4 rounded-full bg-primary ring-4 ring-[#faf9f6]" />
                <h3 className="font-black text-3xl mb-1 text-primary">{item.year}</h3>
                <h4 className="font-extrabold text-lg uppercase tracking-tight text-[#1a1917] mb-3">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>



        {/* CTA */}
        <section className="py-20 px-6 bg-primary/5 border-y border-primary/10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
              Ready to elevate your project?
            </h2>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#1a1917] text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all">
              <span>Contact Our Desk</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
