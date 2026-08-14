export const dynamic = "force-dynamic";
import { getBrands } from "@/lib/data-fetcher";
import BrandsClient from "./BrandsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brands | Jinnah Hardware Store",
  description: "Explore our curated collection of world-class architectural and industrial hardware brands.",
};

export default async function BrandsServerPage() {
  const brands = await getBrands();

  return <BrandsClient initialBrands={brands} />;
}

