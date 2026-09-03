import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Truck, ShieldCheck, CreditCard, ShoppingBag, ArrowRight, CheckCircle2, Percent, Sparkles, Building2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Insumos para Sublimación por Mayor en Uruguay | Kamaluso Mayoristas",
  description:
    "Comprar tapas de 350g, interiores de agendas y libretas sublimables por mayor. Fabricación directa en Uruguay, sin mínimos de compra y envíos rápidos por DAC.",
  alternates: {
    canonical: "https://www.kamaluso.com/mayoristas",
  },
  openGraph: {
    title: "Venta Mayorista de Papelería Sublimable en Uruguay | Kamaluso",
    description:
      "Precios directos de fábrica en kits e interiores para sublimar. Descuentos por volumen para talleres y revendedores en los 19 departamentos.",
    url: "https://www.kamaluso.com/mayoristas",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Venta Mayorista Kamaluso Sublimación Uruguay",
      },
    ],
  },
};

const WHATSAPP_MAYORISTA_LINK =
  "https://wa.me/59898615074?text=Hola%20Martín,%20vengo%20del%20portal%20Mayorista%20de%20Kamaluso%20y%20quiero%20consultar%20por%20un%20pedido%20por%20volumen.";

export default function MayoristasPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-emerald-700" />
          Atención a Talleres, Imprentas y Emprendedores
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Insumos de Papelería Sublimable al Por Mayor en Uruguay
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Somos fabricantes directos en San José de Mayo. Abastecemos a revendedores y talleres de sublimación de todo el país con la mejor relación costo-calidad en tapas de 350gr e interiores impresos listos para anillar.
        </p>
      </div>

      {/* 3 Ventajas Mayoristas Kamaluso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Sin Mínimo Obligatorio</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            No necesitas desembolsar grandes sumas de capital. Puedes pedir desde 1 kit de muestra hasta pedidos de 50 o 100 unidades con tarifas preferenciales.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6 text-brand-600" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Despachos en ~48 Horas</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Fabricamos de forma ágil y despachamos diariamente por DAC, Correo Uruguayo o agencias hacia Montevideo y todos los departamentos del interior.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Tapas de 350g con Garantía</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Cartón rígido especial con polímero virgen de alta adherencia térmica para garantizar que tus clientes reciban un producto final de alta gama.
          </p>
        </div>
      </div>

      {/* Tabla de Tarifas y Precios de Referencia */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Tarifario Transparente</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Precios Mayoristas de Referencia (UYU)
            </h2>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full self-start sm:self-auto">
            Actualizado 2026 / 2027
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Insumo / Formato</th>
                <th className="py-3 px-4">Contenido del Kit</th>
                <th className="py-3 px-4 text-right">Precio Unitario</th>
                <th className="py-3 px-4 text-right">Promo Mayorista</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">Block 10x15cm Liso</td>
                <td className="py-3.5 px-4 text-slate-500">Tapa + contratapa 350g + 70 hojas lisas</td>
                <td className="py-3.5 px-4 font-black text-right text-slate-900">$60 UYU</td>
                <td className="py-3.5 px-4 font-bold text-right text-emerald-600">Tarifa Taller</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">Block 10x15cm con Renglones</td>
                <td className="py-3.5 px-4 text-slate-500">Tapa + contratapa 350g + 70 hojas rayadas</td>
                <td className="py-3.5 px-4 font-black text-right text-slate-900">$85 UYU</td>
                <td className="py-3.5 px-4 font-bold text-right text-emerald-600">Tarifa Taller</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">Libreta A5 (15x21 cm)</td>
                <td className="py-3.5 px-4 text-slate-500">Tapa + contratapa 350g + 70 hojas rayadas + espiral</td>
                <td className="py-3.5 px-4 font-black text-right text-slate-900">$140 UYU</td>
                <td className="py-3.5 px-4 font-bold text-right text-emerald-600">Descuento x10</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">Cuadernola 21x30 cm</td>
                <td className="py-3.5 px-4 text-slate-500">Tapa + contratapa 350g + interior con renglones</td>
                <td className="py-3.5 px-4 font-black text-right text-slate-900">$180 UYU</td>
                <td className="py-3.5 px-4 font-bold text-right text-emerald-600">Descuento x10</td>
              </tr>
              <tr className="bg-brand-50/50">
                <td className="py-3.5 px-4 font-black text-brand-900">Agendas Semanales / Perpetuas</td>
                <td className="py-3.5 px-4 text-slate-600">Set completo: Tapas 350g + Interior temático + Espiral</td>
                <td className="py-3.5 px-4 font-black text-right text-brand-700">$230 – $240 UYU</td>
                <td className="py-3.5 px-4 font-black text-right text-emerald-700">KIT x 10 a $2.100 UYU</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          * Para pedidos superiores a $2.500 UYU, comunícate previamente por WhatsApp para coordinar tiempos óptimos de preparación de taller.
        </p>
      </section>

      {/* Medios de Pago y Logística Oficial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <CreditCard className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-extrabold">Medios de Pago Aceptados</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Transferencia Bancaria BROU:</strong> Acreditación directa sin recargo.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Cuentas Digitales:</strong> Prex, OCA Blue y Mi Dinero.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Redes de Cobranza:</strong> Giros Abitab y Redpagos a cédula.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Mercado Pago Online:</strong> Tarjetas de crédito en cuotas (10% recargo financiero).</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-extrabold">Logística y Envíos en Uruguay</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Despachos Diarios:</strong> Enviamos por DAC (Grupo Agencia) o Correo Uruguayo.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>A Domicilio o Agencia:</strong> Hacia Montevideo y los 19 departamentos.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Retiro en Taller:</strong> Sin costo en San José de Mayo.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Embalaje Protegido:</strong> Cajas reforzadas para evitar esquinas abolladas.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA WhatsApp Mayorista */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full inline-block border border-emerald-800">
            Canal Directo de Taller
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            ¿Quieres coordinar un pedido mayorista o consultar stock?
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Escríbenos directamente por WhatsApp. Te asesoramos sobre insumos, tiempos de despacho y la mejor combinación para tu taller.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={WHATSAPP_MAYORISTA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-7 py-4 rounded-2xl transition-all shadow-lg flex items-center gap-3 text-sm"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white" />
            <span>Consultar por WhatsApp (098 615 074)</span>
          </a>
          <Link
            href="/#catalogo"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-4 rounded-2xl transition-all border border-slate-700 text-sm"
          >
            Ver Catálogo Online
          </Link>
        </div>
      </div>
    </div>
  );
}
