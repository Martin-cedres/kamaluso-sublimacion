import React from "react";
import Link from "next/link";
import {
  Layers,
  Award,
  Flame,
  Truck,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Clock,
} from "lucide-react";
import { GLOBAL_FAQ_ITEMS } from "@/lib/schema";

export function HomeSeoSection() {
  // Tomamos las 3 dudas más críticas para compra B2B
  const topFaqs = GLOBAL_FAQ_ITEMS.slice(0, 3);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 text-slate-800 space-y-8">
      {/* 1. Autoridad B2B & Pilares de Fabricante */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100 inline-block">
            Líderes en Papelería Sublimable en Uruguay
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fabricantes directos de insumos para sublimación y talleres
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            En <strong>Kamaluso</strong> producimos kits completos listos para estampar y armar. Abastecemos a emprendedores y revendedores de todo Uruguay con tapas de 350g tratadas con polímero virgen de alta adherencia térmica, interiores diagramados en papel obra de primera calidad y espirales continuos.
          </p>
        </div>

        {/* 3 Pilares compactos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Kits Listos para Armar</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tapas, contratapas, hojas impresas y espiral. Emprende o produce en serie sin costosa maquinaria de encuadernación.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Tapas Rígidas de 350gr</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Polímero virgen que asegura colores vivos y resistencia al calor para un enfriamiento plano sin deformaciones.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Precios Directos de Taller</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Venta por mayor y menor sin mínimos de compra. Margen de rentabilidad óptimo para talleres y revendedores.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Banner Logístico y Cobertura Nacional */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-950/80 px-2.5 py-0.5 rounded-full border border-brand-800">
              Logística Nacional
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Despachos en 24 a 48 hs
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Envíos diarios a Montevideo y todo el interior
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Desde nuestro taller en <strong>San José de Mayo</strong> realizamos envíos a todo Uruguay mediante <strong>DAC (Grupo Agencia), Correo Uruguayo y Agencia COTMI</strong> con embalaje reforzado anti-golpes.
          </p>
        </div>

        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm flex-shrink-0"
        >
          Consultar envíos <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3. Recursos de Taller & Preguntas Frecuentes (Dúo Equilibrado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acceso a Guía Técnica de Estampado */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white p-6 sm:p-8 rounded-3xl border border-amber-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-amber-800 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> Parámetros de Taller
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              ¿Cómo estampar las tapas sublimables de 350gr?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Prensa térmica plana a <strong>170ºC – 180ºC durante 120 segundos</strong> a presión media/alta y enfriado inmediato bajo peso plano para un acabado perfecto sin curvaturas.
            </p>
          </div>
          <Link
            href="/guia-sublimacion-papeleria"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 px-4 py-2.5 rounded-xl transition-colors w-fit"
          >
            Ver Guía Completa de Sublimación <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dudas Habituales Compactas */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" /> Dudas Habituales
            </div>
            <div className="space-y-2">
              {topFaqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs sm:text-sm transition-colors open:bg-white open:border-slate-200"
                >
                  <summary className="font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between gap-2">
                    <span>{faq.question}</span>
                    <span className="text-slate-400 group-open:rotate-90 transition-transform font-mono text-xs">
                      ›
                    </span>
                  </summary>
                  <p className="pt-2 text-slate-600 text-xs leading-relaxed border-t border-slate-100 mt-2">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Ver todas las preguntas en el FAQ <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
