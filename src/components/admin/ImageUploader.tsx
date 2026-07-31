"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { convertToWebP, fileToDataUrl } from "@/lib/image-optimizer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    setStatusMessage("Optimizando y convirtiendo a WebP...");

    const updatedImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      try {
        // 1. Optimizar y convertir a WebP en el navegador
        const webpFile = await convertToWebP(file, 1200, 1200, 0.85);

        let finalUrl = "";

        // 2. Si Supabase está configurado, subir al bucket de almacenamiento
        if (isSupabaseConfigured && supabase) {
          const filePath = `products/${Date.now()}-${webpFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, webpFile, {
              contentType: "image/webp",
              upsert: true,
            });

          if (!uploadError) {
            const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
            finalUrl = data.publicUrl;
          }
        }

        // Fallback a Data URL optimizado para vista local si Supabase no está conectado
        if (!finalUrl) {
          finalUrl = await fileToDataUrl(webpFile);
        }

        updatedImages.push(finalUrl);
      } catch (err) {
        console.error("Error al procesar la imagen", err);
      }
    }

    onChange(updatedImages);
    setIsProcessing(false);
    setStatusMessage("¡Imagen convertida a WebP con éxito!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700">
        Imágenes del Producto (Optimización WebP Automática)
      </label>

      {/* Zona de Drop & Upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-pink-500 bg-pink-50/50"
            : "border-slate-300 hover:border-pink-400 bg-slate-50/50"
        }`}
      >
        <input
          type="file"
          id="image-upload-input"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <label htmlFor="image-upload-input" className="cursor-pointer space-y-2 block">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center text-pink-600 py-2">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-medium">{statusMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Arrastra fotos aquí o <span className="text-pink-600 underline">haz clic para examinar</span>
              </p>
              <p className="text-xs text-slate-500">
                Las fotos en JPG/PNG serán convertidas instantáneamente a **.WebP** optimizado
              </p>
            </div>
          )}
        </label>
      </div>

      {statusMessage && !isProcessing && (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
          <Check className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Grid de imágenes subidas */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
            >
              <Image
                src={url}
                alt={`Imagen ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                  title="Eliminar foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  Portada
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
