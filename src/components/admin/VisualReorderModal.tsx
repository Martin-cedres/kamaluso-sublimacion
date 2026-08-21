"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { saveProductsOrder } from "@/lib/products";
import {
  X,
  Sparkles,
  GripVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Layers,
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems([...initialProducts]);
      setHasChanges(false);
      setSaveSuccess(false);
    }
  }, [isOpen, initialProducts]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // No-op or cleanup if leaving container
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...items];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setItems(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Acciones Rápidas
  const handleMoveToTop = (index: number) => {
    if (index === 0) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.unshift(moved);
    setItems(reordered);
    setHasChanges(true);
  };

  const handleMoveStep = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
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
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-200">
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
                  Drag & Drop
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Arrastra las tarjetas o usa las flechas para elegir el orden de aparición en la web.
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

        {/* Action Info Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>
              Total: <strong className="text-slate-900 font-bold">{items.length} productos</strong>. La posición <strong>#1</strong> es la portada principal.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSaving || (!hasChanges && !saveSuccess)}
              onClick={handleSave}
              className={`px-5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md ${
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
                  <span>{hasChanges ? "Guardar Nuevo Orden" : "Sin Cambios"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {items.map((prod, index) => {
              const coverImage = prod.images?.[0] || "/agenda_fondo_kamaluso.jpg";
              const isFirst = index === 0;
              const isLast = index === items.length - 1;
              const isBeingDragged = draggedIndex === index;
              const isOverThis = dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={prod.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden group flex flex-col justify-between select-none ${
                    isBeingDragged
                      ? "opacity-30 scale-95 border-dashed border-pink-400 shadow-none"
                      : isOverThis
                      ? "border-pink-500 ring-4 ring-pink-500/20 scale-[1.03] shadow-xl"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-lg shadow-sm"
                  }`}
                >
                  {/* Badge de Posición & Portada */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 ${
                        isFirst
                          ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300 font-extrabold"
                          : "bg-slate-900/80 text-white backdrop-blur-xs"
                      }`}
                    >
                      {isFirst && <Star className="w-3 h-3 fill-amber-950" />}
                      #{index + 1}
                    </span>
                  </div>

                  {/* Agarrador de Arrastre superior */}
                  <div
                    className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-slate-500 hover:text-pink-600 p-1.5 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition"
                    title="Arrastrar para mover posición"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Imagen */}
                  <div className="relative w-full aspect-square bg-slate-50 border-b border-slate-100 p-2 overflow-hidden">
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
                  <div className="bg-slate-50 p-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMoveStep(index, "left")}
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-20 disabled:hover:bg-transparent transition"
                      title="Mover una posición a la izquierda"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {!isFirst && (
                      <button
                        type="button"
                        onClick={() => handleMoveToTop(index)}
                        className="px-2 py-1 text-[10px] font-black text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 transition"
                        title="Poner de primero en la portada"
                      >
                        <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                        <span>Portada</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMoveStep(index, "right")}
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-20 disabled:hover:bg-transparent transition"
                      title="Mover una posición a la derecha"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-500">
            💡 <strong>Consejo:</strong> El producto <strong>#1</strong> será el primero que vean todos los clientes al entrar en la tienda.
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
