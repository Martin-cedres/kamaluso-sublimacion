"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { CATEGORIES, saveProduct, getAllProducts } from "@/lib/products";
import ImageUploader from "@/components/admin/ImageUploader";
import { X, Save, Sparkles, Loader2, AlertCircle, CheckCircle2, Link2 } from "lucide-react";

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
  const [promoKitSlug, setPromoKitSlug] = useState("");
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAllProducts()
        .then((prods) => {
          if (Array.isArray(prods)) {
            setAvailableProducts(prods.filter((p) => p.id !== productToEdit?.id));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, productToEdit]);

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
      setPromoKitSlug(productToEdit.promoKitSlug || "");
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
      setPromoKitSlug("");
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
    else if (lowerName.includes("outlet") || lowerName.includes("oulet") || lowerName.includes("oferta") || lowerName.includes("liquidacion") || lowerName.includes("liquidación")) detectedCat = "outlet";
    else if (lowerName.includes("especial") || lowerName.includes("especiales")) detectedCat = "especiales";

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
        promoKitSlug: hasPromoKit && promoKitSlug.trim() ? promoKitSlug.trim() : undefined,
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
            {productToEdit ? "Editar Insumo" : "Nuevo Insumo / Agenda"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Subir Imágenes */}
          <ImageUploader images={images} onChange={setImages} />

          {/* Campos Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Nombre del Producto *
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSEO}
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded transition"
                  title="Configura automáticamente la Categoría, URL Slug y Badge según el título"
                >
                  <Sparkles className="w-3 h-3 text-pink-600" />
                  <span>Autogenerar SEO</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. Agenda 2027"
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
                Precio Anterior (Tachado)
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
                placeholder="Ej. NUEVO 2027"
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
                  Activar Banner Promo KIT x 10 (Con Descuento)
                </span>
              </label>
            </div>
          </div>

          {/* Desplegable para seleccionar la publicación del Kit vinculado */}
          {hasPromoKit && (
            <div className="p-3.5 bg-pink-50/80 border border-pink-200 rounded-2xl space-y-2 animate-fadeIn">
              <label className="block text-xs font-bold text-pink-900 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-pink-600" />
                <span>Vincular con la publicación del Kit x 10:</span>
              </label>
              <select
                value={promoKitSlug}
                onChange={(e) => setPromoKitSlug(e.target.value)}
                className="w-full px-3 py-2 border border-pink-300 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-pink-500 focus:outline-none font-medium"
              >
                <option value="">-- Seleccionar producto Kit x 10 --</option>
                {availableProducts.map((prod) => (
                  <option key={prod.id} value={prod.slug}>
                    {prod.name} ({prod.category === "kits-promos" ? "KIT MAYORISTA" : prod.category.toUpperCase()}) - ${prod.price} UYU
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 leading-tight">
                Al hacer clic en el banner desde la página del producto individual, el cliente será dirigido directamente a la publicación del Kit x 10 seleccionada.
              </p>
            </div>
          )}

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

