import { CategoriesClient } from "./CategoriesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hardware Categories - Architectural & Door Fittings | Jinnah Hardware Store",
  description: "Browse hardware by category: architectural hardware, smart locks, door hardware, kitchen fittings, cabinet handles, and tools at Jinnah Hardware Store.",
  alternates: {
    canonical: "https://jinnah-hardwarestore.com/categories",
  },
  openGraph: {
    title: "Hardware Categories | Jinnah Hardware Store",
    description: "Browse architectural hardware, smart locks, door fittings, and kitchen accessories.",
    url: "https://jinnah-hardwarestore.com/categories",
    siteName: "Jinnah Hardware Store",
    images: [{ url: "/jinnah-bottom.png", width: 1200, height: 630, alt: "Categories" }],
  },
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
