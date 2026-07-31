import React from "react";
import { getAllProducts } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen pb-16">
      <ProductGrid initialProducts={products} />
    </main>
  );
}

