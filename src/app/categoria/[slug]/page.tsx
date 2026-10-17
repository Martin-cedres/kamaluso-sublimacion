import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, CATEGORIES } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { ChevronRight, Layers, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

const CATEGORY_SEO: Record<
  string,
  {
    h1: string;
    title: string;
    metaDescription: string;
    intro: string;
  }
> = {
  agendas: {
    h1: "Agendas Sublimables 2027 y Perpetuas en Uruguay",
    title: "Agendas Sublimables 2027 y Perpetuas en Uruguay | Kamaluso",
    metaDescription:
      "Kits completos de agendas para sublimar directos de fábrica en San José de Mayo. Incluyen hojas interiores impresas, tapas rígidas de cartón cristal de 350gr tratadas con polímero virgen y espirales plásticos. Envíos a todo el país.",
    intro:
      "Kits completos de agendas para sublimar directos de fábrica en San José de Mayo. Incluyen hojas interiores impresas, tapas rígidas de cartón cristal de 350gr tratadas con polímero virgen y espirales plásticos. Envíos a Montevideo y los 19 departamentos sin mínimo de compra.",
  },
  libretas: {
    h1: "Libretas y Cuadernos Sublimables en Uruguay (A5, 17x22 y A4)",
    title: "Libretas y Cuadernos Sublimables en Uruguay (A5, 17x22 y A4) | Kamaluso",
    metaDescription:
      "Insumos de libretas, cuadernos y cuadernolas 21x30 para sublimación en Uruguay. Sets listos para estampar y encuadernar con tapas de 350gr e interiores de alto gramaje para talleres.",
    intro:
      "Insumos de libretas, cuadernos y cuadernolas 21x30 para sublimación en Uruguay. Sets listos para estampar y encuadernar con tapas de 350gr e interiores de alto gramaje, pensados para talleres de personalización y papelería corporativa.",
  },
  "blocks-planners": {
    h1: "Blocks 10x15 y Planners Sublimables en Uruguay",
    title: "Blocks 10x15 y Planners Sublimables en Uruguay | Kamaluso",
    metaDescription:
      "Organizadores perpetuos, planners semanales y blocks anotadores 10x15cm (lisos y renglonados) con tapas sublimables de 350gr y espiral incluido en Uruguay. Sin mínimo.",
    intro:
      "Organizadores perpetuos, planners semanales y blocks anotadores 10x15cm (lisos y renglonados) con tapas sublimables de 350gr y espiral incluido. Ideales para souvenirs, regalos empresariales y emprendimientos de sublimación.",
  },
  especiales: {
    h1: "Insumos Especiales y Cartulina Sublimable 350gr en Uruguay",
    title: "Insumos Especiales y Cartulina Sublimable 350gr en Uruguay | Kamaluso",
    metaDescription:
      "Packs de cartulina sublimable A4 de 350gr, repuestos de tapas perforadas y recetarios sublimables (color, negro e infantil) listos para estampar a 170ºC durante 120 segundos.",
    intro:
      "Packs de cartulina sublimable A4 de 350gr, repuestos de tapas perforadas y recetarios sublimables (color, negro e infantil) listos para estampar a 170ºC durante 120 segundos.",
  },
  outlet: {
    h1: "Outlet de Papelería e Insumos Sublimables en Uruguay",
    title: "Outlet de Papelería e Insumos Sublimables en Uruguay | Kamaluso",
    metaDescription:
      "Liquidación de temporada, lotes promocionales y formatos discontinuados de papelería sublimable con descuento directo de taller. Sin mínimo de compra y con envíos a todo el país.",
    intro:
      "Liquidación de temporada, lotes promocionales y formatos discontinuados de papelería sublimable con descuento directo de taller. Sin mínimo de compra y con envíos a todo el país.",
  },
  "kits-promos": {
    h1: "Kits Mayoristas de Papelería Sublimable en Uruguay",
    title: "Kits Mayoristas de Papelería Sublimable en Uruguay | Kamaluso",
    metaDescription:
      "Kits mayoristas de papelería sublimable con descuento directo de fábrica. Promociones por volumen en agendas y cuadernos para talleres y sublimadores en Uruguay.",
    intro:
      "Packs y promociones por volumen en agendas y cuadernos para sublimar con descuento directo de fábrica. Aumenta la rentabilidad de tu taller de personalización.",
  },
};

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

  const seoData = CATEGORY_SEO[slug] || {
    h1: `${category.name} en Uruguay`,
    title: `${category.name} | Kamaluso Papelería Sublimable Uruguay`,
    metaDescription: `Insumos de ${category.name.toLowerCase()} para sublimación e imprenta en Uruguay. Fabricación directa en San José de Mayo sin mínimo de compra.`,
    intro: `Encuentra kits completos de ${category.name.toLowerCase()} para sublimar y personalizar en Uruguay.`,
  };

  const canonicalUrl = `https://www.kamaluso.com/categoria/${slug}`;

  const allProducts = await getAllProducts();
  const catProduct = allProducts.find((p) => p.category === slug && p.images && p.images.length > 0);
  const rawCatImg = catProduct && catProduct.images[0] ? catProduct.images[0] : "/agenda_fondo_kamaluso.jpg";
  const catImageUrl = rawCatImg.startsWith("http")
    ? rawCatImg
    : `https://www.kamaluso.com${rawCatImg.startsWith("/") ? rawCatImg : `/${rawCatImg}`}`;

  return {
    title: seoData.title,
    description: seoData.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      `${category.name.toLowerCase()} sublimables uruguay`,
      `comprar ${category.name.toLowerCase()} sublimacion`,
      "insumos para sublimar san jose",
      "papeleria sublimable por mayor",
      "tapas 350gr sublimacion",
    ],
    openGraph: {
      title: seoData.title,
      description: seoData.metaDescription,
      url: canonicalUrl,
      siteName: "Kamaluso Sublimación",
      locale: "es_UY",
      type: "website",
      images: [
        {
          url: catImageUrl,
          width: 800,
          height: 800,
          alt: `${category.name} - Kamaluso Papelería Sublimable Uruguay`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: seoData.metaDescription,
      images: [catImageUrl],
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

  const seoData = CATEGORY_SEO[slug] || {
    h1: `${category.name} en Uruguay`,
    title: `${category.name} | Kamaluso`,
    metaDescription: `Insumos de ${category.name.toLowerCase()} para sublimar.`,
    intro: `Encuentra kits completos de ${category.name.toLowerCase()} para sublimar y personalizar en Uruguay.`,
  };

  // Schema.org ItemList para la categoría
  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": seoData.h1,
    "description": seoData.metaDescription,
    "numberOfItems": categoryProducts.length,
    "itemListElement": categoryProducts.map((prod, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://www.kamaluso.com/p/${prod.slug}`,
      "name": prod.name,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
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

      {/* Category Banner con H1 e Intro Limpios y Específicos */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pink-950 p-8 sm:p-10 rounded-3xl text-white space-y-3 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-widest">
          <Layers className="w-4 h-4" /> Categoría de Insumos Sublimables
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">
          {seoData.h1}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          {seoData.intro}
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

      {/* Guía Semántica B2B por Categoría (SEO & GEO Content) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6 text-slate-700">
        {slug === "agendas" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Guía de Agendas Sublimables en Uruguay: Modelos, Tapas e Interiores
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                En <strong>Kamaluso</strong> confeccionamos kits completos de <strong>agendas para sublimar</strong> pensados específicamente para talleres de personalización y emprendedores. Cada set incluye hojas interiores temáticas impresas con nitidez, tapas y contratapas de <strong>cartón cristal de 350gr con polímero virgen</strong> y espirales plásticos continuos.
              </p>
            </div>

            {/* Tabla Semántica de Especificaciones Técnicas (Answer-First GEO & AI Overviews) */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Ficha Técnica de Agendas Sublimables Kamaluso
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Parámetro / Componente</th>
                      <th className="py-2.5 px-3">Especificación Oficial de Fábrica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Gramaje de tapa</td>
                      <td className="py-2.5 px-3">350gr Cartón Cristal de alta rigidez</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Polímero térmico</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">Virgen de alta transferencia (brillo y viveza de color)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Temperatura de estampado</td>
                      <td className="py-2.5 px-3 font-bold text-amber-700">170ºC – 180ºC en prensa térmica plana</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Tiempo de prensado</td>
                      <td className="py-2.5 px-3 font-bold text-amber-700">120 segundos constantes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Presión recomendada</td>
                      <td className="py-2.5 px-3">Media a alta con presión uniforme</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Técnica de enfriamiento</td>
                      <td className="py-2.5 px-3">Bajo peso plano durante 60 a 120 segundos (anti-curvatura)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Logística y envíos</td>
                      <td className="py-2.5 px-3">DAC, Correo Uruguayo y COTMI a Montevideo y los 19 departamentos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Variedad de Interiores Temáticos</h3>
                <p className="text-slate-600">
                  Agendas semanales horizontales y verticales, un día a la vista, dos días por página, agenda docente primaria (con planillas de calificaciones y asistencia), agenda para peluquería, lashistas, manicuristas, control de embarazo y diarios íntimos.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Parámetros de Estampado de Taller</h3>
                <p className="text-slate-600">
                  Estampa las tapas en prensa térmica plana a <strong>170ºC – 180ºC durante 120 segundos</strong> con presión media a alta. Al retirar, enfría bajo peso plano durante 1 minuto para un acabado recto sin curvatura.
                </p>
              </div>
            </div>
          </div>
        )}

        {slug === "libretas" && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Cuadernos y Libretas Sublimables en Uruguay (Formato A5 y Cuadernolas 21x30)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nuestra línea de <strong>cuadernos y libretas para sublimar</strong> ofrece insumos con excelente gramaje tanto en portadas como en hojas interiores. Son la opción más demandada para souvenirs empresariales, regalos de fin de año y artículos de papelería corporativa en Uruguay.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Cuadernolas Universitarias 21x30 cm</h3>
                <p className="text-slate-600">
                  Formato grande similar a tamaño A4, ideal para estudiantes y profesionales. Tapas rígidas de 350g preparadas para soportar uso intensivo y hojas con renglones de alta blancura.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Libretas A5 (15x21 cm) con Renglones</h3>
                <p className="text-slate-600">
                  El clásico formato transportable de 70 hojas interiores y anillado espiral continuo. Fácil de sublimar con prensa plana estándar sin desperdicio de material.
                </p>
              </div>
            </div>
          </div>
        )}

        {slug === "blocks-planners" && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Blocks de Notas 10x15 y Planners Sublimables para Escritorio
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Los <strong>blocks y anotadores sublimables de 10x15cm</strong> son el producto de entrada más rápido y rentable para sublimadores. Al requerir solo una fracción del tiempo de diseño y prensado, permiten comercializar souvenirs por decenas para eventos, cumpleaños o comercios locales.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Blocks 10x15 Lisos y Rayados</h3>
                <p className="text-slate-600">
                  Kits de 70 hojas con tapa y contratapa sublimables desde $60 a $85 UYU. Ideales para armar a mano con espiral o anillado superior.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Planners Semanales y Control de Gastos</h3>
                <p className="text-slate-600">
                  Planificadores de mesa diseñados para organización diaria, infantil y financiera, con tapas sublimables a todo color.
                </p>
              </div>
            </div>
          </div>
        )}

        {slug === "kits-promos" && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Kits Mayoristas de Papelería Sublimable con Descuento
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nuestros <strong>kits por volumen</strong> están pensados para optimizar el margen del taller o revendedor. Al comprar en paquetes de 10 unidades, accedes a precios preferenciales de fábrica y reduces tu costo unitario de producción.
            </p>
            <p className="text-xs text-slate-500">
              Despachamos pedidos mayoristas a todo el Uruguay sin complicaciones logísticas mediante DAC y agencias desde San José de Mayo.
            </p>
          </div>
        )}

        {(slug === "especiales" || slug === "outlet") && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              Insumos de Papelería Sublimable en San José de Mayo, Uruguay
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              En Kamaluso actualizamos constantemente nuestro catálogo con nuevas temáticas de interiores, tapas con formatos especiales y promociones por liquidación de temporada. Envíos ágiles a los 19 departamentos.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link
            href="/guia-sublimacion-papeleria"
            className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1"
          >
            Ver Guía de Tiempos y Temperaturas (170º / 120s) →
          </Link>
          <Link
            href="/mayoristas"
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
          >
            Consultar Tarifas Mayoristas por Volumen →
          </Link>
        </div>
      </section>
    </div>
  );
}
