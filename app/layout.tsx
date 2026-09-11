import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppChrome } from "@/components/providers/AppChrome";

import { JsonLd } from "@/components/seo/JsonLd";
import { TopTicker } from "@/components/navigation/TopTicker";
import PushNotificationManager from "@/components/notifications/PushNotificationManager";
import { Toaster } from "sonner";

const sansFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

const calligraphyFont = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-calligraphy",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jinnah-hardwarestore.com"),
  title: {
    default: "Jinnah Hardware Store - Premium Modern Hardware & Architectural Fittings",
    template: "%s | Jinnah Hardware Store",
  },
  description: "Pakistan's premium architectural hardware, biometric smart locks, luxury door fittings, cabinet hardware, and industrial tools. Fast nationwide delivery.",
  keywords: [
    "Jinnah Hardware Store",
    "Jinnah Hardware",
    "Hardware Store Pakistan",
    "Architectural Hardware",
    "Biometric Smart Locks",
    "Digital Door Locks",
    "Luxury Door Handles",
    "Cabinet Handles & Fittings",
    "Mortise Locksets",
    "Kitchen Accessories Pakistan",
    "Power Tools Online",
    "Hardware Store Hasilpur",
    "Hardware Store Bahawalpur",
    "Solid Brass Hardware",
  ],
  authors: [{ name: "Jinnah Hardware Store", url: "https://jinnah-hardwarestore.com" }],
  creator: "Jinnah Hardware Store",
  publisher: "Jinnah Hardware Store",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "https://jinnah-hardwarestore.com",
  },
  openGraph: {
    title: "Jinnah Hardware Store - Premium Modern Hardware & Fittings",
    description: "Pakistan's leading showroom for architectural door hardware, biometric locks, luxury cabinet fittings, and professional power tools.",
    url: "https://jinnah-hardwarestore.com/",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/jinnah-bottom.png",
        width: 1200,
        height: 630,
        alt: "Jinnah Hardware Store - Architectural Fittings & Smart Locks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jinnah Hardware Store - Premium Modern Hardware & Fittings",
    description: "Pakistan's leading showroom for architectural door hardware, biometric smart locks, and luxury cabinet fittings.",
    images: ["/jinnah-bottom.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon.png' },
      { url: '/favicon.ico' }
    ]
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sansFont.variable} ${serifFont.variable} ${calligraphyFont.variable} font-sans`}>
      <head>
        <JsonLd />
      </head>
      <body suppressHydrationWarning className="bg-[#faf9f6] text-[#1a1917] antialiased selection:bg-primary/20 selection:text-primary overflow-x-clip">
        <AppProvider>
          <TopTicker />
          <PushNotificationManager />
          <Toaster position="top-center" richColors theme="light" />
          {children}
          <AppChrome />
        </AppProvider>
      </body>
    </html>
  );
}
