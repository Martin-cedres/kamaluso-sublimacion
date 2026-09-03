import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { TrendingUp, Calculator, CheckCircle2, Calendar, ArrowRight, DollarSign, Sparkles, Printer, Layers, Flame } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Cómo Emprender con Papelería Sublimable en Uruguay: Costos y Rentabilidad | Kamaluso",
  description:
    "Descubre cómo iniciar un negocio rentable de agendas y libretas personalizadas en Uruguay. Costos reales en UYU, márgenes de ganancia (+200%) y fechas de mayor venta.",
  alternates: {
    canonical: "https://www.kamaluso.com/emprender-en-papeleria-sublimable",
  },
  openGraph: {
    title: "Guía de Negocio: Emprender con Agendas Sublimables en Uruguay | Kamaluso",
    description:
      "Aprende a montar tu taller de papelería personalizada con prensa plana. Costos reales de fabricación, maquinaria y márgenes de ganancia superiores al 200%.",
    url: "https://www.kamaluso.com/emprender-en-papeleria-sublimable",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "article",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Emprender con Agendas Sublimables en Uruguay",
      },
    ],
  },
};

export default function EmprenderPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 font-bold text-xs uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          Oportunidad de Negocio en Uruguay
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Cómo Iniciar un Negocio de Agendas Personalizadas y Papelería Sublimable
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          La papelería personalizada tiene uno de los mayores márgenes de ganancia en el rubro del estampado en Uruguay. Conoce los números reales, la maquinaria básica y cómo empezar con insumos listos para armar.
        </p>
      </div>

      {/* Desglose de Costos y Ganancias Reales */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Calculator className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Análisis Financiero Real
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ¿Cuánto se le gana a una Agenda Personalizada en Uruguay?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Tarjeta Costo de Fabricación */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Costo de Fabricación
            </span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 block">
              ~$245 <span className="text-sm font-normal text-slate-500">UYU</span>
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/60">
              <li>• Kit Kamaluso (Tapas 350g + Interior impreso + Espiral): <strong>$230 UYU</strong></li>
              <li>• 2 hojas de papel de sublimación + tinta: <strong>~$15 UYU</strong></li>
              <li>• Gasto de energía por 2 minutos de prensa: <strong>Mínimo</strong></li>
            </ul>
          </div>

          {/* Tarjeta Precio de Venta al Público */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. Precio de Venta al Público
            </span>
            <span className="text-3xl sm:text-4xl font-black text-brand-600 block">
              $690 – $950 <span className="text-sm font-normal text-slate-500">UYU</span>
            </span>
            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
              El cliente paga por el valor emocional del diseño personalizado con su nombre, profesión, fotos o frases motivacionales.
            </p>
          </div>

          {/* Tarjeta Ganancia Limpia */}
          <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl shadow-md space-y-3">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block">
              3. Ganancia Neta por Unidad
            </span>
            <span className="text-3xl sm:text-4xl font-black block">
              +$445 – $705 <span className="text-sm font-normal text-emerald-100">UYU</span>
            </span>
            <div className="pt-2 border-t border-emerald-400/40 space-y-1">
              <span className="inline-block bg-white text-emerald-900 font-extrabold text-xs px-2.5 py-1 rounded-full">
                +180% a +280% de Margen
              </span>
              <p className="text-xs text-emerald-100">
                Fabricando solo 20 agendas al mes, generas más de <strong>$10.000 a $14.000 UYU</strong> de ganancia neta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Maquinaria Necesaria: Por qué es tan fácil con Kamaluso */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Barrera de Entrada Mínima
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            El equipamiento que necesitas (Sin anilladoras costosas)
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Muchos emprendedores creen que necesitan invertir miles de dólares en impresoras láser industriales o anilladoras pesadas. Con los kits de <strong>Kamaluso</strong>, ese problema está resuelto:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-bold text-base text-slate-900">1. Impresora con Tintas de Sublimación</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cualquier impresora de inyección de tinta económica adaptada para sublimar (como las líneas Epson EcoTank A4: L3110, L3210, L3250 o L805) es suficiente para imprimir las portadas en papel de sublimación.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-base text-slate-900">2. Prensa Térmica Plana Estándar</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              La misma prensa plana que utilizas para remeras, almohadones o mousepads (de 38x38cm o 40x60cm). No necesitas moldes especiales: estampas las tapas de cartón a 170ºC por 120 segundos.
            </p>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3 text-xs sm:text-sm text-purple-900 font-medium">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <span>
            <strong>¿Y el anillado?</strong> Nuestros kits incluyen las hojas perforadas y el espiral plástico continuo a medida. El ensamblado final toma menos de 2 minutos a mano.
          </span>
        </div>
      </section>

      {/* Calendario de Temporadas de Venta en Uruguay */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-400">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Calendario Comercial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Las 4 temporadas pico para vender papelería en Uruguay
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-brand-400 font-extrabold text-xs uppercase block">Enero – Marzo</span>
            <h4 className="font-bold text-base text-white">Inicio Escolar & Docente</h4>
            <p className="text-xs text-slate-400">
              Gran demanda de agendas docentes de primaria, cuadernos y libretas personalizadas con nombres de niños.
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-brand-400 font-extrabold text-xs uppercase block">Mayo</span>
            <h4 className="font-bold text-base text-white">Día de la Madre</h4>
            <p className="text-xs text-slate-400">
              Momento cumbre para recetarios de cocina, diarios íntimos y agendas semanales personalizadas con fotos familiares.
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-brand-400 font-extrabold text-xs uppercase block">Julio – Septiembre</span>
            <h4 className="font-bold text-base text-white">Zafra del Día del Maestro</h4>
            <p className="text-xs text-slate-400">
              Padres y alumnos encargan agendas personalizadas y planners de agradecimiento para maestras y profesoras.
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-brand-400 font-extrabold text-xs uppercase block">Octubre – Diciembre</span>
            <h4 className="font-bold text-base text-white">Lanzamiento Agendas Anuales</h4>
            <p className="text-xs text-slate-400">
              La mayor temporada del año: preventa de agendas para el nuevo año y regalos corporativos de fin de año para empresas.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-200 bg-brand-800/60 px-3 py-1 rounded-full inline-block">
            Empieza Hoy Mismo
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Comienza tu taller con nuestro Kit Promo Mayorista
          </h3>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
            Pide nuestro paquete promocional de 10 agendas semanales sublimables con descuento ($2.100 UYU) y despáchate a estampar con asesoramiento técnico directo.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/p/kit-10-1-agendas-semanales-sublimables"
            className="bg-white text-brand-700 font-extrabold px-7 py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-lg flex items-center gap-2 text-sm"
          >
            <span>Ver Kit Promo 10 Agendas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/guia-sublimacion-papeleria"
            className="bg-brand-900/60 hover:bg-brand-900 text-white font-bold px-6 py-4 rounded-2xl transition-all border border-brand-400/40 text-sm"
          >
            Ver Guía de Tiempos y Temperaturas
          </Link>
        </div>
      </div>
    </div>
  );
}
