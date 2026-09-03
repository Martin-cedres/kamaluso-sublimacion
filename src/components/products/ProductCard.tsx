"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/components/cart/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleInitialAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, false);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, currentQuantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, currentQuantity - 1);
  };

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col h-full cursor-pointer relative select-none"
    >
      {/* Container de Imagen: Superficie blanca unificada sin bloques de color gris */}
      <div className="relative aspect-square bg-white p-4 border-b border-slate-100 overflow-hidden flex items-center justify-center">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-brand-600 text-white font-bold text-[10px] sm:text-[11px] px-3 py-1 rounded-full shadow-md tracking-wider">
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <span className="absolute top-3 right-3 z-10 bg-slate-900/90 text-slate-200 font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm">
            Agotado
          </span>
        )}

        <div className="relative w-full h-full">
          <Image
            src={product.images && product.images.length > 0 && product.images[0] ? product.images[0] : "/agenda_fondo_kamaluso.jpg"}
            alt={`${product.name} - Insumo de Papelería Sublimable Kamaluso Uruguay`}
            fill
            className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full inline-block">
            {product.category}
          </span>
          <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Full-Width Action Button */}
        <div className="pt-3 border-t border-slate-100 mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Precio:</span>
            <div className="flex items-baseline gap-1 text-right">
              {product.comparativePrice ? (
                <span className="text-xs text-slate-400 line-through mr-1">
                  ${product.comparativePrice}
                </span>
              ) : null}
              <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                ${product.price}
              </span>
              <span className="text-[10px] font-bold text-slate-400">UYU</span>
            </div>
          </div>

          {currentQuantity > 0 ? (
            /* Full-Width Selector de Cantidad Convertible Inline [-] N [+] */
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-full flex items-center justify-between border-2 border-brand-500 rounded-2xl bg-brand-50 shadow-sm overflow-hidden p-1 animate-fadeIn"
            >
              <button
                onClick={handleDecrement}
                className="w-10 h-9 bg-brand-100 hover:bg-brand-200 text-brand-700 rounded-xl transition-colors font-black flex items-center justify-center active:scale-95 flex-shrink-0"
                title="Restar unidad"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="font-black text-base text-slate-900 text-center flex-1">
                {currentQuantity}
              </span>

              <button
                onClick={handleIncrement}
                className="w-10 h-9 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors font-black flex items-center justify-center active:scale-95 flex-shrink-0 shadow"
                title="Sumar unidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Full-Width Botón Inicial de Agregar al Carrito */
            <button
              onClick={handleInitialAdd}
              disabled={!product.inStock}
              className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98 ${
                product.inStock
                  ? "bg-slate-900 hover:bg-brand-600 text-white shadow-slate-900/10 hover:shadow-brand-600/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
              title={product.inStock ? "Agregar al carrito" : "Producto agotado"}
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              <span>{product.inStock ? "Agregar al Carrito" : "Agotado"}</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
