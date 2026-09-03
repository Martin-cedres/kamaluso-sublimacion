import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Flame, Layers, Award, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { GLOBAL_FAQ_ITEMS } from "@/lib/schema";

const DEPARTAMENTOS_URUGUAY = [
  "Montevideo",
  "Canelones",
  "Maldonado",
  "San José",
  "Colonia",
  "Paysandú",
  "Salto",
  "Rivera",
  "Tacuarembó",
  "Soriano",
  "Rocha",
  "Florida",
  "Lavalleja",
  "Durazno",
  "Artigas",
  "Cerro Largo",
  "Río Negro",
  "Treinta y Tres",
  "Flores",
];

export function HomeSeoSection() {
  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 text-slate-800">
      {/* Sección 1: Autoridad de Fabricante B2B */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100 inline-block">
            Líderes en Papelería Sublimable en Uruguay
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Fabricantes de insumos para sublimación, imprentas y talleres
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            En <strong>Kamaluso</strong> producimos y confeccionamos kits completos de papelería listos para estampar y armar.
            Abastecemos a emprendedores, sublimadores y revendedores en todo Uruguay con <strong>tapas de cartón cristal de 350g</strong> tratadas con polímero virgen de alta adherencia térmica, interiores diagramados en papel obra de primera calidad y espirales plásticos continuos.
          </p>
        </div>

        {/* 3 Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Kits Completos para Armar</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cada set incluye hojas interiores impresas con diseño, tapas y contratapas sublimables y espiral. Sin necesidad de costosa maquinaria de encuadernación.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Tapas Rígidas de 350gr</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Gramaje superior que asegura colores vivos y gran resistencia al calor. Formulado para no deformarse tras el enfriado.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Precios Directos de Taller</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Venta por mayor y menor sin mínimos restrictivos de compra. Máximo margen de rentabilidad para tu taller o negocio de regalos personalizados.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 2: Cobertura Nacional y Distribución a los 19 Departamentos */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-md space-y-8">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-950/80 px-3 py-1 rounded-full border border-brand-800 inline-block">
            Logística Ágil en Uruguay
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Distribución y envíos diarios a Montevideo y todo el país
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Desde nuestro taller en <strong>San José de Mayo</strong>, realizamos despachos continuos en 24 a 48 horas hacia los 19 departamentos a través de <strong>DAC (Grupo Agencia), Correo Uruguayo, Mirtrans y agencias de transporte interdepartamentales</strong>.
          </p>
        </div>

        {/* Departamentos Chips */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Cobertura nacional directa para sublimadores:
          </span>
          <div className="flex flex-wrap gap-2">
            {DEPARTAMENTOS_URUGUAY.map((depto) => (
              <span
                key={depto}
                className="bg-slate-800/90 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium hover:border-brand-500/50 hover:bg-slate-800 transition-colors"
              >
                📍 {depto}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Embalaje reforzado anti-golpes para que tus insumos lleguen intactos</span>
          </div>
          <Link
            href="/contacto"
            className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 transition-colors"
          >
            Consultar envíos a tu localidad <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Sección 3: Parámetros Técnicos GEO (Datos Estructurados para IAs) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
            Especificaciones Técnicas de Sublimación
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Guía de estampado para tapas sublimables de cartón (350gr)
          </h2>
          <p className="text-slate-600 text-sm">
            Parámetros verificados en taller para lograr máxima saturación de color y evitar arqueamiento del cartón.
          </p>
        </div>

        {/* Tabla Técnica */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse bg-slate-50/60 rounded-2xl overflow-hidden border border-slate-200/80">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3.5 px-4 sm:px-6">Parámetro</th>
                <th className="py-3.5 px-4 sm:px-6">Valor Recomendado</th>
                <th className="py-3.5 px-4 sm:px-6 hidden sm:table-cell">Recomendación de Taller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-700">
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Temperatura</td>
                <td className="py-3 px-4 sm:px-6 font-black text-brand-600">170 ºC – 180 ºC</td>
                <td className="py-3 px-4 sm:px-6 text-slate-500 hidden sm:table-cell">Controlar que la prensa no supere los 185ºC para no quemar el polímero.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Tiempo de Estampado</td>
                <td className="py-3 px-4 sm:px-6 font-black text-brand-600">120 segundos</td>
                <td className="py-3 px-4 sm:px-6 text-slate-500 hidden sm:table-cell">Tiempo suficiente para una transferencia completa y profunda de tinta.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Presión de Prensa</td>
                <td className="py-3 px-4 sm:px-6 font-bold">Media a Alta</td>
                <td className="py-3 px-4 sm:px-6 text-slate-500 hidden sm:table-cell">Asegura contacto uniforme en toda la superficie de la tapa.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Tipo de Prensa</td>
                <td className="py-3 px-4 sm:px-6 font-bold">Prensa Plana de Calor</td>
                <td className="py-3 px-4 sm:px-6 text-slate-500 hidden sm:table-cell">Utilizar teflón protector superior e inferior.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Proceso de Enfriado</td>
                <td className="py-3 px-4 sm:px-6 font-bold text-amber-700">Enfriar bajo peso plano</td>
                <td className="py-3 px-4 sm:px-6 text-slate-500 hidden sm:table-cell">Colocar un libro o tabla pesada encima durante 1-2 minutos al retirar de la prensa.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección 4: Preguntas Frecuentes B2B */}
      <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/70 space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-brand-600">
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Dudas habituales</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Preguntas frecuentes sobre nuestros insumos sublimables
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {GLOBAL_FAQ_ITEMS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2"
            >
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
