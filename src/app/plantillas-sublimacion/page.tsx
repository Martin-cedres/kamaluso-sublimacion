import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAllResources } from "@/lib/resources";
import RecursosListClient from "@/components/recursos/RecursosListClient";
import { Download, Sparkles, ArrowRight, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Plantillas para Sublimar Agendas y Libretas en Uruguay (PDF Gratis) | Kamaluso",
  description:
    "Descarga gratis plantillas en PDF con medidas y sangrado para sublimar tapas de agendas A5, cuadernos y blocks de 350gr. Insumos en San José de Mayo.",
  alternates: {
    canonical: "https://www.kamaluso.com/plantillas-sublimacion",
  },
  openGraph: {
    title: "Plantillas Gratuitas para Sublimar Tapas y Agendas en Uruguay | Kamaluso",
    description:
      "Descargas en PDF de plantillas con sangrado para agendas A5, mini blocks y cuadernos. Fabricación de tapas 350g en San José de Mayo.",
    url: "https://www.kamaluso.com/plantillas-sublimacion",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Plantillas Gratuitas para Sublimación Kamaluso",
      },
    ],
  },
};

export const revalidate = 86400;

export default async function PlantillasSublimacionPage() {
  const recursos = await getAllResources();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 font-bold text-xs uppercase tracking-wider">
          <Download className="w-4 h-4 text-brand-600" />
          Descargas 100% Gratuitas
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Plantillas para Sublimar Tapas de Agendas y Libretas
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Descarga los archivos en PDF con sangrado de 5mm listos para diseñar en Canva, Photoshop o Illustrator. Compatibles con tapas de cartón 350gr Kamaluso.
        </p>
      </div>

      {/* Grid de Recursos */}
      <RecursosListClient initialRecursos={recursos} />

      {/* Tabla de Medidas Exactas */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Tabla de Medidas para Portadas Sublimables
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="font-extrabold text-slate-900 block text-sm">Formato A5 (Agendas)</span>
            <p className="text-slate-600">• Tamaño Tapa: <strong>15 x 21 cm</strong></p>
            <p className="text-slate-600">• Área de Diseño: <strong>15.5 x 21.5 cm</strong></p>
            <p className="text-slate-500">• Margen Espiral: 10 mm libres a la izquierda</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="font-extrabold text-slate-900 block text-sm">Formato 10x15 (Blocks)</span>
            <p className="text-slate-600">• Tamaño Tapa: <strong>10 x 15 cm</strong></p>
            <p className="text-slate-600">• Área de Diseño: <strong>10.5 x 15.5 cm</strong></p>
            <p className="text-slate-500">• Margen Espiral: 8 mm libres en cabecera</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="font-extrabold text-slate-900 block text-sm">Formato 21x30 (Cuadernolas)</span>
            <p className="text-slate-600">• Tamaño Tapa: <strong>21 x 30 cm</strong></p>
            <p className="text-slate-600">• Área de Diseño: <strong>21.5 x 30.5 cm</strong></p>
            <p className="text-slate-500">• Margen Espiral: 12 mm libres a la izquierda</p>
          </div>
        </div>
      </div>

      {/* CTA Insumos */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4">
        <h3 className="text-2xl font-bold">¿Ya tienes tu diseño listo para estampar?</h3>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Pide tus kits de tapas de cartón 350gr con polímero e interiores temáticos. Despachamos a todo Uruguay por DAC y Correo sin mínimo de compra.
        </p>
        <div className="pt-2 flex justify-center gap-4 flex-wrap">
          <Link
            href="/#catalogo"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all"
          >
            Ver Catálogo de Insumos
          </Link>
          <Link
            href="/guia-sublimacion-papeleria"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-2xl text-sm border border-slate-700 transition-all"
          >
            Ver Tiempos y Temperaturas
          </Link>
        </div>
      </div>
    </div>
  );
}
