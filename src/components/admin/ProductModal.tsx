"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { CATEGORIES, saveProduct } from "@/lib/products";
import ImageUploader from "@/components/admin/ImageUploader";
import { X, Save, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaved: () => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSaved,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("agendas");
  const [price, setPrice] = useState<number | "">(180);
  const [comparativePrice, setComparativePrice] = useState<number | "">("");
  const [badge, setBadge] = useState("");
  const [inStock, setInStock] = useState(true);
  const [hasPromoKit, setHasPromoKit] = useState(false);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setComparativePrice(productToEdit.comparativePrice || "");
      setBadge(productToEdit.badge || "");
      setInStock(productToEdit.inStock);
      setHasPromoKit(Boolean(productToEdit.hasPromoKit));
      setDescription(productToEdit.description || "");
      setImages(productToEdit.images || []);
    } else {
      setName("");
      setSlug("");
      setCategory("agendas");
      setPrice(180);
      setComparativePrice("");
      setBadge("");
      setInStock(true);
      setHasPromoKit(false);
      setDescription("");
      setImages([]);
    }
  }, [productToEdit, isOpen]);

  const createCleanSlug = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!productToEdit || !slug) {
      setSlug(createCleanSlug(val));
    }
  };

  // Autogenerar SEO "invisible": Solo detecta Categoría, ajusta Slug y sugiere Badge. NO TOCA el Título ni la Descripción.
  const handleAutoGenerateSEO = () => {
    if (!name) {
      setErrorMessage("Escribe primero el nombre del producto para generar el SEO.");
      return;
    }

    setErrorMessage(null);
    const lowerName = name.toLowerCase();

    // 1. Detectar categoría sin cambiar el título ni la descripción
    let detectedCat = category;
    if (lowerName.includes("agenda")) detectedCat = "agendas";
    else if (lowerName.includes("cuaderno") || lowerName.includes("cuadernola") || lowerName.includes("libreta")) detectedCat = "libretas";
    else if (lowerName.includes("block") || lowerName.includes("anotador") || lowerName.includes("planner")) detectedCat = "blocks-planners";
    else if (lowerName.includes("kit") || lowerName.includes("pack") || lowerName.includes("combo") || lowerName.includes("promo")) detectedCat = "kits-promos";

    setCategory(detectedCat);

    // 2. Generar Slug amigable para motores de búsqueda (SEO invisible)
    const generatedSlug = createCleanSlug(name);
    setSlug(generatedSlug);

    // 3. Generar Badge / Etiqueta sugerida
    if (!badge) {
      if (lowerName.includes("2027")) setBadge("TEMPORADA 2027");
      else if (lowerName.includes("kit") || lowerName.includes("combo")) setBadge("PROMO MAYORISTA");
      else setBadge("INSUMO TOP B2B");
    }

    setSuccessMessage("✨ Categoría, Slug URL y Badge configurados para SEO. Tu título y descripción quedaron intactos.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Por favor ingresa un nombre para el producto.");
      return;
    }

    if (price === "" || isNaN(Number(price))) {
      setErrorMessage("Por favor ingresa un precio válido (número mayor o igual a 0).");
      return;
    }

    setIsSaving(true);
    const finalSlug = createCleanSlug(slug || name);

    try {
      await saveProduct({
        id: productToEdit?.id,
        name: name.trim(),
        slug: finalSlug,
        category,
        price: Number(price),
        comparativePrice: comparativePrice ? Number(comparativePrice) : undefined,
        badge: badge.trim() || undefined,
        inStock,
        hasPromoKit,
        description: description.trim(),
        images: images,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Error guardando producto", err);
      setErrorMessage("Ocurrió un error al guardar el producto. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            {productToEdit ? "Editar Producto" : "Nuevo Insumo / Agenda"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes de Alerta/Error */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
          <ImageUploader images={images} onChange={setImages} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Nombre del producto *
                </label>
                {name && (
                  <button
                    type="button"
                    onClick={handleAutoGenerateSEO}
                    className="text-[10px] text-pink-600 font-bold hover:underline flex items-center gap-0.5"
                    title="Configurar Categoría, Slug y Badge SEO sin modificar tu título ni descripción"
                  >
                    <Sparkles className="w-3 h-3 text-pink-500" /> Autogenerar SEO (Invisible)
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. Agenda 2027 1 día por página"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm bg-white"
              >
                {CATEGORIES.filter((c) => c.id !== "todos").map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Precio (UYU) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Precio Anterior (Opcional)
              </label>
              <input
                type="number"
                min="0"
                value={comparativePrice}
                onChange={(e) => setComparativePrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej. 200"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Etiqueta / Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ej. NUEVO 2027 o PROMO MAYORISTA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                URL Slug (SEO)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm bg-slate-50"
              />
            </div>

            <div className="flex flex-col justify-center space-y-2 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-sm font-semibold text-slate-700">
                  {inStock ? "Disponible en Stock" : "Sin Stock (Agotado)"}
                </span>
              </label>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPromoKit}
                  onChange={(e) => setHasPromoKit(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                <span className="ml-3 text-xs font-bold text-pink-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Activar Banner Promo 10 + 1 de Regalo
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Descripción y Parámetros de Sublimado
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
            />
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

