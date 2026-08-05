import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Premium Hardware - Jinnah Hardware Store",
  description: "Browse our extensive catalog of premium architectural hardware, luxury door locks, kitchen accessories, and industrial power tools.",
  openGraph: {
    title: "Shop - Jinnah Hardware Store",
    description: "Shop premium architectural hardware in Pakistan.",
    url: "https://jinnahhardware.com/shop",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
