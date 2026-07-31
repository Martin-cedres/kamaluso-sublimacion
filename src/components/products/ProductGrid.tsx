"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { CATEGORIES } from "@/lib/products";
import { Flame, ShieldCheck, Truck, CreditCard, ShoppingBag } from "lucide-react";

interface ProductGridProps {
  initialProducts: Product[];
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "todos" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Section B2B con Buscador integrado inmediatamente tras Título y Subtítulo */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 py-12 sm:py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4 text-brand-600" />
            Fabricantes Directos en San José
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Interiores para papelería <span className="text-brand-600">sublimable</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
            Interiores de agendas, libretas, blocks y cuadernos listos con tapas sublimables de 350gr y espirales para sublimar y personalizar en Uruguay.
          </p>

          {/* Buscador de Productos - Inmediatamente después del Título y Subtítulo */}
          <div className="pt-2 max-w-2xl mx-auto space-y-4">
            <div className="relative shadow-md rounded-2xl">
              <input
                type="text"
                placeholder="Buscar agendas, libretas, blocks, planners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-2xl border border-brand-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-base text-slate-800 placeholder-slate-400 font-medium transition-all"
              />
              <svg
                className="w-6 h-6 absolute left-4 top-4 text-brand-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all shadow-sm ${
                      isActive
                        ? "bg-brand-600 text-white shadow-brand-600/30 scale-105"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Productos */}
      <section id="productos" className="py-8 px-4 max-w-7xl mx-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <p className="text-slate-500 font-medium">
              No encontramos insumos que coincidan con tu búsqueda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("todos");
                setSearchTerm("");
              }}
              className="mt-4 px-4 py-2 bg-brand-50 text-brand-600 font-semibold rounded-xl text-sm hover:bg-brand-100 transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner de Políticas Comerciales & Tip de Sublimación - Debajo de los productos */}
      <div className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
        {/* Banner de Políticas Comerciales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Envíos a todo el país</h4>
              <p className="text-xs text-slate-500">Sin mínimo de compra. Despacho en ~48hs.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Elaboración ágil</h4>
              <p className="text-xs text-slate-500">Iniciamos al recibir comprobante de pago.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Pedidos mayores a $2.500</h4>
              <p className="text-xs text-slate-500">Consultar tiempos de preparación.</p>
            </div>
          </div>
        </div>

        {/* Tip de Sublimación / Prensa Plana */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                  🔥 Parámetro de Sublimación: Prensa Plana
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  Estampado a <strong>170ºC durante 120 seg</strong> para tapas sublimables de 350gr.
                </p>
              </div>
            </div>
            <span className="text-xs bg-white text-amber-900 font-extrabold px-3.5 py-2 rounded-xl border border-amber-200 shadow-sm flex-shrink-0">
              170ºC / 120 seg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
