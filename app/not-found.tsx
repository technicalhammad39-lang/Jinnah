import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-32 px-6 relative z-10 text-center mt-20">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full glow-blob-orange opacity-[0.1]" />
        
        <h1 className="text-[120px] md:text-[200px] font-black tracking-tighter text-[#1a1917] leading-none mb-4">
          404
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
          Page Not Found
        </div>
        <p className="max-w-md text-sm md:text-base font-medium text-muted-foreground mb-10 leading-relaxed">
          The architectural hardware you are looking for does not exist in our current catalog or has been moved.
        </p>
        <Link
          href="/"
          className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1a1917] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl transition-all duration-300 hover:bg-primary"
        >
          <span>Return To Showroom</span>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
