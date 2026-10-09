"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { saveProductsOrder, CATEGORIES } from "@/lib/products";
import {
  X,
  Sparkles,
  GripVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Check,
  RotateCcw,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";

interface VisualReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOrderSaved: (newProducts: Product[]) => void;
}

export default function VisualReorderModal({
  isOpen,
  onClose,
  products: initialProducts,
  onOrderSaved,
}: VisualReorderModalProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filtros internos del modal
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  useEffect(() => {
    if (isOpen) {
      setItems([...initialProducts]);
      setHasChanges(false);
      setSaveSuccess(false);
      setSearchQuery("");
      setSelectedCategory("todos");
    }
  }, [isOpen, initialProducts]);

  if (!isOpen) return null;

  // Filtrado de elementos visibles
  const visibleItems = items.filter((prod) => {
    const matchesCategory =
      selectedCategory === "todos" || prod.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Drag & Drop por ID (100% inmune a filtros de visualización)
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    // Sin acción obligatoria
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const fromIndex = items.findIndex((p) => p.id === draggedId);
    const toIndex = items.findIndex((p) => p.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...items];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    setItems(reordered);
    setDraggedId(null);
    setDragOverId(null);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Mover a posición específica (Input directo de número)
  const handleMoveToPosition = (id: string, targetPosition1Based: number) => {
    const fromIndex = items.findIndex((p) => p.id === id);
    if (fromIndex === -1) return;

    const toIndex = Math.max(0, Math.min(items.length - 1, targetPosition1Based - 1));
    if (fromIndex === toIndex) return;

    const reordered = [...items];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    setItems(reordered);
    setHasChanges(true);
  };

  // Acciones Rápidas
  const handleMoveToTop = (id: string) => {
    handleMoveToPosition(id, 1);
  };

  const handleMoveToBottom = (id: string) => {
    handleMoveToPosition(id, items.length);
  };

  const handleMoveStep = (id: string, direction: "left" | "right") => {
    const currentIndex = items.findIndex((p) => p.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setItems(reordered);
    setHasChanges(true);
  };

  const handleReset = () => {
    setItems([...initialProducts]);
    setHasChanges(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProductsOrder(items);
      onOrderSaved(items);
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error guardando nuevo orden", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-600/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Organizador Visual del Catálogo</span>
                <span className="bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Drag & Drop + Número Directo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Escribe directamente el número de posición, arrastra las tarjetas o usa los botones rápidos para elegir el orden en la tienda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros & Búsqueda Rápida */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Buscador */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar publicación..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Selector de Categorías */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 text-[11px] font-medium hidden md:inline">
              Mostrando <strong>{visibleItems.length}</strong> de <strong>{items.length}</strong> productos
            </span>
          </div>

          {/* Botones de Control */}
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition text-xs shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSaving || (!hasChanges && !saveSuccess)}
              onClick={handleSave}
              className={`px-5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md text-xs ${
                saveSuccess
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : hasChanges
                  ? "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Orden Guardado!</span>
                </>
              ) : isSaving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hasChanges ? "Guardar y Aplicar en la Web" : "Sin Cambios"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
          {visibleItems.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <p className="text-sm font-semibold">No se encontraron productos con ese filtro.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("todos");
                }}
                className="text-xs text-pink-600 font-bold hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {visibleItems.map((prod) => {
                const coverImage = prod.images?.[0] || "/agenda_fondo_kamaluso.jpg";
                const globalIndex = items.findIndex((p) => p.id === prod.id);
                const isFirst = globalIndex === 0;
                const isLast = globalIndex === items.length - 1;
                const isBeingDragged = draggedId === prod.id;
                const isOverThis = dragOverId === prod.id && draggedId !== prod.id;

                return (
                  <div
                    key={prod.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, prod.id)}
                    onDragOver={(e) => handleDragOver(e, prod.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, prod.id)}
                    onDragEnd={handleDragEnd}
                    className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden group flex flex-col justify-between select-none ${
                      isBeingDragged
                        ? "opacity-25 scale-95 border-dashed border-pink-400 shadow-none ring-2 ring-pink-300"
                        : isOverThis
                        ? "border-pink-500 ring-4 ring-pink-500/25 scale-[1.03] shadow-xl bg-pink-50/30"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-lg shadow-sm"
                    }`}
                  >
                    {/* Header Superior de la Tarjeta: Badge de Posición + Asignador Numérico Rápido */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm ${
                          isFirst
                            ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300 font-extrabold"
                            : "bg-slate-900/85 text-white backdrop-blur-xs"
                        }`}
                      >
                        {isFirst && <Star className="w-3 h-3 fill-amber-950" />}
                        #{globalIndex + 1}
                      </span>

                      {/* Input de Salto Directo a Posición */}
                      <div
                        className="bg-white/95 text-slate-800 rounded-lg px-1.5 py-0.5 border border-slate-200 shadow-sm flex items-center gap-1 text-[10px] font-bold backdrop-blur-xs"
                        title="Escribe un número y presiona Enter para mover directo a esa posición"
                      >
                        <span className="text-slate-400 font-medium">Ir a</span>
                        <input
                          type="number"
                          min={1}
                          max={items.length}
                          defaultValue={globalIndex + 1}
                          key={`pos-${prod.id}-${globalIndex}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = parseInt((e.target as HTMLInputElement).value, 10);
                              if (!isNaN(val) && val >= 1 && val <= items.length) {
                                handleMoveToPosition(prod.id, val);
                              }
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (
                              !isNaN(val) &&
                              val >= 1 &&
                              val <= items.length &&
                              val !== globalIndex + 1
                            ) {
                              handleMoveToPosition(prod.id, val);
                            }
                          }}
                          className="w-8 text-center font-black text-slate-900 bg-slate-100 hover:bg-slate-200 focus:bg-pink-100 focus:text-pink-700 focus:ring-1 focus:ring-pink-500 rounded py-0.5 outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Agarrador de Arrastre superior */}
                    <div
                      className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-slate-500 hover:text-pink-600 p-1.5 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition"
                      title="Arrastrar para reordenar"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Imagen */}
                    <div className="relative w-full aspect-square bg-slate-50 border-b border-slate-100 p-2 overflow-hidden mt-8 sm:mt-7">
                      <Image
                        src={coverImage}
                        alt={prod.name}
                        fill
                        className="object-contain p-2 transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    </div>

                    {/* Info básica */}
                    <div className="p-3 space-y-1 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">
                          {prod.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                        <span className="text-xs font-black text-slate-900">
                          ${prod.price} UYU
                        </span>
                        {prod.badge && (
                          <span className="text-[9px] font-black bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barra de Acciones Rápidas Inferior */}
                    <div className="bg-slate-50 p-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveStep(prod.id, "left")}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-20 disabled:hover:bg-transparent transition"
                          title="Mover una posición hacia la izquierda (subir orden)"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveStep(prod.id, "right")}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-20 disabled:hover:bg-transparent transition"
                          title="Mover una posición hacia la derecha (bajar orden)"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isFirst && (
                          <button
                            type="button"
                            onClick={() => handleMoveToTop(prod.id)}
                            className="px-2 py-1 font-bold text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-lg flex items-center gap-1 transition"
                            title="Enviar directo al puesto #1 (Portada principal)"
                          >
                            <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                            <span>#1 Portada</span>
                          </button>
                        )}

                        {!isLast && (
                          <button
                            type="button"
                            onClick={() => handleMoveToBottom(prod.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                            title="Mover al último lugar del catálogo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-500">
            💡 <strong>Consejo Pro:</strong> Puedes escribir cualquier número en la cajita <strong>"Ir a"</strong> de cualquier producto para ubicarlo de inmediato sin arrastrar.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={isSaving || (!hasChanges && !saveSuccess)}
              onClick={handleSave}
              className={`px-6 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md ${
                saveSuccess
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : hasChanges
                  ? "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Guardado!</span>
                </>
              ) : isSaving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Guardar y Aplicar en la Web</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
