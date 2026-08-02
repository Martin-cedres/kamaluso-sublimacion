"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, X, Check, Loader2, Star, GripVertical } from "lucide-react";
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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

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
        const webpFile = await convertToWebP(file, 1200, 1200, 0.85);
        let finalUrl = "";

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

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragStartItem = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropItem = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const updated = [...images];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, removed);
    onChange(updated);
    setDraggedIdx(null);
    setStatusMessage("¡Orden de fotos actualizado!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700">
        Imágenes del Producto (Arrastra para reordenar)
      </label>

      {/* Zona de Drop & Upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDropFiles}
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

      {/* Grid de imágenes subidas reordenables por Drag and Drop */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <GripVertical className="w-4 h-4 text-slate-400" />
            Arrastra las fotos para cambiar su posición. La posición <strong className="text-amber-600">#1</strong> es la portada:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url, idx) => {
              const isMain = idx === 0;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStartItem(e, idx)}
                  onDragOver={handleDragOverItem}
                  onDrop={(e) => handleDropItem(e, idx)}
                  className={`relative group rounded-xl overflow-hidden bg-slate-100 aspect-square transition-all cursor-grab active:cursor-grabbing ${
                    draggedIdx === idx ? "opacity-40 scale-95 border-2 border-dashed border-pink-500" : ""
                  } ${
                    isMain
                      ? "ring-4 ring-amber-400 border-2 border-amber-500 shadow-md"
                      : "border border-slate-200"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Imagen ${idx + 1}`}
                    fill
                    className="object-cover pointer-events-none"
                    unoptimized
                  />

                  {/* Icono de arrastre */}
                  <div className="absolute top-1 right-1 bg-slate-900/60 text-white p-1 rounded backdrop-blur-xs opacity-60 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

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

                  {/* Insignia de Foto Principal / Posición */}
                  {isMain ? (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> Principal
                    </span>
                  ) : (
                    <span className="absolute bottom-1 left-1 bg-slate-800/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
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

