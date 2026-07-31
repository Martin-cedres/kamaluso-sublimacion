"use client";

import React from "react";
import { CATEGORIES } from "@/lib/products";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-6 mb-10">
      {/* Buscador instantáneo */}
      <div className="max-w-md mx-auto relative">
        <input
          type="text"
          placeholder="Buscar agendas, libretas, blocks, planners..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-5 py-3.5 pl-12 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm text-slate-800"
        />
        <svg
          className="w-5 h-5 absolute left-4 top-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Chips de Categorías */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${
                isActive
                  ? "bg-brand-600 text-white shadow-brand-600/30 scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
