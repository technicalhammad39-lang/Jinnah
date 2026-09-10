export const dynamic = "force-dynamic";
import { getBrands } from "@/lib/data-fetcher";
import BrandsClient from "./BrandsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hardware Brands - Trusted Architectural Partners | Jinnah Hardware Store",
  description: "Discover top-tier international and local architectural hardware brands at Jinnah Hardware Store. Premium locks, fittings, and power tools.",
  alternates: {
    canonical: "https://jinnah-hardwarestore.com/brands",
  },
  openGraph: {
    title: "Hardware Brands | Jinnah Hardware Store",
    description: "Explore our curated collection of architectural and industrial hardware brands.",
    url: "https://jinnah-hardwarestore.com/brands",
    siteName: "Jinnah Hardware Store",
    images: [{ url: "/jinnah-bottom.png", width: 1200, height: 630, alt: "Trusted Hardware Brands" }],
  },
};

export default async function BrandsServerPage() {
  const brands = await getBrands();

  return <BrandsClient initialBrands={brands} />;
}

