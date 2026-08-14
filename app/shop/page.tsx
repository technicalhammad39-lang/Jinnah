export const dynamic = "force-dynamic";
import { getProducts, getBrands } from "@/lib/data-fetcher";
import ShopClientPage from "./ShopClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Jinnah Hardware Store",
  description: "Browse our extensive catalog of premium hardware, tools, and fittings.",
};

export default async function ShopServerPage() {
  const [products, brands] = await Promise.all([
    getProducts(),
    getBrands(),
  ]);

  return <ShopClientPage initialProducts={products} initialBrands={brands} />;
}

