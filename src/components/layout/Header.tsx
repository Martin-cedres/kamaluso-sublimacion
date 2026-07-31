"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Search, ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { Product } from "@/types";

const LOGO_URL =
  "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

function HeaderSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Cargar lista de productos para las sugerencias en vivo
  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  }, []);

  // Cerrar desplegable si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matchingProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (pathname === "/") {
      const params = new URLSearchParams(window.location.search);
      if (val.trim()) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      router.replace(`/?${params.toString()}`, { scroll: false });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);

    if (pathname === "/") {
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) params.set("q", query);
      else params.delete("q");
      router.replace(`/?${params.toString()}#catalogo`, { scroll: false });

      setTimeout(() => {
        const el = document.getElementById("catalogo");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      router.push(`/?q=${encodeURIComponent(query)}#catalogo`);
    }
  };

  const handleViewAllResults = () => {
    setIsOpen(false);
    if (pathname === "/") {
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) params.set("q", query);
      router.replace(`/?${params.toString()}#catalogo`, { scroll: false });

      setTimeout(() => {
        const el = document.getElementById("catalogo");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      router.push(`/?q=${encodeURIComponent(query)}#catalogo`);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleSearchChange}
          placeholder="Buscar agendas, cuadernos, insumos..."
          className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-brand-500 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              if (pathname === "/") {
                const params = new URLSearchParams(window.location.search);
                params.delete("q");
                router.replace(`/?${params.toString()}`, { scroll: false });
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Desplegable Flotante de Sugerencias en Tiempo Real */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {matchingProducts.length > 0 ? (
            <div>
              <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                {matchingProducts.slice(0, 5).map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/p/${prod.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-2 hover:bg-brand-50/70 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                        <Image
                          src={prod.images[0]}
                          alt={prod.name}
                          fill
                          className="object-contain p-0.5"
                          unoptimized
                        />
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                          {prod.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {prod.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 ml-2 flex-shrink-0">
                      ${prod.price} UYU
                    </span>
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={handleViewAllResults}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-brand-100 text-brand-700 text-xs font-extrabold text-center border-t border-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Ver los {matchingProducts.length} resultados en el catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 font-medium">
              No se encontraron productos para "<strong className="text-slate-800">{query}</strong>"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-0 sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="w-full sm:w-auto flex items-center justify-between gap-4">
          {/* Logo Brand con Icono Oficial */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src={LOGO_URL}
                alt="Kamaluso Sublimación Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-2xl text-slate-900 tracking-wider font-heading leading-tight">
                KAMALUSO
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-600 tracking-widest block">
                Papelería Sublimable
              </span>
            </div>
          </Link>

          {/* Cart & Menu Actions en Móvil */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-brand-500 hover:bg-brand-600 text-white p-2.5 rounded-xl transition-all shadow flex items-center gap-1.5"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="bg-white text-brand-700 font-extrabold text-[11px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
              aria-label="Menú móvil"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Buscador Integrado en el Navbar (Estilo LOI / Mercado Libre con Desplegable Flotante) */}
        <div className="w-full sm:flex-1 sm:max-w-md my-1 sm:my-0">
          <Suspense fallback={<div className="h-9 bg-slate-100 rounded-full animate-pulse" />}>
            <HeaderSearchInput />
          </Suspense>
        </div>

        {/* Navigation Desktop & Actions */}
        <div className="hidden sm:flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6 font-semibold text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              Inicio
            </Link>
            <Link href="/recursos/" className="hover:text-brand-600 transition-colors">
              Recursos Gratis
            </Link>
            <Link href="/contacto/" className="hover:text-brand-600 transition-colors">
              Contacto
            </Link>
          </nav>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-brand-500 hover:bg-brand-600 active:scale-95 text-white px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 flex-shrink-0"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-bold text-xs">Carrito</span>
            {totalItems > 0 && (
              <span className="bg-white text-brand-700 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-3 font-semibold text-slate-700">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-brand-600 text-sm"
          >
            Inicio
          </Link>
          <Link
            href="/recursos/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-brand-600 text-sm font-bold text-brand-600"
          >
            🎁 Recursos Gratis (PDF)
          </Link>
          <Link
            href="/contacto/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-brand-600 text-sm"
          >
            Contacto
          </Link>
        </div>
      )}
    </header>
  );
}
