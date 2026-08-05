import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Jinnah Hardware Store",
  description: "Get in touch with our specialists for premium architectural hardware and commercial inquiries. Visit our showroom in Pakistan.",
  openGraph: {
    title: "Contact Jinnah Hardware Store",
    description: "Connect with Pakistan's premier architectural hardware supplier.",
    url: "https://jinnahhardware.com/contact",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
