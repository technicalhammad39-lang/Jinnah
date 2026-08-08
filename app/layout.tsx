import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppChrome } from "@/components/providers/AppChrome";

import { JsonLd } from "@/components/seo/JsonLd";
import { AuthProvider } from "@/lib/auth-context";
import PushNotificationManager from "@/components/notifications/PushNotificationManager";

const sansFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jinnah Hardware Store - Premium Modern Hardware & Fittings",
  description: "An elite architectural and industrial hardware experience. Premium door hardware, security, smart locks, cabinet fittings, and professional power tools.",
  keywords: ["architectural hardware", "smart locks", "door fittings", "power tools", "Jinnah Hardware Store", "premium hardware Pakistan"],
  openGraph: {
    title: "Jinnah Hardware Store",
    description: "Premium Modern Hardware & Architectural Fittings.",
    url: "https://jinnahhardware.com",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sansFont.variable} ${serifFont.variable} font-sans`}>
      <head>
        <JsonLd />
      </head>
      <body suppressHydrationWarning className="bg-[#faf9f6] text-[#1a1917] antialiased selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <AppProvider>
            <PushNotificationManager />
            {children}
            <AppChrome />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
