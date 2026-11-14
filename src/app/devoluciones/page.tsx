import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  Truck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Cambios y Devoluciones | Kamaluso Papelería Sublimable",
  description:
    "Política oficial de cambios y devoluciones de Kamaluso Papelería Sublimable en Uruguay. Plazo de 5 días corridos exclusivamente por defectos de fabricación de origen, exclusiones por errores de sublimación y procedimiento de contacto en San José de Mayo.",
  alternates: {
    canonical: "https://www.kamaluso.com/devoluciones",
  },
  openGraph: {
    title: "Política de Cambios y Devoluciones | Kamaluso Papelería Sublimable",
    description:
      "Condiciones oficiales de cambios y devoluciones en Uruguay: plazo de 5 días corridos por defectos de fabricación de origen previos a la prensa térmica.",
    url: "https://www.kamaluso.com/devoluciones",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Política de Cambios y Devoluciones Kamaluso",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Cambios y Devoluciones | Kamaluso Papelería Sublimable",
    description:
      "Condiciones oficiales de cambios y devoluciones para talleres y emprendedores en Uruguay.",
    images: ["https://www.kamaluso.com/agenda_fondo_kamaluso.jpg"],
  },
};

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantía de Origen • Uruguay</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Política de Cambios y Devoluciones
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            Última actualización: Noviembre de 2026 • Vigente para todas las compras realizadas en{" "}
            <strong>www.kamaluso.com</strong>
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* 1. Plazo de Reclamo */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <span>1. Plazo de Reclamo</span>
            </h2>
            <p>
              El comprador dispone de un plazo máximo de <strong>5 días corridos</strong> contados desde la fecha de recepción del pedido (mediante DAC, Correo Uruguayo, Agencia COTMI o retiro presencial en taller) para informar y gestionar un cambio o devolución por inconvenientes comprobables de origen.
            </p>
            <p>
              Recomendamos revisar los kits, tapas sublimables e interiores impresos apenas recibas tu encomienda y antes de iniciar el proceso de estampado en prensa térmica.
            </p>
          </section>

          {/* 2. Alcance */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>2. Alcance: Exclusivamente por Defectos de Fabricación de Origen</span>
            </h2>
            <p>
              Por tratarse de insumos de papelería y materias primas destinadas a producción e impresión en talleres de sublimación, <strong>únicamente se aceptan cambios o devoluciones por defectos de fabricación comprobables de origen</strong>, entre ellos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>Fallas de impresión o compaginado en las hojas interiores.</li>
              <li>Faltante de hojas o componentes incluidos dentro del kit adquirido.</li>
              <li>Espirales plásticos dañados o partidos de origen.</li>
              <li>
                Defectos estructurales en el cartón cristal de 350gr o fallas visibles en el recubrimiento de polímero virgen{" "}
                <strong>detectados de forma previa a que el material sea intervenido en prensa térmica</strong>.
              </li>
            </ul>
          </section>

          {/* 3. Exclusiones Expresas */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>3. Exclusiones Expresas</span>
            </h2>
            <p>
              No se realizan cambios ni devoluciones en ninguna de las siguientes situaciones:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Arrepentimiento de compra</strong> una vez confirmado, elaborado o despachado el pedido.
              </li>
              <li>
                <strong>Selección incorrecta de formato, medida o modelo</strong> por parte del comprador (por ejemplo, confusión entre formatos A4 21x30cm, 17x22cm o A5 15x21cm, o entre diagramaciones semanales y diarias).
              </li>
              <li>
                <strong>Errores en el proceso de sublimación del taller comprador</strong>: exceso o falta de temperatura, tiempo o presión en la prensa térmica, quemado del polímero, efecto fantasma por movimiento del papel, adhesión del papel por enfriado incorrecto o curvatura del cartón por omisión del prensado en frío bajo peso plano.
              </li>
            </ul>

            <div className="p-4 sm:p-5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2 mt-4">
              <div className="flex items-center gap-2 font-extrabold text-amber-950 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>¿Tuviste un error al sublimar una portada? No deseches tu agenda</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Si una tapa se quemó, manchó o corrió durante el estampado en tu taller, podés adquirir únicamente el{" "}
                <Link
                  href="/p/pack-2-tapas"
                  className="font-bold text-brand-700 underline decoration-brand-400 hover:text-brand-800"
                >
                  Pack de 2 Tapas de Repuesto por separado
                </Link>{" "}
                sin tener que descartar los interiores ni el espiral. También podés repasar los parámetros exactos (170ºC – 180ºC / 120 segundos y enfriado bajo peso plano) en nuestra{" "}
                <Link
                  href="/guia-sublimacion-papeleria"
                  className="font-bold text-amber-950 underline decoration-amber-400 hover:text-amber-800 inline-flex items-center gap-1"
                >
                  <span>Guía Técnica de Sublimación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                .
              </p>
            </div>
          </section>

          {/* 4. Procedimiento y Costos de Envío */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" />
              <span>4. Procedimiento de Reclamo y Costos de Envío</span>
            </h2>
            <p>
              Para gestionar cualquier reclamo dentro de los <strong>5 días corridos</strong> posteriores a la recepción, es obligatorio <strong>contactarse previamente</strong> con nuestro equipo antes de despachar ningún paquete:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /> WhatsApp Oficial
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  098 615 074 (+598 98 615 074)
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Correo Electrónico
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  kamalusosanjose@gmail.com
                </p>
              </div>
            </div>

            <p>
              En el mensaje deberás indicar tu <strong>número de pedido</strong> y adjuntar <strong>fotos o video nítido</strong> donde se aprecie claramente el defecto de origen del insumo sin uso en prensa.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 space-y-1">
                <p>
                  <strong>Dirección de retorno y costos de flete:</strong> Una vez aprobado el caso, el envío del producto hacia nuestro taller ubicado en <strong>Ramón Massini 136, San José de Mayo (CP 80000, San José, Uruguay)</strong> o hacia la agencia designada <strong>corre por cuenta del comprador</strong>.
                </p>
                <p>
                  También podés optar por la <strong>entrega presencial sin cargo</strong> directamente en nuestro taller de San José de Mayo en horario de atención (lunes a viernes de 09:00 a 18:00 hs).
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
