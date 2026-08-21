import React from "react";
import Image from "next/image";
import { ShieldCheck, Heart, Sparkles, Truck, CheckCircle2, Instagram, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Sobre Nosotros | Kamaluso San José, Papelería Sublimable",
  description:
    "Nos especializamos en la confección de artículos de papelería sublimables en San José, Uruguay: agendas, libretas, blocks y cuadernos para sublimadores y revendedores.",
  alternates: {
    canonical: "https://www.kamaluso.com/sobre-nosotros/",
  },
  openGraph: {
    title: "Sobre Nosotros | Kamaluso San José, Papelería Sublimable",
    description:
      "Fabricantes directos de insumos para sublimación en San José de Mayo. Envíos a todo Uruguay sin mínimo de compra.",
    url: "https://www.kamaluso.com/sobre-nosotros/",
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
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
          Conócenos
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Somos Kamaluso San José
        </h1>
        <p className="text-slate-600 leading-relaxed text-base max-w-2xl mx-auto">
          Especialistas en insumos de papelería sublimable para emprendedores de todo el Uruguay.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900">
            Papelería para sublimadores y revendedores
          </h2>
          <p>
            Somos fabricantes directos ubicados en <strong className="text-slate-900">San José, Uruguay</strong>, dedicados a la confección de insumos de papelería sublimable de alta calidad (<strong className="text-slate-900">agendas 2026/27, libretas, planners, blocks y cuadernos</strong>). Despachamos rápidamente a los 19 departamentos del país y sin mínimos de compra.
          </p>
          <p>
            Diseñamos cada artículo pensando en <strong className="text-slate-900">colegas sublimadores, imprentas y talleres creativos</strong>. Te entregamos interiores impresos con máxima nitidez, espirales continuos y tapas de 350g listas para fijar colores intensos con prensa plana de calor, garantizando un acabado profesional que hace destacar y hacer crecer tu negocio.
          </p>
        </div>

        {/* Highlight points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Tapas con recubrimiento de polímero virgen</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Interiores impresos en excelente definición</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Espirales continuos resistentes</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Envíos diarios vía Correo Uruguayo, DAC y Agencias</span>
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
              <h4 className="font-bold text-slate-900 text-base">Síguenos en Instagram</h4>
              <p className="text-xs text-slate-600">
                Mira fotos de nuestros procesos de taller, novedades de agendas y tips de sublimación en <strong>@kamaluso_sanjose</strong>.
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
