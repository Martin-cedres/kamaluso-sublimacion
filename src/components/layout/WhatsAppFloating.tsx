"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { KAMALUSO_WHATSAPP } from "@/lib/whatsapp";

export function WhatsAppFloating() {
  const url = `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(
    "Hola Kamaluso! Quisiera consultar por el catálogo de papelería sublimable e insumos."
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group"
      aria-label="Contactar por WhatsApp"
      title="Consultar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white text-emerald-500" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
        Consulta Mayorista
      </span>
    </a>
  );
}
