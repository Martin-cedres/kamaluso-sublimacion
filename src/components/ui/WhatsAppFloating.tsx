"use client";

import React, { useState, useEffect } from "react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { KAMALUSO_WHATSAPP } from "@/lib/whatsapp";
import { X } from "lucide-react";

export function WhatsAppFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Se abre a los 3.5s solo 1 vez por sesión (sessionStorage) y se cierra solo 6s después
  useEffect(() => {
    try {
      const hasBeenShown = sessionStorage.getItem("kamaluso_wa_shown");
      if (hasBeenShown) return;
    } catch (e) {
      // Ignorar si sessionStorage está restringido
    }

    let closeTimer: NodeJS.Timeout;
    const openTimer = setTimeout(() => {
      setShowNotification(true);
      try {
        sessionStorage.setItem("kamaluso_wa_shown", "true");
      } catch (e) {}

      closeTimer = setTimeout(() => {
        setShowNotification(false);
      }, 6000);
    }, 3500);

    return () => {
      clearTimeout(openTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, []);

  const whatsappUrl = `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(
    "¡Hola Kamaluso! Quisiera realizar una consulta sobre los insumos y papelería sublimable."
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Pop-up de Asesoramiento (UX de Alta Conversión que se auto-cierra y respeta sessionStorage) */}
      {(isOpen || showNotification) && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 max-w-xs w-72 animate-in fade-in slide-in-from-bottom-4 duration-300 relative text-slate-800">
          <button
            onClick={() => {
              setIsOpen(false);
              setShowNotification(false);
            }}
            className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0">
              <WhatsAppIcon className="w-6 h-6 fill-white" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 leading-tight">
                Atención Kamaluso
              </h4>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                ● En línea • San José
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
            ¡Hola! 👋 ¿Tienes dudas sobre los interiores o parámetros de sublimado? Escríbenos directamente.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setIsOpen(false);
              setShowNotification(false);
            }}
            className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition hover:scale-[1.02]"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            <span>Chatear por WhatsApp</span>
          </a>
        </div>
      )}

      {/* Botón Flotante Principal con Logo Oficial de WhatsApp */}
      <div className="relative">
        {(showNotification || isOpen) && (
          <span className="absolute -top-1 -right-1 z-10 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow animate-pulse">
            1
          </span>
        )}

        <button
          onClick={() => {
            if (isOpen || showNotification) {
              setIsOpen(false);
              setShowNotification(false);
            } else {
              setIsOpen(true);
            }
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
          aria-label="Contactar por WhatsApp"
          title="Atención por WhatsApp (098 615 074)"
        >
          <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold text-xs sm:text-sm">
            098 615 074
          </span>
        </button>
      </div>
    </div>
  );
}
