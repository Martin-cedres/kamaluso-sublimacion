"use client";

import React, { useState, useEffect } from "react";
import { ResourceItem, getAllResources } from "@/lib/resources";
import { Download, FileText } from "lucide-react";

interface Props {
  initialRecursos: ResourceItem[];
}

export default function RecursosListClient({ initialRecursos }: Props) {
  const [recursos, setRecursos] = useState<ResourceItem[]>(initialRecursos);

  useEffect(() => {
    getAllResources().then(setRecursos);
  }, []);

  if (!recursos || recursos.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
        No hay plantillas cargadas actualmente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recursos.map((item) => (
        <div
          key={item.id}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-brand-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0 mt-1">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>
              <span className="inline-block text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md mt-1">
                Formato: {item.format} • {item.fileSize}
              </span>
            </div>
          </div>

          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all flex-shrink-0 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Archivo</span>
          </a>
        </div>
      ))}
    </div>
  );
}
