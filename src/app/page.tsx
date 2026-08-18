import React, { Suspense } from "react";
import { getAllProducts } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
        <ProductGrid initialProducts={products} />
      </Suspense>
    </main>
  );
}
