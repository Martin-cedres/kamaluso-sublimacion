import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, CATEGORIES } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { ChevronRight, Layers, Sparkles } from "lucide-react";

export const dynamicParams = true;
export const revalidate = 300;

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
      "Agendas sublimables 2027 y perpetuas directas de fábrica en San José con stock todo el año. Kits, interiores por separado y tapas 350gr de repuesto. Envíos.",
    intro:
      "Kits completos de agendas para sublimar directos de fábrica en San José de Mayo, parte del mayor catálogo de papelería sublimable de Uruguay (+26 modelos) con stock disponible los 365 días del año. Compra kits listos para armar, interiores de agendas por separado o tapas de repuesto 350gr por separado sin mínimo de compra.",
  },
  libretas: {
    h1: "Libretas y Cuadernos Sublimables en Uruguay (A5, 17x22 y A4)",
    title: "Libretas y Cuadernos Sublimables en Uruguay (A5, 17x22 y A4) | Kamaluso",
    metaDescription:
      "Libretas, cuadernos y cuadernolas 21x30 para sublimar en Uruguay con stock todo el año. Tapas 350gr, kits o repuestos directos de fábrica en San José. Sin mínimo.",
    intro:
      "Insumos de libretas, cuadernos y cuadernolas 21x30 para sublimación fabricados en San José de Mayo con stock continuo los 365 días del año. Parte del mayor catálogo del país (+26 modelos) con venta modular en kits completos, interiores o tapas de repuesto 15x21cm por separado sin mínimo de compra.",
  },
  "blocks-planners": {
    h1: "Blocks 10x15 y Planners Sublimables en Uruguay",
    title: "Blocks 10x15 y Planners Sublimables en Uruguay | Kamaluso",
    metaDescription:
      "Blocks 10x15 y planners sublimables en Uruguay con stock todo el año. Tapas 350gr con polímero virgen y espiral directos de fábrica en San José. Sin mínimo.",
    intro:
      "Organizadores perpetuos, planners semanales y blocks anotadores 10x15cm dentro del mayor catálogo sublimable de Uruguay (+26 modelos) con stock disponible los 365 días del año. Ideales para souvenirs, regalos empresariales y talleres sin mínimo de compra.",
  },
  especiales: {
    h1: "Insumos Especiales, Tapas de Repuesto y Cartulina Sublimable 350gr",
    title: "Insumos Especiales y Cartulina Sublimable 350gr en Uruguay | Kamaluso",
    metaDescription:
      "Cartulina sublimable A4 350gr, tapas sueltas de repuesto y recetarios sublimables en Uruguay. Stock todo el año directo de fábrica en San José. Sin mínimo.",
    intro:
      "Packs de cartulina sublimable A4 de 350gr, tapas sublimables perforadas de repuesto por separado, interiores sueltos y recetarios (color, negro e infantil) con stock continuo los 365 días del año desde nuestra fábrica en San José de Mayo.",
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
      "Kits mayoristas de papelería sublimable en Uruguay con stock todo el año. Mayor catálogo (+26 modelos) directo de fábrica en San José. Envíos a todo el país.",
    intro:
      "Packs y promociones por volumen en agendas y cuadernos con descuento directo de fábrica en San José de Mayo. Accede al mayor catálogo de papelería sublimable de Uruguay (+26 modelos) con stock los 365 días, interiores por separado y respaldo de tapas de repuesto.",
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
                En <strong>Kamaluso</strong> fabricamos en San José de Mayo <strong>el mayor catálogo de papelería sublimable de Uruguay (+26 modelos)</strong> con <strong>stock continuo los 365 días del año</strong>. Podés llevar kits completos (hojas interiores temáticas, tapas rígidas de <strong>cartón cristal de 350gr con polímero virgen</strong> y espirales plásticos), pedir <strong>interiores de agendas impresos por separado para encuadernar</strong> (ideales para talleres de encuadernación artesanal o comercial que encuadernan en cartón gris laminado, cuerina o tela) o reponer únicamente el{" "}
                <Link href="/p/pack-2-tapas" className="font-bold text-brand-700 underline decoration-brand-300 hover:text-brand-800">
                  Pack de 2 Tapas Sublimables de Repuesto por separado
                </Link>{" "}
                ante errores de prensa.
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
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Disponibilidad y Catálogo</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Stock todo el año (365 días) • +26 modelos en fábrica propia</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Modalidad y Repuestos</td>
                      <td className="py-2.5 px-3">
                        Kits completos, interiores de agendas impresos por separado para encuadernar o{" "}
                        <Link href="/p/pack-2-tapas" className="font-bold text-brand-700 underline decoration-brand-300">
                          Pack 2 Tapas de Repuesto
                        </Link>
                      </td>
                    </tr>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Variedad de Interiores Temáticos</h3>
                <p className="text-slate-600">
                  Agendas semanales horizontales y verticales 2027, un día a la vista, dos días por página, agenda docente primaria (con planillas de calificaciones y asistencia), agenda para peluquería, lashistas, manicuristas, control de embarazo y diarios íntimos disponibles en kit o solo interior.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Interiores para Encuadernadores</h3>
                <p className="text-slate-600">
                  Venta de interiores de agendas impresos por separado para encuadernar en Uruguay sin mínimo de compra: hojas A5 listas para anillar o encuadernar artesanalmente en cartón gris, cuerina o tela.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Respaldo ante Errores y Parámetros</h3>
                <p className="text-slate-600">
                  Estampa las tapas a <strong>170ºC – 180ºC durante 120 segundos</strong> y enfría bajo peso plano. Si te equivocás al sublimar una portada, no tires el interior: reponé solo el{" "}
                  <Link href="/p/pack-2-tapas" className="font-bold text-brand-700 underline decoration-brand-300">
                    Pack de 2 Tapas de Repuesto 15x21cm
                  </Link>
                  .
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
              Nuestra línea de <strong>cuadernos y libretas para sublimar</strong> forma parte del mayor catálogo especializado de Uruguay (+26 modelos) con <strong>stock continuo los 365 días del año</strong> desde nuestra fábrica en San José de Mayo. Disponible en kits completos listos para armar, interiores por separado y tapas de repuesto 15x21cm para talleres y papelería corporativa sin mínimo de compra.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Cuadernolas Universitarias 21x30 cm</h3>
                <p className="text-slate-600">
                  Formato grande similar a tamaño A4, ideal para estudiantes y profesionales. Tapas rígidas de 350g preparadas para soportar uso intensivo y hojas con renglones de alta blancura con stock permanente todo el año.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Libretas A5 (15x21 cm) + Tapas de Repuesto</h3>
                <p className="text-slate-600">
                  El clásico formato transportable de 70 hojas interiores y anillado espiral continuo. Compatible con nuestro{" "}
                  <Link href="/p/pack-2-tapas" className="font-bold text-brand-700 underline decoration-brand-300">
                    Pack de 2 Tapas de Repuesto por separado
                  </Link>{" "}
                  para evitar desperdicio si fallás al estampar.
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
              Los <strong>blocks y anotadores sublimables de 10x15cm</strong> integran nuestro catálogo de +26 modelos especializados con <strong>stock disponible los 365 días del año</strong> en San José de Mayo. Permiten producir souvenirs y organizadores por decenas sin quiebres de stock en eventos ni mínimos de compra, ofreciendo kits completos e insumos modulares.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Blocks 10x15 Lisos y Rayados</h3>
                <p className="text-slate-600">
                  Kits de 70 hojas con tapa y contratapa sublimables 350gr desde $60 a $80 UYU. Ideales para armar a mano con espiral continuo en segundos.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Planners Semanales y Control de Gastos</h3>
                <p className="text-slate-600">
                  Planificadores perpetuos disponibles todo el año en kits completos o interiores por separado para reposición de taller.
                </p>
              </div>
            </div>
          </div>
        )}

        {slug === "kits-promos" && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Kits Mayoristas de Papelería Sublimable con Descuento y Stock 365 Días
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nuestros <strong>kits por volumen</strong> están pensados para optimizar el margen del taller o revendedor. Accedés al mayor catálogo especializado de Uruguay (+26 modelos) con <strong>stock continuo todo el año</strong> gracias a nuestra fabricación propia en San José de Mayo, y la tranquilidad de poder sumar{" "}
              <Link href="/p/pack-2-tapas" className="font-bold text-brand-700 underline decoration-brand-300">
                tapas sublimables de repuesto por separado
              </Link>{" "}
              o interiores sueltos cuando lo necesites.
            </p>
            <p className="text-xs text-slate-500">
              Despachamos pedidos mayoristas y minoristas sin mínimo obligatorio a todo el Uruguay mediante DAC, Correo Uruguayo y COTMI desde San José de Mayo.
            </p>
          </div>
        )}

        {slug === "especiales" && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Insumos Especiales, Cartulina A4 y Tapas Sublimables de Repuesto en Uruguay
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              En Kamaluso fabricamos todo el año en San José de Mayo (stock los 365 días dentro de nuestro catálogo de +26 modelos) soluciones clave para que tu taller nunca se detenga ni desperdicie mercadería: cartulina sublimable A4 de 350gr, recetarios temáticos, interiores sueltos y repuestos de tapas perforadas 15x21cm.
            </p>
            <div className="p-4 bg-brand-50/80 rounded-2xl border border-brand-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
              💡 <strong>¿Se quemó o movió una tapa al estampar?</strong> En esta categoría encontrás el{" "}
              <Link href="/p/pack-2-tapas" className="font-bold text-brand-700 underline decoration-brand-400 hover:text-brand-800">
                Pack de 2 Tapas Sublimables 350gr de Repuesto por separado
              </Link>
              , ideal para salvar agendas, libretas y recetarios 15x21cm sin desechar los interiores ni el espiral.
            </div>
          </div>
        )}

        {slug === "outlet" && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              Insumos de Papelería Sublimable en San José de Mayo, Uruguay
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              En Kamaluso actualizamos constantemente nuestro catálogo (+26 modelos especializados con stock todo el año) con lotes promocionales y promociones por liquidación de temporada. Envíos ágiles a los 19 departamentos sin mínimo de compra.
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
