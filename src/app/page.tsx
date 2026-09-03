import React, { Suspense } from "react";
import { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { HomeSeoSection } from "@/components/home/HomeSeoSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Insumos de Papelería Sublimable en Uruguay | Kamaluso",
  description:
    "Fabricantes de interiores y tapas sublimables de 350gr para agendas, libretas y blocks. Envíos diarios a Montevideo y todo Uruguay sin mínimo de compra.",
  alternates: {
    canonical: "https://www.kamaluso.com",
  },
  openGraph: {
    title: "Kamaluso | Insumos de Papelería Sublimable en Uruguay",
    description:
      "Fabricantes de interiores y tapas sublimables de 350gr para agendas, libretas y blocks. Envíos diarios a Montevideo y todo Uruguay.",
    url: "https://www.kamaluso.com",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Kamaluso Papelería Sublimable Uruguay",
      },
    ],
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Kamaluso Sublimación",
  "url": "https://www.kamaluso.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.kamaluso.com/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
        <ProductGrid initialProducts={products} />
      </Suspense>

      {/* Contenido Semántico de Autoridad y Cobertura Nacional */}
      <HomeSeoSection />
    </main>
  );
}
