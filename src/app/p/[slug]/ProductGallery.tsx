"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  badge?: string;
}

export function ProductGallery({
  images,
  productName,
  badge,
}: ProductGalleryProps) {
  const safeImages = images && images.length > 0 ? images : ["/agenda_fondo_kamaluso.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Touch swipe states
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swipe left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> Prev
      handlePrev();
    }
  };

  // Keyboard navigation for Lightbox & Main Gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  const currentImage = safeImages[currentIndex] || safeImages[0];

  return (
    <div className="space-y-4 select-none">
      {/* Contenedor Principal: Formato Estricto 1:1 (aspect-square) */}
      <div
        className="relative aspect-square w-full bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md p-4 sm:p-6 flex items-center justify-center group cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Badge de Promoción / Destacado */}
        {badge && (
          <span className="absolute top-4 left-4 z-10 bg-brand-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md tracking-wider">
            {badge}
          </span>
        )}

        {/* Contador de fotos (1 / N) */}
        {safeImages.length > 1 && (
          <span className="absolute top-4 right-4 z-10 bg-slate-900/75 backdrop-blur-md text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm tracking-widest">
            {currentIndex + 1} / {safeImages.length}
          </span>
        )}

        {/* Botón de Zoom / Pantalla completa */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute bottom-4 right-4 z-10 p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-brand-600 shadow-md backdrop-blur-sm transition-all sm:opacity-0 group-hover:opacity-100 active:scale-95"
          title="Ver en pantalla completa"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Imagen Principal en 1:1 sin deformación ni desborde */}
        <div
          className="relative w-full h-full"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={currentImage}
            alt={`${productName} - Tapa 350g e Insumo Sublimable Kamaluso Uruguay (Foto ${currentIndex + 1})`}
            fill
            className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
            priority
            unoptimized
          />
        </div>

        {/* Flechas de Navegación Lateral (Solo Desktop en Hover, Ocultas en Móvil) */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 hover:text-brand-600 shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 active:scale-95 border border-slate-100 items-center justify-center"
              title="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 hover:text-brand-600 shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 active:scale-95 border border-slate-100 items-center justify-center"
              title="Siguiente foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Tira de Miniaturas Secundarias (Proporción 1:1) */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {safeImages.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-18 h-18 sm:w-20 sm:h-20 aspect-square bg-slate-50 rounded-2xl overflow-hidden border-2 transition-all p-1 flex-shrink-0 ${
                  isActive
                    ? "border-brand-600 ring-4 ring-brand-100 scale-105 shadow-md opacity-100"
                    : "border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100"
                }`}
                title={`Ver vista ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${productName} miniatura ${idx + 1}`}
                  fill
                  className="object-contain drop-shadow-sm"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox / Zoom Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 animate-fadeIn">
          {/* Header del Lightbox */}
          <div className="w-full max-w-5xl flex items-center justify-between z-10 text-white">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm sm:text-base text-slate-200 line-clamp-1">
                {productName}
              </span>
              {safeImages.length > 1 && (
                <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                  {currentIndex + 1} / {safeImages.length}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 shadow-md"
              title="Cerrar (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Imagen Zoom Principal en 1:1 */}
          <div
            className="relative w-full max-w-3xl aspect-square my-auto flex items-center justify-center p-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={currentImage}
              alt={`${productName} en alta definición`}
              fill
              className="object-contain drop-shadow-2xl"
              priority
              unoptimized
            />

            {/* Controles del Lightbox */}
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800/80 hover:bg-white hover:text-slate-900 text-white transition-all shadow-xl active:scale-95 border border-slate-700"
                  title="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800/80 hover:bg-white hover:text-slate-900 text-white transition-all shadow-xl active:scale-95 border border-slate-700"
                  title="Siguiente foto"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas en Lightbox */}
          {safeImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-xl pb-2 z-10">
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-14 h-14 aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 flex-shrink-0 ${
                    idx === currentIndex
                      ? "border-brand-500 ring-2 ring-brand-400 scale-110 opacity-100"
                      : "border-slate-700 opacity-40 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt="Miniatura lightbox"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
