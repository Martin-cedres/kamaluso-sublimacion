"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, X, Check, Image as ImageIcon, Loader2, Star } from "lucide-react";
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

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
    setStatusMessage("¡Foto seleccionada como Principal de Portada!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

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

        // 2. Intentar subir a Vercel Blob Storage (100% gratuito e integrado en Vercel)
        try {
          const res = await fetch(`/api/upload?filename=${encodeURIComponent(webpFile.name)}`, {
            method: "POST",
            body: webpFile,
          });
          if (res.ok) {
            const blobData = await res.json();
            if (blobData.url) {
              finalUrl = blobData.url;
            }
          }
        } catch (e) {
          console.warn("Vercel Blob upload fallback to Supabase / DataURL", e);
        }

        // 3. Si Supabase está configurado y Vercel Blob no respondió, subir al bucket de Supabase
        if (!finalUrl && isSupabaseConfigured && supabase) {
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

        // 4. Fallback a Data URL optimizado si no hay almacenamiento configurado
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
        Imágenes del Producto (WebP Optimizado + CDN)
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
                Las fotos en JPG/PNG serán convertidas a WebP y alojadas en Vercel CDN
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

      {/* Grid de imágenes subidas con selector de Foto Principal */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-slate-500">
            Haz clic en el icono <Star className="w-3.5 h-3.5 inline text-amber-500 fill-amber-500" /> de cualquier foto para definirla como la <strong className="text-slate-800">Foto Principal de Portada</strong>:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url, idx) => {
              const isMain = idx === 0;
              return (
                <div
                  key={idx}
                  className={`relative group rounded-xl overflow-hidden bg-slate-100 aspect-square transition-all ${
                    isMain
                      ? "ring-4 ring-amber-400 border-2 border-amber-500 shadow-md"
                      : "border border-slate-200"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Imagen ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  {/* Acciones al pasar el cursor */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!isMain && (
                      <button
                        type="button"
                        onClick={() => setAsMainImage(idx)}
                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow transition-all hover:scale-110"
                        title="Establecer como Foto Principal"
                      >
                        <Star className="w-4 h-4 fill-white" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition-all hover:scale-110"
                      title="Eliminar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Insignia de Foto Principal */}
                  {isMain ? (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> Principal
                    </span>
                  ) : (
                    <span className="absolute bottom-1 right-1 bg-slate-800/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
