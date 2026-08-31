import { CategoriesClient } from "./CategoriesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories | Jinnah Hardware Store",
  description: "Explore our premium architectural hardware categories.",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
