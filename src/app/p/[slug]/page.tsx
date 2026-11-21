import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import { ChevronRight, ArrowLeft, ShieldCheck, Truck, PackageCheck, HelpCircle, ExternalLink } from "lucide-react";
import { AddToCartDetail } from "./AddToCartDetail";
import { ProductGallery } from "./ProductGallery";
import { Product } from "@/types";
import { KAMALUSO_WHATSAPP } from "@/lib/whatsapp";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

function getProductMeasures(product: Product): string {
  const n = product.name.toLowerCase();
  const d = product.description.toLowerCase();
  if (n.includes("21x30") || d.includes("21x30")) return "21x30cm";
  if (n.includes("10x15") || d.includes("10x15")) return "10x15cm";
  if (n.includes("17x22") || d.includes("17x22")) return "17x22cm";
  if (n.includes("cartulina") || d.includes("cartulina")) return "A4";
  return "15x21cm";
}

function getProductDisplayName(product: Product): string {
  const lowerName = product.name.toLowerCase();
  const lowerDesc = (product.description || "").toLowerCase();
  const isUndated =
    lowerName.includes("202") ||
    lowerName.includes("perpetua") ||
    lowerName.includes("perpetuo") ||
    lowerDesc.includes("perpetua") ||
    lowerDesc.includes("perpetuo") ||
    lowerName.includes("profesor") ||
    lowerName.includes("lashista") ||
    lowerName.includes("manicurista") ||
    lowerName.includes("embarazo") ||
    lowerName.includes("pack") ||
    lowerName.includes("planner") ||
    lowerName.includes("kit");

  // Mantener año comercial actual (2027) en title y H1 solo para agendas fechadas
  if (product.category === "agendas" && !isUndated) {
    return `${product.name} 2027`;
  }
  return product.name;
}

