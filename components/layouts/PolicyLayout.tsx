import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <Navbar />
      
      <main className="flex-1 relative z-10 pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Glow */}
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full glow-blob-orange opacity-[0.08]" />

        <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
          <div className="space-y-4 mb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{lastUpdated}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#1a1917] uppercase leading-[0.95]">
              {title}
            </h1>
          </div>

          <div className="prose prose-sm md:prose-base prose-neutral max-w-none text-[#1a1917] leading-relaxed">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
