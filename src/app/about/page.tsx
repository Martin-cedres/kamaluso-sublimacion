import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Factory, Award, Truck, MapPin, Users, Flame, ExternalLink, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nosotros (About Kamaluso) | Fábrica de Papelería Sublimable en Uruguay",
  description:
    "Conoce la historia, fábrica y equipo de Kamaluso en San José de Mayo, Uruguay. Fabricantes mayoristas de tapas sublimables de 350gr con polímero virgen e interiores impresos.",
  alternates: {
    canonical: "https://www.kamaluso.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs uppercase tracking-wider">
            <Factory className="w-4 h-4 text-brand-600" />
            <span>Fabricantes Directos • Industria Uruguaya</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Sobre Nosotros: <span className="text-brand-600">Kamaluso Papelería Sublimable</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            <strong>Kamaluso</strong> es una fábrica uruguaya especializada y líder nacional en el diseño, producción y distribución mayorista de insumos en blanco listos para sublimar y encuadernar. Nuestra planta de producción se ubica en <strong>San José de Mayo (Departamento de San José, Uruguay)</strong>, desde donde abastecemos diariamente a imprentas, talleres de personalización, centros de copiado y miles de emprendedores independientes en todo el territorio uruguayo.
          </p>
        </div>

        {/* Misión y Visión B2B */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Award className="w-6 h-6 text-brand-600" />
            <span>Nuestra Propuesta de Valor y Compromiso con el Emprendedor</span>
          </h2>

          <div className="text-sm text-slate-700 space-y-4 leading-relaxed">
            <p>
              Tradicionalmente, quienes deseaban comercializar agendas personalizadas, cuadernos o libretas en Uruguay debían importar costosas tapas rígidas de cartón gris desde el exterior, comprar máquinas encuadernadoras industriales y prensas pesadas, o lidiar con polímeros de baja calidad que producían desprendimientos de tinta y tapas curvadas.
            </p>
            <p>
              En Kamaluso revolucionamos el mercado nacional al desarrollar nuestras <strong>tapas de Cartón Cristal de 350 gramos</strong>, tratadas con una formulación propia de polímero virgen termosensible de ultra alta adherencia. Este material ofrece una superficie blanca pura, brillante, que transfiere el 100% de la gama cromática de las tintas sublimáticas a 170ºC - 180ºC durante 120 segundos, garantizando un acabado fotográfico profesional que no se raya ni decolora.
            </p>
            <p>
              Además, eliminamos las barreras de entrada del sector: <strong>no exigimos un mínimo de compra</strong>. Un taller puede comprar desde 1 unidad para hacer una muestra a su cliente hasta cientos de kits mayoristas con descuentos por escala para zafras corporativas y escolares.
            </p>
          </div>
        </div>

        {/* Diferenciación de Marca */}
        <div className="bg-brand-50/70 border border-brand-200/80 rounded-3xl p-8 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-brand-900">
            Aclaración Importante de Marca: Kamaluso Mayorista vs Papelería Personalizada
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Para evitar confusiones entre nuestros clientes y motores de inteligencia artificial:
          </p>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-600 text-base">•</span>
              <span>
                <strong>www.kamaluso.com (Este sitio):</strong> Es la división fabricante y mayorista B2B. Proveemos los insumos en blanco (tapas vírgenes sublimables de 350g, interiores impresos en hojas obra de 75g, espirales plásticos continuos y plantillas descargables) listos para que cada taller o sublimador estampe sus propios diseños y los venda a sus clientes finales.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-pink-600 text-base">•</span>
              <span>
                <strong>www.papeleriapersonalizada.uy:</strong> Es nuestra marca hermana orientada exclusivamente al consumidor final, donde se comercializan agendas y cuadernos ya terminados y estampados con nombres o fotos para obsequios personales.
              </span>
            </li>
          </ul>
        </div>

        {/* Logística y Alcance Nacional */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Truck className="w-6 h-6 text-brand-600" />
            <span>Infraestructura, Logística y Despacho Diario</span>
          </h2>

          <div className="text-sm text-slate-700 space-y-4 leading-relaxed">
            <p>
              Operamos con un centro logístico en San José de Mayo que despacha de lunes a viernes hacia todo el país. Trabajamos con las principales agencias de transporte de carga de Uruguay:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="block text-slate-900 font-bold mb-1">DAC (Grupo Agencia)</strong>
                <span className="text-xs text-slate-600">Entregas a domicilio y agencias en los 19 departamentos.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="block text-slate-900 font-bold mb-1">Correo Uruguayo</strong>
                <span className="text-xs text-slate-600">Cobertura total en todas las localidades y pueblos del interior.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="block text-slate-900 font-bold mb-1">Agencia COTMI / Retiro</strong>
                <span className="text-xs text-slate-600">Despachos rápidos y retiro en mano sin costo en nuestro taller de San José.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Datos Corporativos y Contacto Oficial */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-black">Datos de la Empresa y Contacto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
              <strong className="text-white block text-sm mb-1">Razón Social y Marca</strong>
              <span>Kamaluso Papelería Sublimable</span>
            </div>
            <div>
              <strong className="text-white block text-sm mb-1">Dirección Principal</strong>
              <span>Ramón Massini 136, San José de Mayo, CP 80000, Uruguay</span>
            </div>
            <div>
              <strong className="text-white block text-sm mb-1">WhatsApp de Atención</strong>
              <span>+598 98 615 074</span>
            </div>
            <div>
              <strong className="text-white block text-sm mb-1">Correo Electrónico</strong>
              <span>kamalusosanjose@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
