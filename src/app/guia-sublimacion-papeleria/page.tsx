import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Flame, ShieldCheck, HelpCircle, CheckCircle2, ArrowRight, AlertTriangle, Sparkles, BookOpen, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Guía de Sublimación de Papelería: Tiempos y Temperaturas en Uruguay | Kamaluso",
  description:
    "Aprende a estampar tapas sublimables de cartón de 350gr con acabado profesional y sin que se doblen. Tabla de parámetros (170ºC / 120s), presión y tips de taller.",
  alternates: {
    canonical: "https://www.kamaluso.com/guia-sublimacion-papeleria",
  },
  openGraph: {
    title: "Guía de Sublimación de Papelería: Parámetros Oficiales | Kamaluso Uruguay",
    description:
      "Tiempos, temperaturas y trucos de taller para sublimar tapas de 350g sin arqueamiento en Uruguay. Parámetros verificados en prensa plana.",
    url: "https://www.kamaluso.com/guia-sublimacion-papeleria",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "article",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Guía Técnica de Sublimación de Papelería Kamaluso",
      },
    ],
  },
};

const jsonLdHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Cómo sublimar tapas de cartón de 350gr para agendas y libretas sin que se doblen",
  "description": "Procedimiento paso a paso para estampar tapas de papelería sublimable con polímero virgen en Uruguay.",
  "totalTime": "PT5M",
  "supply": [
    { "@type": "HowToSupply", "name": "Tapas de cartón cristal 350gr Kamaluso" },
    { "@type": "HowToSupply", "name": "Papel de sublimación impreso en modo espejo con tinta de sublimación" },
    { "@type": "HowToSupply", "name": "Cinta térmica de alta temperatura" },
    { "@type": "HowToSupply", "name": "Papel manteca o teflón protector" }
  ],
  "tool": [
    { "@type": "HowToTool", "name": "Prensa térmica plana de calor" },
    { "@type": "HowToTool", "name": "Objeto plano y pesado (libro, tabla o bloque de madera) para enfriar" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Preparar la impresión y encintado",
      "text": "Imprime tu diseño en papel para sublimar en espejo. Fija el papel a la tapa de 350g utilizando cinta térmica en las cuatro esquinas para evitar imágenes fantasma.",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "Configurar la prensa plana",
      "text": "Calienta la prensa térmica plana a 170ºC o 180ºC con presión media a alta. Coloca papel manteca o teflón para proteger la base.",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Estampar durante 120 segundos",
      "text": "Coloca la tapa con el papel hacia arriba y cierra la prensa térmica plana durante 120 segundos constantes.",
      "position": 3
    },
    {
      "@type": "HowToStep",
      "name": "Enfriar bajo peso plano (El secreto anti-arqueamiento)",
      "text": "Retira la tapa con guantes térmicos, retira rápidamente el papel de sublimación y colócala de inmediato sobre una superficie plana bajo un objeto pesado (libro, madera o mármol) durante 1 a 2 minutos hasta que enfríe por completo.",
      "position": 4
    }
  ]
};

