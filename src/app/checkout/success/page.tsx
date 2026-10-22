"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Truck,
  Mail,
  Copy,
  Check,
  Building,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
} from "lucide-react";

const LOGO_URL =
  "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "KAM-000000";
  const email = searchParams.get("email") || "";
  const paymentStatus = searchParams.get("payment"); // "approved" | "pending" | "failure" | null

  const [copiedId, setCopiedId] = useState(false);
  const [copiedBrou, setCopiedBrou] = useState(false);
  const [copiedPrex, setCopiedPrex] = useState(false);
  const [copiedOca, setCopiedOca] = useState(false);
  const [copiedCi, setCopiedCi] = useState(false);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const isMpApproved = paymentStatus === "approved";
  const isMpPending = paymentStatus === "pending";

  const waText = encodeURIComponent(
    `¡Hola Kamaluso! Realicé el pedido #${orderId} a través de la web.${
      isMpApproved
        ? " El pago ya fue procesado con tarjeta por Mercado Pago."
        : " Aquí les adjunto el comprobante de transferencia bancaria."
    }`
  );
  const waUrl = `https://wa.me/59898615074?text=${waText}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Minimalista */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                src={LOGO_URL}
                alt="Kamaluso"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
                KAMALUSO
              </span>
              <span className="text-[10px] text-pink-600 font-bold tracking-wider uppercase leading-none mt-0.5 block">
                Papelería Sublimable
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Compra Registrada con Éxito</span>
          </div>
        </div>
      </header>

      {/* Banner 48h Despacho */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white py-2.5 px-4 text-xs font-extrabold shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
          <Clock className="w-4 h-4 text-pink-200 flex-shrink-0" />
          <span>Despacho en 48h hábiles desde San José de Mayo (pedidos hasta $2.000 UYU)</span>
          <span className="hidden md:inline text-pink-200">•</span>
          <span className="text-pink-100 font-medium text-[11px]">
            Para pedidos mayores, consultar tiempo según volumen de taller.
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="space-y-6">
          {/* Card Principal de Felicitaciones y Estado */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-pink-50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedido Confirmado</span>
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ¡Muchas gracias por tu compra!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                Hemos registrado tu pedido correctamente. Ya se encuentra guardado en nuestro taller para su empaque y coordinación.
              </p>

              {/* Píldora con N° de Pedido */}
              <div className="mt-5 inline-flex items-center gap-2 bg-slate-100 border border-slate-300/80 px-4 py-2 rounded-2xl shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  N° de Pedido:
                </span>
                <span className="font-mono font-black text-base sm:text-lg text-pink-600">
                  #{orderId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(orderId, setCopiedId)}
                  className="p-1 hover:bg-white text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                  title="Copiar número de pedido"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Notificación de Correo Electrónico */}
              {email ? (
                <div className="mt-5 max-w-md mx-auto p-3.5 bg-pink-50/80 border border-pink-200/90 rounded-2xl flex items-center justify-center gap-2.5 text-xs text-pink-950 font-medium">
                  <Mail className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span>
                    Enviamos el comprobante y el detalle de tus insumos a <strong>{email}</strong>.
                  </span>
                </div>
              ) : (
                <div className="mt-5 max-w-md mx-auto p-3.5 bg-pink-50/80 border border-pink-200/90 rounded-2xl flex items-center justify-center gap-2.5 text-xs text-pink-950 font-medium">
                  <Mail className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span>
                    El comprobante y detalle de compra fue enviado a tu correo electrónico.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Estado de Pago / Instrucciones de Transferencia */}
          {isMpApproved ? (
            /* Tarjeta Pago Aprobado Mercado Pago */
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-emerald-950 space-y-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-emerald-900">
                    Pago Acreditado con Tarjeta (Mercado Pago)
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    Tu pago fue verificado satisfactoriamente. No es necesario realizar ningún trámite adicional.
                  </p>
                </div>
              </div>
            </div>
          ) : isMpPending ? (
            /* Tarjeta Pago Pendiente Mercado Pago */
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-amber-950 space-y-2 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-amber-900">
                    Pago Pendiente de Acreditación
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    Mercado Pago está procesando tu transacción. Te notificaremos por correo electrónico una vez que se complete.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Tarjeta Instrucciones de Transferencia Bancaria y Cuentas Oficiales */
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  Paso Siguiente
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                  Datos de Cuenta para Transferencia o Depósito
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Puedes abonar tu pedido a través de cualquiera de los siguientes medios sin recargo. Utiliza el número de pedido <strong>#{orderId}</strong> como referencia:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BROU */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-pink-600" />
                      <span>BROU (Banco República)</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Pesos (UYU)</span>
                  </div>
                  <p className="text-xs text-slate-600">Caja de Ahorro en Pesos</p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-300">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block leading-none">N° de Cuenta:</span>
                      <span className="font-mono font-black text-sm text-slate-900">001199848-00001</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("001199848-00001", setCopiedBrou)}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 p-1 hover:bg-pink-50 rounded-lg transition"
                      title="Copiar cuenta BROU"
                    >
                      {copiedBrou ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Anterior: <span className="font-mono font-semibold">013.0123275</span> • Titular: <strong>Martín Cedrés</strong>
                  </p>
                </div>

                {/* PREX */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>Prex a Prex</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase font-black">Al Instante</span>
                  </div>
                  <p className="text-xs text-slate-600">Transferencia directa entre cuentas Prex</p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-300">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block leading-none">N° Cuenta Prex:</span>
                      <span className="font-mono font-black text-sm text-slate-900">1216437</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("1216437", setCopiedPrex)}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 p-1 hover:bg-pink-50 rounded-lg transition"
                      title="Copiar cuenta Prex"
                    >
                      {copiedPrex ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Titular: <strong>Katherine Silva</strong>
                  </p>
                </div>

                {/* OCA BLUE */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span>OCA Blue</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Depósito</span>
                  </div>
                  <p className="text-xs text-slate-600">Depósito o transferencia OCA Blue</p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-300">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block leading-none">N° Cuenta OCA Blue:</span>
                      <span className="font-mono font-black text-sm text-slate-900">0216811</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("0216811", setCopiedOca)}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 p-1 hover:bg-pink-50 rounded-lg transition"
                      title="Copiar cuenta OCA Blue"
                    >
                      {copiedOca ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Titular: <strong>Martín Cedrés</strong>
                  </p>
                </div>

                {/* ABITAB / RED PAGOS */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-600" />
                      <span>Abitab / Red Pagos</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Giro</span>
                  </div>
                  <p className="text-xs text-slate-600">Giro a cédula de identidad en cualquier sucursal</p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-300">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block leading-none">Cédula de Identidad:</span>
                      <span className="font-mono font-black text-sm text-slate-900">4.798.217-8</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("47982178", setCopiedCi)}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 p-1 hover:bg-pink-50 rounded-lg transition"
                      title="Copiar Cédula"
                    >
                      {copiedCi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Beneficiario: <strong>Katherine Silva</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información Logística de Despacho */}
          <div className="bg-slate-100/90 rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-pink-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-slate-900">
                  Despacho desde San José de Mayo
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Armamos y despachamos paquetes en <strong>48 horas hábiles</strong> para pedidos de hasta $2.000 UYU. Si tu pedido supera este monto, coordinamos el plazo según el volumen de producción del taller. Te enviaremos el número de rastreo de agencia en cuanto salga el paquete.
                </p>
              </div>
            </div>
          </div>

          {/* Enlace opcional a WhatsApp para enviar comprobante */}
          <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-200 text-center space-y-3">
            <p className="text-xs text-emerald-900 font-medium">
              ¿Deseas enviar el comprobante de transferencia bancaria por WhatsApp o hacer alguna consulta sobre tu pedido?
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md text-xs uppercase tracking-wider transition hover:scale-[1.01] active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Enviar comprobante por WhatsApp (Opcional)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
            <p className="text-[11px] text-emerald-700">
              (Tu compra ya está registrada en el sistema; este paso es únicamente para agilizar la verificación)
            </p>
          </div>

          {/* Botones de Navegación Final */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-pink-600 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Cargando confirmación de pedido...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
