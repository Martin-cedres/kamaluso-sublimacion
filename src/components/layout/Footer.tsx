import React from "react";
import Link from "next/link";
import { MapPin, Mail, Heart, ExternalLink, Download, HelpCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-white text-xl font-black tracking-wider">
            KAMALUSO
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fabricantes de interiores para papelería sublimable en San José de Mayo: agendas 2026/27, libretas, blocks y cuadernos listos con tapas sublimables de 350gr para sublimadores y revendedores en Uruguay.
          </p>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>Ramón Massini 136, San José de Mayo, Uruguay</span>
            </div>
          </div>
        </div>

        {/* Categories SEO Links */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Categorías de Insumos</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/categoria/agendas/" className="hover:text-white transition-colors">
                Interiores de Agendas
              </Link>
            </li>
            <li>
              <Link href="/categoria/cuadernos/" className="hover:text-white transition-colors">
                Cuadernos Sublimables
              </Link>
            </li>
            <li>
              <Link href="/categoria/blocks/" className="hover:text-white transition-colors">
                Mini Blocks & Anotadores
              </Link>
            </li>
            <li>
              <Link href="/categoria/insumos/" className="hover:text-white transition-colors">
                Tapas 350gr & Espirales
              </Link>
            </li>
            <li>
              <Link href="/categoria/kits/" className="hover:text-white transition-colors">
                Kits & Combos Sublimación
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Navegación & Ayuda</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Inicio / Catálogo Completo
              </Link>
            </li>
            <li>
              <Link href="/faq/" className="hover:text-white transition-colors flex items-center gap-1 text-amber-400 font-semibold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Preguntas Frecuentes (FAQ)</span>
              </Link>
            </li>
            <li>
              <Link href="/recursos/" className="hover:text-white transition-colors flex items-center gap-1 text-brand-400 font-semibold">
                <Download className="w-3.5 h-3.5" />
                <span>Plantillas PDF Descargables</span>
              </Link>
            </li>
            <li>
              <Link href="/sobre-nosotros/" className="hover:text-white transition-colors">
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto/" className="hover:text-white transition-colors">
                Contacto & Ubicación
              </Link>
            </li>
            <li>
              <div className="pt-3 border-t border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                  ¿Buscas regalos ya personalizados?
                </span>
                <a
                  href="https://www.papeleriapersonalizada.uy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-bold transition-colors flex items-center gap-1 text-xs"
                >
                  <span>www.papeleriapersonalizada.uy</span>
                  <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
                </a>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Tienda minorista de productos terminados para consumidor final.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contacto Mayorista</h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <WhatsAppIcon className="w-4 h-4 fill-emerald-500" />
              <a
                href="https://wa.me/59898615074"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:text-emerald-400 transition-colors"
              >
                +598 98 615 074 (WhatsApp)
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-500" />
              <span>kamalusosanjose@gmail.com</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
              Sin mínimo de compra. Envíos a todo el Uruguay desde San José de Mayo vía DAC, Mirtrans o agencia a elección.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Kamaluso Sublimación (www.kamaluso.com). San José de Mayo, Uruguay.</p>
        <p className="flex items-center gap-1">
          Hecho con <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> para sublimadores de Uruguay.
        </p>
      </div>
    </footer>
  );
}
