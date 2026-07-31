import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppChrome } from "@/components/providers/AppChrome";

const sansFont = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Jinnah Hardware Store - Premium Modern Hardware & Fittings",
  description: "An elite architectural and industrial hardware experience. Premium door hardware, security, smart locks, cabinet fittings, and professional power tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sansFont.variable} font-sans scroll-smooth`}>
      <body suppressHydrationWarning className="bg-[#faf9f6] text-[#1a1917] antialiased selection:bg-primary/20 selection:text-primary">
        <AppProvider>
          {children}
          <AppChrome />
        </AppProvider>
      </body>
    </html>
  );
}
