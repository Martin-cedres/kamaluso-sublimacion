import React from "react";
import Link from "next/link";
import { getAllResources } from "@/lib/resources";
import RecursosListClient from "@/components/recursos/RecursosListClient";

export const metadata = {
  title: "Plantillas y Archivos Descargables | Kamaluso Papelería Sublimable",
  description:
    "Descarga plantillas en PDF/PNG y guías de sublimación para tus tapas de agendas, libretas y blocks. Recursos 100% gratuitos para sublimadores de Uruguay.",
  alternates: {
    canonical: "https://www.kamaluso.com/recursos",
  },
  openGraph: {
    title: "Plantillas y Recursos Gratis para Sublimadores | Kamaluso",
    description:
      "Descarga gratis plantillas en PDF/PNG con sangrado para agendas A5, mini blocks y cuadernos. Fabricantes en Uruguay.",
    url: "https://www.kamaluso.com/recursos",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Kamaluso Recursos y Plantillas Gratis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plantillas y Recursos Gratis para Sublimadores | Kamaluso",
    description:
      "Descarga gratis plantillas en PDF/PNG con sangrado para agendas A5, mini blocks y cuadernos. Fabricantes en Uruguay.",
    images: ["https://www.kamaluso.com/agenda_fondo_kamaluso.jpg"],
  },
};

export const revalidate = 86400;

export default async function RecursosPage() {
  const initialRecursos = await getAllResources();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
          Recursos Gratuitos para Sublimadores
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Plantillas & Descargables
        </h1>
        <p className="text-slate-600 leading-relaxed text-base max-w-2xl mx-auto">
          Descarga gratis las guías de sublimación y plantillas con medidas exactas para diseñar las tapas de tus agendas, libretas y cuadernos.
        </p>
      </div>

      {/* Grid Dinámico de Descargables */}
      <RecursosListClient initialRecursos={initialRecursos} />

      {/* Guía de Medidas Oficiales y Sangrado para Diseñar */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Guía de Diseño para Sublimadores
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Medidas Oficiales con Sangrado para Tapas Kamaluso (350gr)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Para evitar bordes blancos al estampar, diseña siempre tus portadas con <strong>5 mm extra de demasía</strong> y respeta la zona de perforación para el espiral.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="font-extrabold text-slate-900 block text-sm">Agendas & Libretas A5</span>
            <div className="space-y-1 text-slate-600">
              <p>• <strong>Medida Tapa:</strong> 15 x 21 cm</p>
              <p>• <strong>Lienzo Diseño:</strong> 15.5 x 21.5 cm</p>
              <p>• <strong>Margen Espiral:</strong> Dejar 10 mm libres en lateral</p>
            </div>
            <Link
              href="/categoria/agendas"
              className="text-brand-600 hover:text-brand-700 font-bold block pt-2 text-[11px]"
            >
              Ver insumos A5 →
            </Link>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="font-extrabold text-slate-900 block text-sm">Blocks & Anotadores</span>
            <div className="space-y-1 text-slate-600">
              <p>• <strong>Medida Tapa:</strong> 10 x 15 cm</p>
              <p>• <strong>Lienzo Diseño:</strong> 10.5 x 15.5 cm</p>
              <p>• <strong>Margen Espiral:</strong> Dejar 8 mm en cabecera</p>
            </div>
            <Link
              href="/categoria/blocks-planners"
              className="text-brand-600 hover:text-brand-700 font-bold block pt-2 text-[11px]"
            >
              Ver insumos 10x15 →
            </Link>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="font-extrabold text-slate-900 block text-sm">Cuadernolas Grandes</span>
            <div className="space-y-1 text-slate-600">
              <p>• <strong>Medida Tapa:</strong> 21 x 30 cm</p>
              <p>• <strong>Lienzo Diseño:</strong> 21.5 x 30.5 cm</p>
              <p>• <strong>Margen Espiral:</strong> Dejar 12 mm en lateral</p>
            </div>
            <Link
              href="/categoria/libretas"
              className="text-brand-600 hover:text-brand-700 font-bold block pt-2 text-[11px]"
            >
              Ver cuadernolas 21x30 →
            </Link>
          </div>
        </div>
      </section>

      {/* Nota sobre papeleriapersonalizada.uy (Rama Minorista B2C) */}
      <div className="p-6 bg-gradient-to-r from-pink-50 via-white to-purple-50 rounded-3xl border border-pink-100 text-center space-y-3 shadow-sm">
        <h4 className="font-extrabold text-slate-900 text-base">
          ¿Buscas agendas o regalos ya armados y personalizados?
        </h4>
        <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
          En <strong>www.kamaluso.com</strong> nos especializamos en la venta de insumos y materiales sublimables para que vos los personalices. Si buscas comprar un regalo o agenda ya terminada para uso personal o empresarial, visita nuestra web minorista:{" "}
          <a
            href="https://www.papeleriapersonalizada.uy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-pink-600 hover:underline inline-flex items-center gap-1"
          >
            www.papeleriapersonalizada.uy →
          </a>
        </p>
      </div>
    </div>
  );
}
