import React from "react";
import { getAllResources } from "@/lib/resources";
import RecursosListClient from "@/components/recursos/RecursosListClient";

export const metadata = {
  title: "Plantillas y Archivos Descargables | Kamaluso Papelería Sublimable",
  description:
    "Descarga plantillas en PDF/PNG y guías de sublimación para tus tapas de agendas, libretas y blocks. Recursos 100% gratuitos para sublimadores de Uruguay.",
};

export const revalidate = 60;

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
