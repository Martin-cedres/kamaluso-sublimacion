"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/components/cart/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setIsCartOpen } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col h-full cursor-pointer relative"
    >
      {/* Container de Imagen: aspect-square + object-contain para mostrar la agenda completa sin recortes */}
      <div className="relative aspect-square bg-gradient-to-b from-slate-50 to-slate-100/60 overflow-hidden flex items-center justify-center p-4 border-b border-slate-100">
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
            src={product.images[0]}
            alt={product.name}
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

        {/* Pricing & Add to Cart */}
        <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 mt-auto">
          <div className="flex flex-col">
            {product.comparativePrice ? (
              <span className="text-[11px] text-slate-400 line-through leading-none mb-0.5">
                ${product.comparativePrice} UYU
              </span>
            ) : null}
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                ${product.price}
              </span>
              <span className="text-[10px] font-bold text-slate-400">UYU</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-slate-900 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 flex-shrink-0"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