function getProductMetaDescription(product: Product): string {
  const measure = getProductMeasures(product);
  const displayName = getProductDisplayName(product);
  const isPack2Tapas = product.slug === "pack-2-tapas";
  const isCartulina = product.name.toLowerCase().includes("cartulina");

  let candidates: string[];
  if (isPack2Tapas) {
    candidates = [
      `${displayName} (${measure}): tapas sueltas de repuesto 350gr (170ºC/120s). $${product.price} UYU. Salvá agendas ante errores, stock todo el año. Envíos.`,
      `${displayName} (${measure}): tapas sueltas de repuesto 350gr. $${product.price} UYU. Stock todo el año. Envíos a Uruguay.`,
    ];
  } else if (isCartulina) {
    candidates = [
      `${displayName} (${measure}): cartulinas sublimables A4 350gr (170ºC/120s). $${product.price} UYU. Stock todo el año. Envíos a Uruguay.`,
      `${displayName} (${measure}): cartulinas sublimables A4 350gr. $${product.price} UYU. Stock todo el año. Envíos a Uruguay.`,
    ];
  } else {
    candidates = [
      `${displayName} (${measure}): Kit o interior por separado + tapas 350gr. 170ºC/120s. $${product.price} UYU. Stock todo el año. Envíos a todo Uruguay.`,
      `${displayName} (${measure}): Kit o interior por separado + tapas 350gr. $${product.price} UYU. Stock todo el año. Envíos a Uruguay.`,
      `${displayName} (${measure}): Kit o interior + tapas 350gr. $${product.price} UYU. Stock todo el año. Envíos Uruguay.`,
      `${displayName}: Kit o interior 350gr. $${product.price} UYU. Stock todo el año. Envíos.`,
    ];
  }

  const matched = candidates.find((c) => c.length <= 160);
  if (matched) return matched;
  return candidates[candidates.length - 1].slice(0, 157) + "...";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  const displayName = getProductDisplayName(product);
  const productUrl = `https://www.kamaluso.com/p/${product.slug}`;
  const dynamicMetaDesc = getProductMetaDescription(product);

  // Garantizar que la imagen sea siempre una URL absoluta válida
  const rawImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/agenda_fondo_kamaluso.jpg";
  const absoluteImageUrl = rawImage.startsWith("http")
    ? rawImage
    : `https://www.kamaluso.com${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`;

  const seoTitle =
    displayName.length > 43
      ? `${displayName} | Kamaluso`
      : `${displayName} | Kamaluso Uruguay`;

  return {
    title: seoTitle,
    description: dynamicMetaDesc,
    alternates: {
      canonical: productUrl,
    },
    keywords: [
      displayName,
      product.name,
      "insumos sublimables Uruguay",
      "papeleria sublimacion",
      "tapas sublimables 350gr",
      "interiores de agenda para sublimar",
      product.category,
      "San José de Mayo",
    ],
    openGraph: {
      title: `${displayName} | Kamaluso`,
      description: dynamicMetaDesc,
      url: productUrl,
      siteName: "Kamaluso Sublimación",
      locale: "es_UY",
      type: "website",
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 800,
          alt: `${displayName} - Kamaluso Sublimación Uruguay`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | Kamaluso`,
      description: dynamicMetaDesc,
      images: [absoluteImageUrl],
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

  const displayName = getProductDisplayName(product);
  const productUrl = `https://www.kamaluso.com/p/${product.slug}`;
  const productDesc = getProductMetaDescription(product);
  const productMeasure = getProductMeasures(product);
  const isPack2Tapas = product.slug === "pack-2-tapas";
  const isCartulina = product.name.toLowerCase().includes("cartulina") || product.slug.includes("cartulina");
  const is15x21Kit = productMeasure === "15x21cm" && !isPack2Tapas && !isCartulina;
  const hasInterior = !isPack2Tapas && !isCartulina;

  const productMaterial = isCartulina
    ? "Cartulina cristal sublimable A4 de 350gr con polímero virgen"
    : isPack2Tapas
    ? "Cartón cristal sublimable de 350gr con polímero virgen"
    : "Cartón cristal sublimable de 350gr con polímero virgen y papel obra impreso";

  const whatsappInterioresUrl = `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(
    `Hola Kamaluso, quiero consultar por solo los interiores impresos sueltos (sin tapas) de: ${displayName}.`
  )}`;

  const absoluteImages = (product.images || []).map((img) =>
    img.startsWith("http")
      ? img
      : `https://www.kamaluso.com${img.startsWith("/") ? img : `/${img}`}`
  );

  // Schema.org JSON-LD para Google Shopping y Rich Snippets GEO B2B
  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    url: productUrl,
    name: displayName,
    image: absoluteImages.length > 0 ? absoluteImages : ["https://www.kamaluso.com/agenda_fondo_kamaluso.jpg"],
    description: product.description || productDesc,
    sku: product.id,
    mpn: product.id,
    category: product.category,
    material: productMaterial,
    brand: {
      "@type": "Brand",
      name: "Kamaluso",
    },
    manufacturer: {
      "@id": "https://www.kamaluso.com/#organization",
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Talleres de sublimación, imprentas, encuadernadores y emprendedores",
    },
    ...(isPack2Tapas
      ? {
          isSparePartFor: {
            "@type": "Product",
            name: "Agendas, Libretas y Recetarios Sublimables 15x21cm (A5) Kamaluso",
            url: "https://www.kamaluso.com/categoria/agendas",
          },
        }
      : {}),
    ...(is15x21Kit
      ? {
          isRelatedTo: {
            "@type": "Product",
            name: "Pack 2 Tapas Sublimables de Repuesto 15x21cm (350gr)",
            url: "https://www.kamaluso.com/p/pack-2-tapas",
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.currency || "UYU",
      price: product.price,
      validFrom: "2026-01-01T00:00:00-03:00",
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@id": "https://www.kamaluso.com/#organization",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "UY",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 5,
        returnMethod: [
          "https://schema.org/ReturnByMail",
          "https://schema.org/ReturnInStore",
        ],
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        merchantReturnLink: "https://www.kamaluso.com/devoluciones",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "200",
          currency: "UYU",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "UY",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  const productFaqs = [
    {
      question: `¿Cuáles son los parámetros recomendados para sublimar ${displayName}?`,
      answer:
        "Se recomienda estampación en prensa plana de calor a 170ºC - 180ºC durante 120 segundos con presión media a alta y enfriamiento bajo peso plano de 60 a 120 segundos.",
    },
    {
      question: "¿Cuál es el tiempo de despacho y envío a departamentos de Uruguay?",
      answer:
        "El tiempo de preparación estimado es de 48 horas hábiles. Realizamos envíos diarios a Montevideo y los 19 departamentos de Uruguay desde San José de Mayo mediante DAC, Correo Uruguayo y COTMI sin mínimo de compra.",
    },
    {
      question: "¿Tienen stock todo el año y venden tapas de repuesto o interiores por separado si me equivoco al sublimar?",
      answer:
        "Sí, somos fabricantes en San José de Mayo con stock disponible todo el año (365 días). Además de kits completos, vendemos interiores de agendas por separado y el Pack de 2 Tapas Sublimables de Repuesto 350gr por separado para que nunca tengas que desechar un producto ante errores en la prensa.",
    },
  ];

  // Schema FAQ específico de producto para GEO (paridad 100% visible en DOM)
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: productFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Schema BreadcrumbList para navegación estructurada en Google
  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://www.kamaluso.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.toUpperCase().replace("-", " "),
        item: `https://www.kamaluso.com/categoria/${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: productUrl,
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 py-1">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href={`/categoria/${product.category}`}
          className="hover:text-brand-600 uppercase transition-colors"
        >
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-none">
          {displayName}
        </span>
      </nav>

      {/* Product Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-start bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
        {/* Left: Image gallery (Sticky en desktop) */}
        <div className="lg:sticky lg:top-24 self-start">
          <ProductGallery
            images={product.images}
            productName={displayName}
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
              {displayName}
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
          {/* Descripción con formato y respeto estricto de saltos de línea */}
          {product.description && (
            <div className="product-description-text bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 whitespace-pre-line text-sm text-slate-700 leading-relaxed">
              {product.description}
            </div>
          )}

          {/* Ficha Técnica Estructurada (GEO & Especificaciones de Taller) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                📋 Ficha Técnica del Insumo
              </h2>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Stock: Todo el año (365 días)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Gramaje de Tapa</span>
                <span className="font-bold text-slate-800">350 gr (Cartón Cristal)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Polímero Térmico</span>
                <span className="font-bold text-emerald-700">Virgen Alta Transferencia</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Modalidad de Venta</span>
                <span className="font-bold text-slate-800">
                  {isPack2Tapas ? "Pack 2 Tapas Repuesto 350gr" : "Kit, Interior o Tapas sueltas"}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Fabricación</span>
                <span className="font-bold text-slate-800">San José de Mayo, Uruguay</span>
              </div>
            </div>
            {!isPack2Tapas ? (
              <div className="p-3 bg-brand-50/70 rounded-xl border border-brand-200/80 text-xs text-slate-800 leading-relaxed">
                💡 <strong>Respaldo de Taller:</strong> ¿Tuviste un error al estampar?{" "}
                <Link
                  href="/p/pack-2-tapas"
                  className="font-bold text-brand-700 underline decoration-brand-400 hover:text-brand-800"
                >
                  Comprá solo el Pack de 2 Tapas de Repuesto por separado
                </Link>{" "}
                o interiores sueltos sin desechar tu producto.
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-slate-800 leading-relaxed">
                💡 <strong>Respaldo de Taller:</strong> Este repuesto salva tus{" "}
                <Link
                  href="/categoria/agendas"
                  className="font-bold text-emerald-800 underline decoration-emerald-400 hover:text-emerald-900"
                >
                  agendas, libretas y recetarios 15x21cm
                </Link>{" "}
                ante errores en la prensa térmica sin desechar el producto completo.
              </div>
            )}
          </div>

          {/* Bloque Destacado de Parámetros de Sublimación */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2.5">
            <h2 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              🔥 Parámetros de Estampado Recomendados
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-amber-950">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-600 block text-[10px]">Temperatura</span>
                <span className="text-base font-black text-amber-800">170 ºC – 180 ºC</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-600 block text-[10px]">Tiempo Prensa Plana</span>
                <span className="text-base font-black text-amber-800">120 segundos</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-600 block text-[10px]">Presión</span>
                <span className="text-sm sm:text-base font-black text-amber-800">Media - Alta pareja</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-600 block text-[10px]">Enfriado Recto</span>
                <span className="text-sm sm:text-base font-black text-amber-800">Bajo peso plano 60–120s</span>
              </div>
            </div>
            <div className="pt-1">
              <Link
                href="/guia-sublimacion-papeleria"
                className="inline-flex items-center text-xs font-bold text-amber-900 hover:text-amber-950 underline decoration-amber-400 transition-colors"
              >
                Ver guía técnica y solución a errores de prensa →
              </Link>
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
              <li>Despacho estimado en aproximado <strong>48hs</strong> por DAC, Correo Uruguayo y COTMI.</li>
              <li>La elaboración inicia al recibir el <strong>comprobante de pago</strong>.</li>
              <li>Para pedidos mayores a <strong>$2.000 UYU</strong>, consultar tiempo de preparación.</li>
            </ul>
          </div>

          {/* Aviso claro B2B (Insumo en blanco) + CTA Solo Interiores para Encuadernadores */}
          <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl text-xs text-slate-700 space-y-2">
            <p className="leading-relaxed">
              <strong className="text-slate-900">Importante:</strong> Este producto es un <strong>insumo en blanco sin estampar</strong> para talleres de sublimación. ¿Buscás un producto ya terminado y personalizado?{" "}
              <a
                href="https://www.papeleriapersonalizada.uy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-pink-700 underline inline-flex items-center gap-0.5 hover:text-pink-800"
              >
                Compralo en papeleriapersonalizada.uy
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            {hasInterior && (
              <p className="pt-1.5 border-t border-sky-200/70">
                <strong className="text-slate-900">¿Sos encuadernador/a?</strong>{" "}
                <a
                  href={whatsappInterioresUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 underline hover:text-emerald-800"
                >
                  ¿Solo necesitás interiores sueltos sin tapas? Consultar por WhatsApp →
                </a>
              </p>
            )}
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

      {/* Preguntas Frecuentes Visibles (Paridad 100% con FAQPage JSON-LD) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Preguntas frecuentes sobre este insumo
          </h2>
        </div>
        <div className="space-y-2.5">
          {productFaqs.map((faq, idx) => (
            <details
              key={idx}
              open={idx === 0}
              className="group rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs sm:text-sm open:bg-white"
            >
              <summary className="font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between gap-2">
                <span>{faq.question}</span>
                <span className="text-slate-400 group-open:rotate-90 transition-transform font-mono text-xs">
                  ›
                </span>
              </summary>
              <p className="pt-2.5 mt-2.5 border-t border-slate-100 text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