export default function GuiaSublimacionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
      />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-600" />
          Guía Técnica Oficial Kamaluso
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Cómo Sublimar Tapas de Cartón (350gr) con Acabado Profesional
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Tiempos, temperaturas exactas y el método definitivo de taller para lograr colores intensos, nitidez fotográfica y evitar que las tapas se doblen o curven.
        </p>
      </div>

      {/* Parámetros Rápidos / Ficha de Taller */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 sm:p-10 rounded-3xl shadow-lg space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-amber-400/40 pb-4">
          <div>
            <span className="text-amber-100 text-xs font-bold uppercase tracking-wider block">
              Parámetros Estándar Verificados
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Prensa Plana Térmica</h2>
          </div>
          <span className="bg-white text-amber-900 font-black text-sm px-4 py-2 rounded-xl shadow-xs">
            Tapas Kamaluso 350g
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-amber-700/40 p-4 rounded-2xl border border-amber-400/30">
            <span className="text-amber-200 text-xs block font-semibold">Temperatura</span>
            <span className="text-2xl sm:text-3xl font-black">170º - 180º C</span>
          </div>
          <div className="bg-amber-700/40 p-4 rounded-2xl border border-amber-400/30">
            <span className="text-amber-200 text-xs block font-semibold">Tiempo</span>
            <span className="text-2xl sm:text-3xl font-black">120 seg</span>
          </div>
          <div className="bg-amber-700/40 p-4 rounded-2xl border border-amber-400/30">
            <span className="text-amber-200 text-xs block font-semibold">Presión</span>
            <span className="text-2xl sm:text-3xl font-black">Media - Alta</span>
          </div>
          <div className="bg-amber-700/40 p-4 rounded-2xl border border-amber-400/30">
            <span className="text-amber-200 text-xs block font-semibold">Enfriado</span>
            <span className="text-xl sm:text-2xl font-black">Bajo Peso</span>
          </div>
        </div>
      </div>

      {/* Paso a Paso */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Metodología de Producción</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Paso a paso para estampar tus agendas y libretas
          </h2>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black flex-shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">Diseño e Impresión en Espejo</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Diseña tu portada dejando <strong>5 mm de sangrado adicional</strong> por lado (ej. si tu tapa mide 15x21cm, diseña en 15.5x21.5cm). Imprime en papel de sublimación de secado rápido siempre en <strong>modo espejo</strong> con perfil de color fotográfico.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black flex-shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">Encintado Térmico Firme</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Coloca la tapa con el lado blanco resinado frente al papel impreso. Pega con cinta térmica en los 4 extremos. La tensión firme evita que el papel se mueva al abrir la prensa y provoque efecto "fantasma" o desenfoque.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black flex-shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">Prensado a 170ºC – 180ºC por 120 Segundos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Usa una lámina de teflón o papel limpio arriba y abajo para proteger las placas de tu prensa. Cierra la prensa con presión uniforme media a alta. El tiempo de 120s garantiza que el gas de la tinta penetre profundamente en el polímero virgen de la tapa.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-amber-50/70 p-5 rounded-2xl border border-amber-200">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-amber-950 flex items-center gap-2">
                <span>El Secreto de Taller: Enfriamiento Bajo Peso</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Al sonar el temporizador, abre la prensa y <strong>retira el papel de sublimación de inmediato</strong> con guantes. Enseguida, coloca la tapa recién salida sobre una mesa plana y apoya encima un libro grueso, una tabla de madera o una plancha metálica fría durante <strong>60 a 120 segundos</strong>. Esto fija la rigidez del cartón de 350g mientras se enfría, garantizando una tapa 100% recta y libre de arqueamiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solución a los 4 Errores Comunes */}
      <section className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Resolución de Problemas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Los 4 errores más frecuentes al sublimar papelería y cómo evitarlos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ¿Por qué la tapa queda combada o doblada?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              El calor evapora la humedad natural del cartón y provoca tensión superficial. Se soluciona al 100% aplicando peso plano inmediatamente al retirarla de la prensa mientras las fibras se enfrían.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ¿Por qué el papel se pega al cartón?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ocurre por exceso de temperatura (más de 185ºC) o por retirar el papel cuando la tapa ya se enfrió. Asegúrate de retirar el papel en caliente con un movimiento fluido.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ¿Por qué los tonos negros salen marrones?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Es el clásico síntoma de "quemado" por exceso de tiempo o temperatura. Baja la plancha a 170ºC exactos y comprueba con un termómetro láser que la resistencia sea uniforme.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ¿Por qué los bordes quedan con menos color?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Indica falta de presión o silicona desgastada en la base de la prensa. Ajusta la perilla de presión a media-alta para que la fuerza sea pareja en el centro y las esquinas.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Transaccional al Catálogo */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-md">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-200 bg-brand-800/60 px-3 py-1 rounded-full inline-block">
            Insumos Listos para Estampar
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            ¿Listo para poner en práctica estos parámetros?
          </h3>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
            Consigue nuestras tapas de 350g, interiores de agendas temáticas y kits completos con espirales al mejor precio de fábrica en Uruguay. Sin mínimo de compra.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/#catalogo"
            className="bg-white text-brand-700 font-extrabold px-6 py-3.5 rounded-2xl hover:bg-brand-50 transition-all shadow-md flex items-center gap-2 text-sm"
          >
            <span>Ver Catálogo de Insumos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/recursos"
            className="bg-brand-800/80 hover:bg-brand-800 text-white font-bold px-6 py-3.5 rounded-2xl transition-all border border-brand-500/50 text-sm"
          >
            Descargar Plantillas Gratis (PDF)
          </Link>
        </div>
      </div>
    </div>
  );
}
