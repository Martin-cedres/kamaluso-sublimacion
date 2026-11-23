"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Customer } from "@/types";
import { resolveShippingMethodNameFromCustomer } from "@/lib/customers";
import { Search, UserCheck, X, MapPin, Phone, Truck, ShoppingBag } from "lucide-react";

export interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId?: string | null;
  onSelect: (customer: Customer) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
}

export default function CustomerSelector({
  customers,
  selectedCustomerId,
  onSelect,
  onClear,
  label = "Buscar cliente guardado",
  placeholder = "Buscar por nombre, teléfono, email, ciudad o dirección...",
}: CustomerSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? customers
      : customers.filter((c) => {
          const haystacks = [
            c.name,
            c.phone,
            c.email,
            c.city,
            c.department,
            c.address,
          ];
          return haystacks.some((val) => (val || "").toLowerCase().includes(q));
        });
    return list.slice(0, 8);
  }, [customers, query]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
    setQuery("");
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    setQuery("");
    setIsOpen(false);
    onClear?.();
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {label && (
        <label className="block text-[11px] font-bold text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 rounded-md transition"
            aria-label="Borrar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {isOpen && (
          <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs text-slate-500">
                No se encontraron clientes con &ldquo;{query}&rdquo;
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const shipLabel = resolveShippingMethodNameFromCustomer(c);
                const ordersCount = c.totalOrders || 0;
                const isSelected = c.id === selectedCustomerId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c)}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-sky-50/80 transition flex items-start justify-between gap-3 ${
                      isSelected ? "bg-sky-50 border-l-2 border-sky-600" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {c.name || "Sin nombre"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200/80">
                          <ShoppingBag className="w-2.5 h-2.5" />
                          {ordersCount} {ordersCount === 1 ? "pedido" : "pedidos"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                        {c.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </span>
                        )}
                        {(c.city || c.department) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {[c.city, c.department].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-sky-700 font-medium">
                        <Truck className="w-3 h-3 shrink-0" />
                        <span className="truncate">{shipLabel}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="bg-sky-50/90 border border-sky-200 rounded-xl px-3 py-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900 truncate">
                {selectedCustomer.name}
              </span>
              <span className="text-[10px] font-semibold text-sky-700 bg-white px-1.5 py-0.5 rounded-md border border-sky-200">
                Cliente cargado
              </span>
            </div>
            <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-0.5">
              {selectedCustomer.phone && <span>Tel: {selectedCustomer.phone}</span>}
              {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
              {(selectedCustomer.city || selectedCustomer.department) && (
                <span>
                  {[selectedCustomer.city, selectedCustomer.department]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              Envío habitual: {resolveShippingMethodNameFromCustomer(selectedCustomer)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearSelection}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-pink-700 bg-white hover:bg-pink-50 border border-pink-200 transition"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
