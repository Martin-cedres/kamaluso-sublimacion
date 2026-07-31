import React from "react";
import Link from "next/link";
import { GLOBAL_FAQ_ITEMS, getFaqSchema } from "@/lib/schema";
import { HelpCircle, ChevronRight, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Preguntas Frecuentes (FAQ) | Kamaluso Sublimación Uruguay",
  description:
    "Respuestas sobre tiempos de sublimado (170ºC/120s), mínimos de compra, envíos desde San José de Mayo a todo Uruguay y formatos de papel.",
  alternates: {
    canonical: "https://www.kamaluso.com/faq/",
  },
};

export default function FaqPage() {
  const faqSchema = getFaqSchema();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Script JSON-LD para Motores de IA y Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-brand-600">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">Preguntas Frecuentes</span>
      </nav>

      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-brand-600" /> Centro de Ayuda para Sublimadores
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Preguntas Frecuentes
        </h1>
        <p className="text-slate-600 leading-relaxed text-base max-w-2xl mx-auto">
          Resuelve todas tus dudas sobre estampación, parámetros de calor, despachos y envíos a todo Uruguay.
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="space-y-4">
        {GLOBAL_FAQ_ITEMS.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2 hover:border-brand-200 transition-all"
          >
            <h3 className="font-bold text-slate-900 text-lg flex items-start gap-2">
              <span className="text-brand-600 font-black text-xl leading-none">?</span>
              <span>{item.question}</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed pl-6">
              {item.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Contacto Directo */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4 shadow-xl">
        <h3 className="text-xl font-bold">¿Tienes alguna otra consulta técnica?</h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Te asesoramos de forma personalizada en San José de Mayo para que tus productos sublimados queden perfectos.
        </p>
        <a
          href="https://wa.me/59898615074?text=Hola%20Kamaluso,%20tengo%20una%20consulta%20sobre..."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Consultar por WhatsApp (098 615 074)</span>
        </a>
      </div>
    </div>
  );
}
