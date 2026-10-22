"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import {
  ShoppingBag,
  ShoppingCart,
  X,
  Trash2,
  ArrowRight,
  Clock,
  Truck,
  CheckCircle2,
} from "lucide-react";

export function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-600 rounded-xl text-white shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                  <span>Tu Carrito</span>
                  {cart.length > 0 && (
                    <span className="text-[10px] bg-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/40">
                      {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400">Kamaluso • San José de Mayo, Uruguay</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner 48h Despacho */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-2 px-3.5 text-[11px] font-extrabold flex items-center justify-center gap-2 text-center shadow-xs">
            <Clock className="w-3.5 h-3.5 text-pink-200 flex-shrink-0" />
            <span>Despacho en 48h hábiles desde San José (hasta $2.000 UYU)</span>
          </div>

          {/* Body Content */}
          <div id="cart-drawer-body" className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              /* CARRITO VACÍO */
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Tu carrito está vacío</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explora nuestro catálogo de tapas, interiores y anillados para sublimación y encuadernación.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 text-xs text-white font-extrabold bg-pink-600 rounded-xl hover:bg-pink-700 shadow-md shadow-pink-600/20 transition-transform active:scale-95"
                >
                  Ver Catálogo de Insumos
                </button>
              </div>
            ) : (
              /* LISTADO DE PRODUCTOS */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Insumos seleccionados ({cart.length})
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 hover:underline"
                    title="Vaciar todo el carrito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 border border-slate-200/80 rounded-2xl bg-white shadow-sm hover:border-slate-300 transition-all"
                    >
                      <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                        <Image
                          src={
                            item.product.images && item.product.images.length > 0 && item.product.images[0]
                              ? item.product.images[0]
                              : "/agenda_fondo_kamaluso.jpg"
                          }
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-l-lg font-black transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                updateQuantity(item.product.id, val);
                              }}
                              className="w-10 text-center text-xs font-bold bg-transparent focus:outline-none"
                            />
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-r-lg font-black transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-sm text-slate-900">
                              ${(item.product.price * item.quantity).toLocaleString("es-UY")}{" "}
                              <span className="text-[10px] font-normal text-slate-500">UYU</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-xl text-xs text-pink-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span>Sin mínimo de compra. Envíos por DAC, Correo, COTMI o retiro en San José.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
              {/* Resumen de Total */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block leading-none">
                    Subtotal Estimado
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Flete o retiro a coordinar en el checkout</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-pink-600 leading-none">
                    ${totalPrice.toLocaleString("es-UY")}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">UYU</span>
                </div>
              </div>

              {/* Botón Principal a Checkout */}
              <button
                onClick={handleGoToCheckout}
                className="w-full py-4 px-4 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>Finalizar Compra / Ir al Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors text-center"
              >
                Seguir viendo productos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
