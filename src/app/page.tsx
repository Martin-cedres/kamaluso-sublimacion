import React, { Suspense } from "react";
import { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Kamaluso | Fábrica de Insumos de Papelería Sublimable en Uruguay",
  description:
    "Fabricantes directos en San José, Uruguay de insumos de papelería sublimable: agendas 2027 y perpetuas, libretas, cuadernos, planners y tapas de 350gr con espiral. Venta por mayor y menor sin mínimo. Envíos a todo el país.",
  alternates: {
    canonical: "https://www.kamaluso.com",
  },
  keywords: [
    "Kamaluso",
    "fábrica de papelería sublimable en Uruguay",
    "tapas de cartón cristal 350gr",
    "interiores impresos",
    "agendas 2027 para sublimar",
    "venta mayorista papeleria sublimable",
    "insumos sublimacion uruguay",
    "san jose de mayo",
  ],
  openGraph: {
    title: "Kamaluso | Fábrica de Insumos de Papelería Sublimable en Uruguay",
    description:
      "Fabricantes directos en San José, Uruguay de insumos de papelería sublimable: agendas 2027 y perpetuas, libretas, cuadernos, planners y tapas de 350gr con espiral. Venta por mayor y menor sin mínimo.",
    url: "https://www.kamaluso.com",
    siteName: "Kamaluso Papelería Sublimable",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Kamaluso Fábrica de Insumos de Papelería Sublimable en Uruguay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamaluso | Fábrica de Insumos de Papelería Sublimable en Uruguay",
    description:
      "Fabricantes directos de insumos de papelería sublimable en San José de Mayo, Uruguay. Agendas 2027, libretas y tapas de 350gr.",
    images: ["https://www.kamaluso.com/agenda_fondo_kamaluso.jpg"],
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Kamaluso",
  "url": "https://www.kamaluso.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.kamaluso.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
        <ProductGrid initialProducts={products} />
      </Suspense>
    </div>
  );
}
