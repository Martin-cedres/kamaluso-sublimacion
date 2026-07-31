"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, Download } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useCart } from "@/components/cart/CartContext";

const LOGO_URL =
  "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo Brand con Icono Oficial */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src={LOGO_URL}
              alt="Kamaluso Sublimación Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-wider font-heading leading-tight">
              KAMALUSO
            </span>
            <span className="text-[10px] uppercase font-bold text-brand-600 tracking-widest hidden sm:block">
              Papelería Sublimable
            </span>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Inicio
          </Link>
          <Link href="/recursos/" className="hover:text-brand-600 transition-colors flex items-center gap-1">
            <span>Plantillas & Descargables</span>
          </Link>
          <Link href="/sobre-nosotros/" className="hover:text-brand-600 transition-colors">
            Sobre Nosotros
          </Link>
          <Link href="/contacto/" className="hover:text-brand-600 transition-colors">
            Contacto
          </Link>
          <Link href="/admin" className="hover:text-brand-600 transition-colors text-xs bg-slate-100 hover:bg-pink-50 hover:text-pink-600 px-2.5 py-1 rounded-lg border border-slate-200/80 font-bold flex items-center gap-1">
            <span>Admin</span>
          </Link>
        </nav>


        {/* Cart & Contact Actions */}
        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/59898615074"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-3.5 py-2 rounded-xl transition-all border border-slate-200/60"
          >
            <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
            <span>098 615 074</span>
          </a>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-2xl transition-all shadow-md flex items-center gap-2"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:inline">Carrito</span>
            {totalItems > 0 && (
              <span className="bg-white text-brand-700 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </button>


          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Menú móvil"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-3 font-semibold text-slate-700">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-brand-600"
          >
            Inicio
          </Link>
          <Link
            href="/recursos/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-brand-600"
          >
            Plantillas & Descargables PDF
          </Link>
          <Link
            href="/sobre-nosotros/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-brand-600"
          >
            Sobre Nosotros
          </Link>
          <Link
            href="/contacto/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-brand-600"
          >
            Contacto
          </Link>
        </div>
      )}
    </header>
  );
}
