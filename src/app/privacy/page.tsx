import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | Kamaluso Sublimación Uruguay",
  description:
    "Política de Privacidad y Tratamiento de Datos Personales de Kamaluso Papelería Sublimable en Uruguay, conforme a la Ley Nº 18.331 de la República Oriental del Uruguay.",
  alternates: {
    canonical: "https://www.kamaluso.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ley Nº 18.331 de Protección de Datos Personales (Uruguay)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Política de Privacidad y Protección de Datos
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            Última actualización: Noviembre de 2026 • Vigente para el dominio oficial <strong>www.kamaluso.com</strong>
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>1. Responsable del Tratamiento de Datos</span>
            </h2>
            <p>
              El presente documento establece los términos en que <strong>Kamaluso</strong> (con domicilio legal y taller de producción en Ramón Massini 136, San José de Mayo, Departamento de San José, República Oriental del Uruguay, correo de contacto: <strong>kamalusosanjose@gmail.com</strong>, teléfono/WhatsApp: <strong>+598 98 615 074</strong>) utiliza y protege la información que es proporcionada por sus usuarios y compradores al momento de utilizar su sitio web oficial <strong>https://www.kamaluso.com</strong>.
            </p>
            <p>
              Nos comprometemos con la seguridad y privacidad de los datos de nuestros clientes mayoristas, minoristas y visitantes, cumpliendo estrictamente con las disposiciones de la <strong>Ley Nº 18.331</strong> de Protección de Datos Personales y Acción de Habeas Data de la República Oriental del Uruguay, así como con los estándares internacionales de privacidad.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-600" />
              <span>2. Información que Recopilamos</span>
            </h2>
            <p>
              Para la correcta prestación de nuestros servicios de comercialización, facturación y despacho de insumos para sublimación, nuestro sitio web puede recopilar la siguiente información de contacto personal o empresarial:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li><strong>Nombre y Apellido</strong> o Razón Social del comprador.</li>
              <li><strong>Número de Teléfono o WhatsApp</strong> para la coordinación de pedidos y envío de comprobantes de despacho.</li>
              <li><strong>Dirección de Correo Electrónico</strong> para el envío del resumen detallado de la orden de compra y datos de pago bancario.</li>
              <li><strong>Dirección de Envío</strong> (localidad, departamento, calle o sucursal de DAC / Correo Uruguayo) requerida para la confección de etiquetas de flete.</li>
              <li><strong>Datos de Facturación</strong> (C.I. o RUT en caso de solicitar factura empresarial con RUT).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-600" />
              <span>3. Pasarelas de Pago y Seguridad de Transacciones</span>
            </h2>
            <p>
              En Kamaluso <strong>NUNCA almacenamos números de tarjetas de crédito, débito, códigos de seguridad (CVV) ni contraseñas bancarias</strong> en nuestros servidores.
            </p>
            <p>
              Los pagos en línea se procesan mediante la infraestructura segura y cifrada de <strong>Mercado Pago Uruguay</strong> (certificación PCI-DSS Nivel 1). Para pagos por transferencia bancaria (BROU, Prex, OCA Blue, Midinero) o giros en efectivo (Abitab y Redpagos), el usuario realiza la transacción directamente a través de las aplicaciones o sucursales oficiales de dichas entidades financieras, enviando el comprobante por nuestros canales verificados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <span>4. Finalidad del Uso de la Información</span>
            </h2>
            <p>
              La información recopilada se utiliza con los siguientes propósitos exclusivos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>Procesar y despachar pedidos de agendas, libretas, cuadernos y tapas sublimables.</li>
              <li>Notificar el número de rastreo de las agencias de carga (DAC, Correo Uruguayo, COTMI).</li>
              <li>Proveer soporte técnico sobre tiempos de prensado térmico y resolución de dudas sobre insumos.</li>
              <li>Mantener el registro interno contable y de facturación exigido por la normativa uruguaya.</li>
            </ul>
            <p>
              <strong>Kamaluso no vende, alquila, comercializa ni cede los datos de sus clientes a terceras partes bajo ninguna circunstancia.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              <span>5. Derechos de Acceso, Rectificación y Supresión (Derechos ARCO)</span>
            </h2>
            <p>
              De conformidad con la Ley Nº 18.331 de la República Oriental del Uruguay, todo titular de datos personales tiene derecho a acceder a sus datos almacenados, rectificarlos si son erróneos o incompletos, y solicitar su supresión de nuestras bases de datos en cualquier momento.
            </p>
            <p>
              Para ejercer cualquiera de estos derechos, basta con enviar un correo electrónico con el asunto "Protección de Datos Personales" a <strong>kamalusosanjose@gmail.com</strong> o comunicarse a nuestra línea de WhatsApp <strong>+598 98 615 074</strong>, y la solicitud será procesada en un plazo máximo de 5 días hábiles sin costo alguno.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
