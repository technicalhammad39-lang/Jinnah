import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { BrandsSection } from "@/components/sections/BrandsSection";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <BrandsSection />
      </main>
      <Footer />
    </div>
  );
}
