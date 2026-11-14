import React, { Suspense } from "react";
import { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { getFaqSchema } from "@/lib/schema";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Flame } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kamaluso | Fábrica de Insumos de Papelería Sublimable en Uruguay",
  description:
    "Fábrica especialista en San José con el mayor catálogo de papelería sublimable en Uruguay (+26 modelos) y stock todo el año. Kits, interiores por separado y tapas 350gr de repuesto sin mínimo. Envíos a todo el país.",
  alternates: {
    canonical: "https://www.kamaluso.com",
  },
  keywords: [
    "Kamaluso",
    "fábrica de papelería sublimable en Uruguay",
    "mayor catálogo papelería sublimable Uruguay",
    "tapas de cartón cristal 350gr",
    "tapas sublimables de repuesto",
    "interiores impresos",
    "interiores de agendas por separado",
    "agendas 2027 para sublimar",
    "stock papelería sublimable todo el año",
    "venta mayorista papeleria sublimable",
    "insumos sublimacion uruguay",
    "san jose de mayo",
  ],
  openGraph: {
    title: "Kamaluso | Fábrica de Insumos de Papelería Sublimable en Uruguay",
    description:
      "Fábrica especialista en San José, Uruguay con el mayor catálogo de papelería sublimable (+26 modelos) y stock todo el año. Kits completos, interiores de agendas por separado y tapas 350gr de repuesto sin mínimo. Envíos a todo el país.",
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
      "Fábrica en San José con el mayor catálogo de papelería sublimable en Uruguay (+26 modelos) y stock todo el año. Kits, interiores y tapas 350gr de repuesto sin mínimo.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqSchema()) }}
      />

      {/* Hero Section B2B (Server-rendered para LCP instantáneo en Google PageSpeed) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 pb-6 sm:pt-16 sm:pb-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4 text-brand-600" />
            Fabricantes Directos en San José
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Fábrica de Insumos de Papelería <span className="text-brand-600">Sublimable</span> en Uruguay
          </h1>

          <p className="text-base sm:text-lg text-slate-700 max-w-3xl mx-auto font-normal leading-relaxed">
            En <strong>Kamaluso</strong> somos fabricantes directos y especialistas en papelería sublimable en San José de Mayo, con <strong>el mayor catálogo de Uruguay (+26 modelos)</strong> y <strong>stock disponible todo el año (365 días)</strong>. Proveemos tapas de cartón cristal de 350gr con polímero virgen en <strong>kits completos listos para armar, interiores de agendas por separado y tapas sublimables de repuesto por separado</strong> para que nunca tengas que desechar tu producto ante errores de estampado. Venta por mayor y menor sin mínimo de compra con envíos a Montevideo y los 19 departamentos.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[400px] bg-slate-50/50" />}>
        <ProductGrid initialProducts={products} />
      </Suspense>
    </div>
  );
}
