import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Brands - Jinnah Hardware Store",
  description: "Discover the world-renowned manufacturers we represent. Uncompromising commitment to precision, durability, and aesthetic brilliance.",
  openGraph: {
    title: "Brands Portfolio - Jinnah Hardware",
    description: "Global partners and premium architectural hardware brands.",
    url: "https://jinnahhardware.com/brands",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
};

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
