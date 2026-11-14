"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { CATEGORIES, getAllProducts } from "@/lib/products";
import { ShieldCheck, Truck, CreditCard, ShoppingBag, Search, X, ArrowUpDown, ArrowRight } from "lucide-react";

interface ProductGridProps {
  initialProducts: Product[];
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [productsList, setProductsList] = useState<Product[]>(initialProducts || []);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [sortBy, setSortBy] = useState<"destacados" | "precio-asc" | "precio-desc" | "nombre-asc">("destacados");
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      getAllProducts().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsList(data);
        }
      }).catch(() => {});
    }
  }, [initialProducts]);

  const filteredProducts = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return productsList.filter((product) => {
      const matchesCategory =
        selectedCategory === "todos" || product.category === selectedCategory;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [productsList, selectedCategory, searchTerm]);

  const sortedProducts = React.useMemo(() => {
    if (sortBy === "destacados") return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "precio-asc") return a.price - b.price;
      if (sortBy === "precio-desc") return b.price - a.price;
      if (sortBy === "nombre-asc") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  // Carga automática progresiva (Infinite Scroll) al acercarse al final del catálogo sin fricción
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => (prev < sortedProducts.length ? sortedProducts.length : prev));
        }
      },
      { rootMargin: "400px" } // Precarga fluida 400px antes de llegar al límite
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [sortedProducts.length]);

  return (
    <div className="space-y-6">
      {/* Filtros de Categoría */}
      <div className="pt-4 pb-2 max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setVisibleCount(12);
                }}
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

      {/* Grid de Productos */}
      <section id="catalogo" className="py-8 px-4 max-w-7xl mx-auto space-y-6">
        {searchTerm && (
          <div className="flex items-center justify-between bg-brand-50/90 border border-brand-200/80 p-3.5 px-5 rounded-2xl max-w-3xl mx-auto shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-900">
              <Search className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>
                Mostrando resultados para <span className="underline font-black text-brand-700">"{searchTerm}"</span> ({filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"})
              </span>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                const params = new URLSearchParams(window.location.search);
                params.delete("q");
                window.history.replaceState(null, "", "/");
              }}
              className="text-xs font-bold text-brand-700 hover:text-brand-900 bg-white px-3 py-1 rounded-xl border border-brand-200 hover:bg-brand-100 transition-all flex items-center gap-1 shadow-xs"
            >
              <span>Limpiar</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {productsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-4 max-w-xl mx-auto my-6">
            <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold border border-pink-100">
              📦
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Catálogo listo para publicar productos</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              La tienda se encuentra limpia y lista para recibir tus productos oficiales. Puedes cargar tus primeros artículos con sus fotos y precios desde el Panel de Administración.
            </p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-600/20"
            >
              <span>Cargar Productos en Panel Admin →</span>
            </a>
          </div>
        ) : filteredProducts.length === 0 ? (
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
          <div className="space-y-6">
            {/* Barra de Ordenamiento y Conteo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-700 m-0">
                Catálogo de Insumos: Mostrando <strong className="text-slate-900 font-black">{sortedProducts.length}</strong> {sortedProducts.length === 1 ? "producto" : "productos"}
              </h2>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label htmlFor="sort-price-select" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                  <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" />
                  <span>Ordenar por:</span>
                </label>
                <select
                  id="sort-price-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer shadow-xs hover:border-slate-300 transition-colors"
                >
                  <option value="destacados">Destacados / Predeterminado</option>
                  <option value="precio-asc">Menor precio ($ → $$$)</option>
                  <option value="precio-desc">Mayor precio ($$$ → $)</option>
                  <option value="nombre-asc">Nombre (A → Z)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {(() => {
              const shouldPaginate = !searchTerm && selectedCategory === "todos";
              const displayed = shouldPaginate ? sortedProducts.slice(0, visibleCount) : sortedProducts;

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayed.map((product, idx) => (
                      <ProductCard key={product.id} product={product} priority={idx < 2} />
                    ))}
                  </div>

                  {shouldPaginate && visibleCount < sortedProducts.length && (
                    <div ref={loadMoreRef} className="pt-6 pb-2 text-center flex items-center justify-center gap-2 text-slate-500 text-xs font-medium animate-fadeIn">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                      <span>Cargando más productos del catálogo...</span>
                    </div>
                  )}
                </>
              );
            })()}
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
              <h4 className="font-bold text-sm text-slate-800">Envíos a todo Uruguay</h4>
              <p className="text-xs text-slate-600">DAC, Correo Uruguayo y COTMI desde San José. Sin mínimo.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Elaboración ágil</h4>
              <p className="text-xs text-slate-600">Iniciamos al recibir comprobante de pago.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Venta por mayor y menor</h4>
              <p className="text-xs text-slate-600">Precios directos de fábrica para revendedores y talleres.</p>
            </div>
          </div>
        </div>

        {/* Tip de Sublimación / Prensa Plana */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                    🔥 Parámetro de Sublimación: Prensa Plana
                  </h4>
                  <p className="text-xs text-amber-900 font-medium">
                    Especificaciones para tapas sublimables de cartón cristal 350gr.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/guia-sublimacion-papeleria"
                  className="text-xs bg-white hover:bg-amber-100 text-amber-950 font-extrabold px-3.5 py-2 rounded-xl border border-amber-200 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Ver Guía Técnica</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/p/pack-2-tapas"
                  className="text-xs bg-amber-900 hover:bg-amber-950 text-white font-extrabold px-3.5 py-2 rounded-xl border border-amber-900 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Pack 2 Tapas Repuesto $20 UYU</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/70">
                <span className="text-amber-800 block text-[10px] font-bold uppercase">Temperatura</span>
                <span className="font-black text-amber-950">170ºC – 180ºC</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/70">
                <span className="text-amber-800 block text-[10px] font-bold uppercase">Tiempo</span>
                <span className="font-black text-amber-950">120 seg</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/70">
                <span className="text-amber-800 block text-[10px] font-bold uppercase">Presión</span>
                <span className="font-black text-amber-950">Presión Media - Alta</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/70">
                <span className="text-amber-800 block text-[10px] font-bold uppercase">Enfriado (evita curvatura)</span>
                <span className="font-black text-amber-950">Enfriado bajo peso plano 60–120s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
