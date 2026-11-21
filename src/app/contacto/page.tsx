import React from "react";
import { MapPin, Mail, Clock, Instagram, ExternalLink } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { KAMALUSO_WHATSAPP } from "@/lib/whatsapp";

export const metadata = {
  title: "Contacto | Kamaluso Papelería Sublimable Uruguay",
  description:
    "Contactá a Kamaluso en Ramón Massini 136, San José de Mayo, Uruguay. Atención mayorista por WhatsApp (+598 98 615 074), horarios y envíos a los 19 departamentos.",
  alternates: {
    canonical: "https://www.kamaluso.com/contacto",
  },
  openGraph: {
    title: "Contacto | Kamaluso Papelería Sublimable Uruguay",
    description:
      "Ponte en contacto con Kamaluso en San José de Mayo, Uruguay. Consultas directas por WhatsApp sobre insumos sublimables.",
    url: "https://www.kamaluso.com/contacto",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Contacto Kamaluso Sublimación",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Kamaluso Sublimación Uruguay",
    description:
      "Ponte en contacto con Kamaluso en San José de Mayo, Uruguay. Consultas directas por WhatsApp.",
    images: ["https://www.kamaluso.com/agenda_fondo_kamaluso.jpg"],
  },
};

export default function ContactoPage() {
  const whatsappUrl = `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(
    "¡Hola Kamaluso! Quisiera realizar una consulta general sobre sus productos sublimables."
  )}`;
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Ram%C3%B3n+Massini+136,+San+Jos%C3%A9+de+Mayo,+Uruguay";

  const jsonLdContact = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": "https://www.kamaluso.com/contacto#webpage",
        "url": "https://www.kamaluso.com/contacto",
        "name": "Contacto | Kamaluso Papelería Sublimable Uruguay",
        "description":
          "Información de contacto, dirección en Ramón Massini 136 (San José de Mayo), horarios y atención mayorista B2B de Kamaluso.",
        "inLanguage": "es-UY",
        "mainEntity": {
          "@id": "https://www.kamaluso.com/#organization",
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://www.kamaluso.com",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Contacto",
            "item": "https://www.kamaluso.com/contacto",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContact) }}
      />
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
          Atención Mayorista y Minorista
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Contacto Directo
        </h1>
        <p className="text-slate-600 leading-relaxed text-base max-w-xl mx-auto">
          ¿Tenés dudas sobre los tiempos de estampado, formatos, interiores por separado o pedidos al por mayor? Escribinos directamente por WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Cards */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Información de Contacto
          </h2>

          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <WhatsAppIcon className="w-5 h-5 fill-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">WhatsApp / Atención Directa</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  +598 98 615 074
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Dirección de Taller y Retiros</p>
                <p className="font-bold text-slate-900">
                  Ramón Massini 136, San José de Mayo, San José, CP 80000, Uruguay
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 underline"
                >
                  <span>Ver ubicación en Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Instagram Oficial</p>
                <a
                  href="https://www.instagram.com/kamaluso_sanjose/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 hover:text-pink-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>@kamaluso_sanjose</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Correo Electrónico</p>
                <a
                  href="mailto:kamalusosanjose@gmail.com"
                  className="font-bold text-slate-900 hover:text-brand-700 transition-colors"
                >
                  kamalusosanjose@gmail.com
                </a>
              </div>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white" />
            <span>Chatear por WhatsApp (098 615 074)</span>
          </a>
        </div>

        {/* Info box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Horarios de Atención</h2>
            <p className="text-slate-200 text-sm font-semibold">
              Lunes a Viernes de 09:00 a 18:00 hs
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Atendemos consultas y retiros en taller de lunes a viernes de 09:00 a 18:00 hs. Despachamos pedidos en un plazo estimado de 48 horas hábiles tras la confirmación de pago.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-700 pt-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Respuesta rápida por WhatsApp en horario laboral</span>
            </div>
            <p>Despachos a Montevideo y los 19 departamentos vía DAC, Correo Uruguayo y Agencia COTMI.</p>
          </div>
        </div>
      </div>

      {/* Mapa embebido de ubicación */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ubicación del Taller en San José de Mayo</h2>
            <p className="text-xs text-slate-500">Ramón Massini 136, CP 80000 • Retiro sin costo coordinado</p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 underline"
          >
            <span>Abrir en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-64 sm:h-80">
          <iframe
            src="https://www.google.com/maps?q=Ram%C3%B3n+Massini+136,+San+Jos%C3%A9+de+Mayo,+Uruguay&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa ubicación Kamaluso Ramón Massini 136, San José de Mayo"
          />
        </div>
      </div>
    </div>
  );
}
