"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/data/products";

export function FeaturedProductsCarousel({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 xl:gap-8 py-4">
      {products.map((product) => (
        <div key={product.id} className="w-full h-full">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
