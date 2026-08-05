import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { AboutSection } from "@/components/sections/AboutSection";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
