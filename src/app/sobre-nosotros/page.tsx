import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Heart, Sparkles, Truck, CheckCircle2, Instagram, ExternalLink, Layers, Award, Flame } from "lucide-react";

export const metadata = {
  title: "Sobre Nosotros | Kamaluso Papelería Sublimable",
  description:
    "Fabricantes directos de insumos de papelería sublimable en Ramón Massini 136, San José de Mayo, Uruguay. Tapas 350gr e interiores con envíos a los 19 departamentos.",
  alternates: {
    canonical: "https://www.kamaluso.com/sobre-nosotros",
  },
  openGraph: {
    title: "Sobre Nosotros | Kamaluso San José, Papelería Sublimable",
    description:
      "Fabricantes directos de insumos para sublimación en San José de Mayo. Envíos a todo Uruguay sin mínimo de compra.",
    url: "https://www.kamaluso.com/sobre-nosotros",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Sobre Nosotros Kamaluso Sublimación",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotros | Kamaluso San José Uruguay",
    description:
      "Fabricantes directos de insumos para sublimación en San José de Mayo. Envíos a todo Uruguay.",
    images: ["https://www.kamaluso.com/agenda_fondo_kamaluso.jpg"],
  },
};

export default function SobreNosotrosPage() {
  const jsonLdAbout = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://www.kamaluso.com/sobre-nosotros#webpage",
        "url": "https://www.kamaluso.com/sobre-nosotros",
        "name": "Sobre Nosotros | Kamaluso Papelería Sublimable",
        "description":
          "Fabricantes directos de insumos de papelería sublimable en San José de Mayo, Uruguay (Ramón Massini 136, CP 80000).",
        "inLanguage": "es-UY",
        "mainEntity": {
          "@id": "https://www.kamaluso.com/#organization",
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://www.kamaluso.com",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Sobre Nosotros",
            "item": "https://www.kamaluso.com/sobre-nosotros",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAbout) }}
      />
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
          Fabricantes Directos • Industria Uruguaya
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Somos Kamaluso San José
        </h1>
        <p className="text-slate-600 leading-relaxed text-base max-w-2xl mx-auto">
          Especialistas en insumos de papelería sublimable en blanco para talleres, imprentas y emprendedores de todo el Uruguay.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900">
            Papelería para sublimadores y revendedores
          </h2>
          <p>
            Somos fabricantes directos y especialistas en papelería sublimable ubicados en <strong className="text-slate-900">San José de Mayo, Uruguay</strong>, con <strong className="text-slate-900">el mayor catálogo del país (26 modelos especializados)</strong> y <strong className="text-slate-900">stock disponible los 365 días del año</strong> (<strong className="text-slate-900">agendas 2027, perpetuas, libretas, planners, blocks, recetarios y cuadernos</strong>). Despachamos rápidamente a los 19 departamentos sin mínimos de compra.
          </p>
          <p>
            Diseñamos cada artículo pensando en <strong className="text-slate-900">colegas sublimadores, imprentas y talleres creativos</strong>. Además de kits completos listos para armar, ofrecemos venta modular: podés pedir <strong className="text-slate-900">interiores de agendas por separado</strong> o reponer únicamente el{" "}
            <Link href="/p/pack-2-tapas" className="font-bold text-brand-700 underline decoration-brand-300 hover:text-brand-800">
              Pack de 2 Tapas Sublimables de Repuesto por separado
            </Link>{" "}
            ante cualquier error en la prensa térmica para evitar desperdicios.
          </p>
        </div>

        {/* Highlight points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Tapas 350gr con polímero virgen y repuestos por separado</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Kits completos o interiores de agendas por separado</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Mayor catálogo (26 modelos) y stock los 365 días</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Envíos diarios vía DAC, Correo Uruguayo y Agencia COTMI</span>
          </div>
        </div>

        {/* 3 Pilares de Fabricante B2B */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Propuesta de Valor de Taller
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Por qué elegir insumos Kamaluso
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5 text-brand-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Kits o Interiores por Separado</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Llevá el kit completo listo para armar (tapas + hojas + espiral) o comprá solo interiores de agendas y tapas por separado según tu taller.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Tapas 350gr + Repuestos por Separado</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Polímero virgen de máxima vivacidad y venta de{" "}
                <Link href="/p/pack-2-tapas" className="font-semibold text-emerald-700 underline decoration-emerald-300">
                  tapas sueltas de repuesto
                </Link>{" "}
                para salvar agendas ante errores de prensado.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Mayor Catálogo y Stock 365 Días</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                26 modelos especializados con stock todo el año como fabricantes directos y venta sin mínimo de compra desde 1 unidad.
              </p>
            </div>
          </div>
        </div>

        {/* Diferenciación de Marca B2B vs B2C */}
        <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-6 space-y-3">
          <h3 className="text-lg font-extrabold text-brand-900">
            Diferencia entre Kamaluso Insumos (kamaluso.com) y Papelería Personalizada (papeleriapersonalizada.uy)
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li>
              <strong>www.kamaluso.com (este sitio):</strong> Fábrica mayorista B2B de insumos en blanco sin estampar (kits completos, interiores impresos por separado y tapas 350gr) para talleres y emprendedores.
            </li>
            <li>
              <strong>Papelería Personalizada (<a href="https://www.papeleriapersonalizada.uy" target="_blank" rel="noopener noreferrer" className="underline text-brand-700 hover:text-brand-800">www.papeleriapersonalizada.uy</a>):</strong> Nuestra submarca minorista y corporativa dedicada a agendas 2027, agendas docentes perpetuas, libretas y regalos empresariales ya terminados y personalizados para consumidor final y empresas.
            </li>
          </ul>
        </div>

        {/* Datos Corporativos Oficiales */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <strong className="text-white block text-sm mb-1">Dirección del Taller</strong>
            <span>Ramón Massini 136, San José de Mayo, CP 80000, Uruguay</span>
          </div>
          <div>
            <strong className="text-white block text-sm mb-1">Horario de Atención</strong>
            <span>Lunes a Viernes de 09:00 a 18:00 hs</span>
          </div>
          <div>
            <strong className="text-white block text-sm mb-1">WhatsApp Directo</strong>
            <a href="https://wa.me/59898615074" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-semibold">
              +598 98 615 074
            </a>
          </div>
          <div>
            <strong className="text-white block text-sm mb-1">Correo Electrónico</strong>
            <a href="mailto:kamalusosanjose@gmail.com" className="text-brand-300 hover:underline font-semibold">
              kamalusosanjose@gmail.com
            </a>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Atención Personalizada</h3>
              <p className="text-xs text-slate-500 mt-1">
                Te asesoramos directamente por WhatsApp sobre formatos, tiempos de prensa e insumos para tu taller.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Envíos a todo Uruguay</h3>
              <p className="text-xs text-slate-500 mt-1">
                Despachamos tu pedido embalado cuidadosamente desde San José hacia cualquier punto del país.
              </p>
            </div>
          </div>
        </div>

        {/* Instagram Community Banner */}
        <div className="p-6 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 rounded-2xl border border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-600 text-white rounded-2xl shadow-sm flex-shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Seguinos en Instagram</h4>
              <p className="text-xs text-slate-600">
                Mirá fotos de nuestros procesos de taller, novedades de agendas y tips de sublimación en <strong>@kamaluso_sanjose</strong>.
              </p>
            </div>
          </div>
          <a
            href="https://www.instagram.com/kamaluso_sanjose/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-600/20 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Ver @kamaluso_sanjose</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
