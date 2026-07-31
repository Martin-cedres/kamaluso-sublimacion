import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, CATEGORIES } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { ChevronRight, Layers, Sparkles } from "lucide-react";

export async function generateStaticParams() {
  return CATEGORIES.filter((c) => c.id !== "todos").map((cat) => ({
    slug: cat.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.id === slug);

  if (!category || slug === "todos") return {};

  const title = `${category.name} para Sublimación en Uruguay | Kamaluso`;
  const description = `Comprar ${category.name.toLowerCase()} para sublimar y personalizar al por mayor y menor. Fabricación y envíos rápidos a todo Uruguay desde San José.`;
  const canonicalUrl = `https://www.kamaluso.com/categoria/${slug}/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      `${category.name.toLowerCase()} sublimables uruguay`,
      `comprar ${category.name.toLowerCase()} sublimacion`,
      "insumos para sublimar san jose",
      "papeleria sublimable por mayor",
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.id === slug);

  if (!category || slug === "todos") {
    notFound();
  }

  const allProducts = await getAllProducts();
  const categoryProducts = allProducts.filter((p) => p.category === slug);

  // Schema.org ItemList para la categoría
  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category.name} Sublimables`,
    "description": `Catálogo de ${category.name.toLowerCase()} para sublimación e imprenta en Uruguay`,
    "numberOfItems": categoryProducts.length,
    "itemListElement": categoryProducts.map((prod, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://www.kamaluso.com/p/${prod.slug}/`,
      "name": prod.name
    }))
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Script JSON-LD ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-brand-600">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold uppercase">
          {category.name}
        </span>
      </nav>

      {/* Category Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pink-950 p-8 sm:p-10 rounded-3xl text-white space-y-3 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-widest">
          <Layers className="w-4 h-4" /> Categoría de Insumos
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">
          {category.name} Sublimables en Uruguay
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Encuentra los mejores interiores de {category.name.toLowerCase()}, tapas de 350gr preparadas para estampar y accesorios para encuadernación. Sin mínimo de compra y envíos a todo el país desde San José de Mayo.
        </p>
      </div>

      {/* Category Products Grid */}
      {categoryProducts.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 space-y-2">
          <Sparkles className="w-8 h-8 text-pink-500 mx-auto" />
          <p className="font-bold text-base">Próximamente nuevos productos</p>
          <p className="text-xs text-slate-400">Estamos actualizando nuestro catálogo de {category.name}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
