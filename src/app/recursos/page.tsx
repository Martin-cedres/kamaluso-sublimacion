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

      {/* Nota sobre papeleriapersonalizada.uy */}
      <div className="p-6 bg-gradient-to-r from-brand-50 via-white to-purple-50 rounded-3xl border border-brand-100 text-center space-y-3">
        <h4 className="font-extrabold text-slate-900 text-base">
          ¿Buscas artículos personalizados para consumidor final?
        </h4>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Visita nuestro portal hermano{" "}
          <a
            href="https://www.papeleriapersonalizada.uy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-600 hover:underline"
          >
            www.papeleriapersonalizada.uy
          </a>{" "}
          para asesoramiento en agendas y regalos terminados en San José de Mayo.
        </p>
      </div>
    </div>
  );
}
