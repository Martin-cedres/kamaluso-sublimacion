"use client";

import React, { useState } from "react";
import Image from "next/image";

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
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  return (
    <div className="space-y-4">
      {/* Img principal con aspecto cuadrado u 4/3 y object-contain para encuadre perfecto */}
      <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md p-6 flex items-center justify-center group">
        {badge && (
          <span className="absolute top-4 left-4 z-10 bg-brand-600 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md tracking-wider">
            {badge}
          </span>
        )}
        <div className="relative w-full h-full">
          <Image
            src={selectedImage}
            alt={productName}
            fill
            className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Miniaturas secundarias */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
          {images.map((img, idx) => {
            const isActive = img === selectedImage;
            return (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border-2 transition-all p-1 flex-shrink-0 ${
                  isActive
                    ? "border-brand-600 ring-4 ring-brand-100 scale-105 shadow-md"
                    : "border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
                }`}
                title={`Ver vista ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${productName} vista ${idx + 1}`}
                  fill
                  className="object-contain drop-shadow-sm"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
