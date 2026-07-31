"use client";

import React, { useState, useEffect } from "react";
import { ResourceItem, saveResource } from "@/lib/resources";
import { X, Save, FileUp, Sparkles, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resourceToEdit?: ResourceItem | null;
  onSaved: () => void;
}

export default function ResourceModal({
  isOpen,
  onClose,
  resourceToEdit,
  onSaved,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("PDF / PNG");
  const [fileSize, setFileSize] = useState("1.0 MB");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (resourceToEdit) {
      setTitle(resourceToEdit.title);
      setDescription(resourceToEdit.description);
      setFormat(resourceToEdit.format);
      setFileSize(resourceToEdit.fileSize);
      setDownloadUrl(resourceToEdit.downloadUrl);
    } else {
      setTitle("");
      setDescription("Plantilla de diseño con márgenes de sangrado y guías para sublimación.");
      setFormat("PDF / PNG");
      setFileSize("1.2 MB");
      setDownloadUrl("");
    }
  }, [resourceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Calcular tamaño de archivo legible
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MB`);

    // Intentar determinar formato
    const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
    setFormat(ext);

    // Leer como Data URL para almacenar enlace directo de descarga local
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDownloadUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSaving(true);
    try {
      await saveResource({
        id: resourceToEdit?.id,
        title,
        description,
        format,
        fileSize,
        downloadUrl: downloadUrl || "#",
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error al guardar recurso", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            {resourceToEdit ? "Editar Recurso Descargable" : "Nuevo Recurso / Plantilla"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Título del Recurso / Plantilla *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Plantilla para Tapas Agendas A5 (15x21 cm)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Descripción Breve
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Formato del Archivo
              </label>
              <input
                type="text"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="Ej. PDF / PNG"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Tamaño de Archivo
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="Ej. 1.2 MB"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Subir Archivo o Ingresar URL de Descarga
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2 transition">
                  <FileUp className="w-4 h-4 text-pink-600" />
                  <span>Seleccionar Archivo (PDF, ZIP, PNG)</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <input
                type="text"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="O pega aquí una URL externa (https://...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-xs bg-slate-50 font-mono text-slate-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Recurso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
