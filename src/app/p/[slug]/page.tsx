import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import { ChevronRight, ArrowLeft, ShieldCheck, Truck, PackageCheck } from "lucide-react";
import { AddToCartDetail } from "./AddToCartDetail";
import { ProductGallery } from "./ProductGallery";


export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  const productUrl = `https://www.kamaluso.com/p/${product.slug}/`;

  return {
    title: `${product.name} | Interiores Sublimables Kamaluso`,
    description: product.description,
    alternates: {
      canonical: productUrl,
    },
    keywords: [
      product.name,
      "insumos sublimables Uruguay",
      "papeleria sublimacion",
      "interiores de agenda para sublimar",
      product.category,
    ],
    openGraph: {
      title: product.name,
      description: product.description,
      url: productUrl,
      type: "article",
      images: [
        {
          url: (product.images && product.images.length > 0 && product.images[0]) || "/agenda_fondo_kamaluso.jpg",
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Schema.org JSON-LD para Google Shopping y Rich Snippets B2B
  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Kamaluso",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.kamaluso.com/p/${product.slug}/`,
      priceCurrency: product.currency,
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Kamaluso Sublimación",
      },
    },
  };

  // Schema FAQ específico de producto para GEO (AI indexing)
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `¿Cuáles son los parámetros recomendados para sublimar ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Se recomienda estampación en prensa plana de calor a 170ºC - 180ºC durante 120 segundos con presión media a alta."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es el tiempo de despacho y envío a departamentos de Uruguay?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El tiempo de preparación estimado es de 48 horas hábiles. Realizamos envíos a todo Uruguay desde San José de Mayo mediante agencias de transporte."
        }
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-3">
      {/* Scripts JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 py-1">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/#catalogo" className="hover:text-brand-600 uppercase transition-colors">
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Product Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-start bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
        {/* Left: Image gallery (Sticky en desktop) */}
        <div className="lg:sticky lg:top-24 self-start">
          <ProductGallery
            images={product.images}
            productName={product.name}
            badge={product.badge}
          />
        </div>


        {/* Right: Info and Purchase */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Insumo de Papelería Sublimable
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Precio Unitario</span>
              <span className="text-3xl font-black text-slate-900">
                ${product.price}{" "}
                <span className="text-base font-normal text-slate-500">UYU</span>
              </span>
            </div>
            {product.comparativePrice && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Precio Anterior</span>
                <span className="text-lg text-slate-400 line-through font-bold">
                  ${product.comparativePrice} UYU
                </span>
              </div>
            )}
          </div>
          {/* Description con tipografía Open Sans estilo Webnode */}
          <div className="product-description-text space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {product.description.split(". ").map((paragraph, index) => (
              <p key={index} className="text-slate-700">
                {paragraph}{index < product.description.split(". ").length - 1 ? "." : ""}
              </p>
            ))}
          </div>


          {/* Bloque Destacado de Parámetros de Sublimación */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2">
            <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              🔥 Parámetros de Estampado Recomendados
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-amber-950">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-400 block text-[10px]">Temperatura</span>
                <span className="text-base font-black text-amber-700">170 ºC</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-400 block text-[10px]">Tiempo Prensa Plana</span>
                <span className="text-base font-black text-amber-700">120 segundos</span>
              </div>
            </div>
          </div>

          {/* Políticas de Elaboración y Envíos */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Información de Envío y Elaboración</span>
            </div>
            <ul className="space-y-1 text-slate-600 pl-5 list-disc">
              <li><strong>Sin mínimo de compra</strong>. Envíos a todo el Uruguay.</li>
              <li>Despacho estimado en aproximado <strong>48hs</strong>.</li>
              <li>La elaboración inicia al recibir el <strong>comprobante de pago</strong>.</li>
              <li>Para pedidos mayores a <strong>$2.500 UYU</strong>, consultar tiempo de preparación.</li>
            </ul>
          </div>



          {/* Add to Cart Component */}
          <AddToCartDetail product={product} />

          {/* Specs / Guarantees for Sublimators */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2.5">
              <PackageCheck className="w-4 h-4 text-brand-600" />
              <span>Apto para Prensa de Calor Plana</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantía de Calidad en Papel e Impresión</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-purple-600" />
              <span>Despacho rápido a todo el país</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
