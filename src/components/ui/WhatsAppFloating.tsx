"use client";

import React from "react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { KAMALUSO_WHATSAPP } from "@/lib/whatsapp";
import { useCart } from "@/components/cart/CartContext";

export function WhatsAppFloating() {
  const { isCartOpen } = useCart();

  const whatsappUrl = `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(
    "¡Hola Kamaluso! Quisiera realizar una consulta sobre los insumos y papelería sublimable."
  )}`;

  if (isCartOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center font-sans" data-nosnippet>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        aria-label="Contactar por WhatsApp"
        title="Atención por WhatsApp (098 615 074)"
      >
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold text-xs sm:text-sm">
          098 615 074
        </span>
      </a>
    </div>
  );
}
