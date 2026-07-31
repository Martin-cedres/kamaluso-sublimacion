import React from "react";
import { MapPin, Mail, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { KAMALUSO_WHATSAPP } from "@/lib/whatsapp";

export const metadata = {
  title: "Contacto | Kamaluso Papelería Sublimable",
  description:
    "Ponte en contacto con Kamaluso en San José, Uruguay. Consultas por ventas mayoristas de agendas, libretas y blocks sublimables.",
};

export default function ContactoPage() {
  const whatsappUrl = `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(
    "¡Hola Kamaluso! Quisiera realizar una consulta general sobre sus productos sublimables."
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
          Atención Mayorista y Minorista
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Contacto Directo
        </h1>
        <p className="text-slate-600 leading-relaxed text-base max-w-xl mx-auto">
          ¿Tienes dudas sobre los tiempos de estampado, formatos o pedidos al por mayor? Escríbenos directamente por WhatsApp.
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
                <p className="font-bold text-slate-900">+598 98 615 074</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Ubicación</p>
                <p className="font-bold text-slate-900">San José, Uruguay</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Correo Electrónico</p>
                <p className="font-bold text-slate-900">kamalusosanjose@gmail.com</p>
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
            <h3 className="text-xl font-bold">Horarios de Atención</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Atendemos consultas de lunes a viernes en horario comercial. Los pedidos realizados vía web se procesan en el día para coordinación de armado y despacho.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-700 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Respuesta rápida en WhatsApp</span>
            </div>
            <p>Envíos por encomienda a todo Uruguay de lunes a sábados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
