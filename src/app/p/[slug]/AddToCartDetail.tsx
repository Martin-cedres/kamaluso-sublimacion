"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/components/cart/CartContext";
import { ShoppingBag, Check, Sparkles, Gift } from "lucide-react";

export function AddToCartDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product, quantity, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const showPromoKit = Boolean(product.hasPromoKit) && product.slug !== "kit-10-1-de-regalo";

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
          Cantidad de Unidades:
        </label>

        <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden self-start sm:self-auto">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3.5 py-2 font-black text-slate-600 hover:bg-slate-100 transition-colors"
            title="Restar unidad"
          >
            -
          </button>

          <input
            type="number"
            min="1"
            max="999"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.max(1, val));
            }}
            className="w-14 text-center font-extrabold text-slate-900 text-sm focus:outline-none bg-transparent"
          />

          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3.5 py-2 font-black text-slate-600 hover:bg-slate-100 transition-colors"
            title="Sumar unidad"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
          added
            ? "bg-emerald-600 text-white shadow-emerald-600/25"
            : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25 active:scale-98"
        }`}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" />
            <span>¡Agregado al Carrito ({quantity} u.)!</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            <span>
              Agregar al Carrito • ${(product.price * quantity).toLocaleString("es-UY")} UYU
            </span>
          </>
        )}
      </button>

      {/* Banner de Incentivo Mayorista B2B (Cross-selling) */}
      {showPromoKit && (
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 p-4 rounded-2xl border border-pink-200/80 flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-pink-600 text-white rounded-xl flex-shrink-0 mt-0.5">
            <Gift className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Promo Mayorista: KIT x 10 (Con Descuento)</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            </h4>
            <p className="text-slate-600 leading-relaxed">
              ¿Llevás 10 o más unidades? Comprando el <strong>Kit x 10 obtenés precio especial con descuento</strong> por cantidad en tus insumos.
            </p>
            <Link
              href={
                product.promoKitSlug
                  ? (product.promoKitSlug.startsWith("/") ? product.promoKitSlug : `/p/${product.promoKitSlug}`)
                  : "/categoria/kits-promos"
              }
              className="inline-flex items-center gap-1 pt-1 font-bold text-pink-700 hover:text-pink-900 underline underline-offset-2"
            >
              <span>Ver Publicación del KIT x 10 con Descuento →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
