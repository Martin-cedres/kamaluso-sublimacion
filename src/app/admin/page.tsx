"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types";
import { getAllProducts, deleteProduct, saveProduct, CATEGORIES } from "@/lib/products";
import { ResourceItem, getAllResources, deleteResource } from "@/lib/resources";
import { getLocalAdminUser, removeLocalAdminUser, isAllowedAdminEmail, AdminUser } from "@/lib/auth";
import ProductModal from "@/components/admin/ProductModal";
import ResourceModal from "@/components/admin/ResourceModal";
import ShippingLabelModal from "@/components/admin/ShippingLabelModal";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  LogOut,
  Package,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Layers,
  Printer,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  
  // Tab Activa: "products" | "resources"
  const [activeTab, setActiveTab] = useState<"products" | "resources">("products");

  // State Etiquetas de Envío
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  // State Productos
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // State Recursos
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourceSearchQuery, setResourceSearchQuery] = useState("");
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(null);

  const loadData = async () => {
    setIsLoadingProducts(true);
    const data = await getAllProducts();
    setProducts(data);
    setIsLoadingProducts(false);
  };

  const loadResourcesData = async () => {
    setIsLoadingResources(true);
    const data = await getAllResources();
    setResources(data);
    setIsLoadingResources(false);
  };

  useEffect(() => {
    const user = getLocalAdminUser();
    if (!user || !isAllowedAdminEmail(user.email)) {
      router.push("/admin/login");
      return;
    }
    setAdminUser(user);
    loadData();
    loadResourcesData();
  }, [router]);

  const handleLogout = () => {
    removeLocalAdminUser();
    router.push("/admin/login");
  };

  // Acciones Productos
  const handleToggleStock = async (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    await saveProduct(updated);
    loadData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      await deleteProduct(id);
      loadData();
    }
  };

  // Acciones Recursos
  const handleDeleteResource = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de eliminar el recurso "${title}"?`)) {
      await deleteResource(id);
      loadResourcesData();
    }
  };

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtrado de recursos
  const filteredResources = resources.filter((r) => {
    return (
      r.title.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(resourceSearchQuery.toLowerCase())
    );
  });

  if (!adminUser) return null;

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const totalResources = resources.length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Top Header Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center font-bold text-white shadow">
              K
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight flex items-center gap-2">
                Panel Administrador <span className="text-pink-400">Kamaluso</span>
              </h1>
              <p className="text-[11px] text-slate-400">San José, Uruguay • Insumos de Sublimación</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLabelModalOpen(true)}
              className="text-xs font-extrabold text-white bg-pink-600 hover:bg-pink-700 px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Etiqueta de Envío</span>
            </button>

            <a
              href="/"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver Tienda
            </a>

            <div className="h-5 w-px bg-slate-700 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {adminUser.name || adminUser.email}
                </p>
                <p className="text-[10px] text-slate-400">{adminUser.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800 pt-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === "products"
                ? "bg-slate-100 text-slate-900 border-t-2 border-pink-500"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Package className="w-4 h-4" /> Catálogo de Productos ({totalProducts})
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === "resources"
                ? "bg-slate-100 text-slate-900 border-t-2 border-pink-500"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Recursos y Plantillas ({totalResources})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* TAB 1: PRODUCTOS */}
        {activeTab === "products" && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Productos</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{totalProducts}</h3>
                </div>
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Stock</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{inStockCount}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categorías Activas</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{CATEGORIES.length - 1}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Toolbar & Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-2 px-3 border border-slate-300 rounded-xl text-sm font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
                className="w-full md:w-auto px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5" /> Nuevo Producto
              </button>
            </div>

            {/* Table of Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {isLoadingProducts ? (
                <div className="p-12 text-center text-slate-400 text-sm">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-base">No se encontraron productos</p>
                  <p className="text-xs text-slate-400">Intenta con otro término de búsqueda o categoría.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Producto</th>
                        <th className="px-6 py-4">Categoría</th>
                        <th className="px-6 py-4">Precio</th>
                        <th className="px-6 py-4">Estado Stock</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => {
                        const coverImage = product.images?.[0] || "/agenda_fondo_kamaluso.jpg";
                        return (
                          <tr key={product.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                                  <Image
                                    src={coverImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{product.name}</p>
                                  {product.badge && (
                                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-bold rounded">
                                      {product.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="capitalize text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                {product.category}
                              </span>
                            </td>

                            <td className="px-6 py-4 font-bold text-slate-900">
                              UYU ${product.price}
                              {product.comparativePrice && (
                                <span className="block text-xs font-normal text-slate-400 line-through">
                                  ${product.comparativePrice}
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleStock(product)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                                  product.inStock
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                }`}
                              >
                                {product.inStock ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> En Stock
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" /> Agotado
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setProductToEdit(product);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-2 text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                                  title="Editar producto"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: RECURSOS Y PLANTILLAS */}
        {activeTab === "resources" && (
          <>
            {/* Toolbar & Actions */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar plantillas o guías..."
                  value={resourceSearchQuery}
                  onChange={(e) => setResourceSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                onClick={() => {
                  setResourceToEdit(null);
                  setIsResourceModalOpen(true);
                }}
                className="w-full md:w-auto px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5" /> Nueva Plantilla / Recurso
              </button>
            </div>

            {/* Table of Resources */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {isLoadingResources ? (
                <div className="p-12 text-center text-slate-400 text-sm">Cargando recursos...</div>
              ) : filteredResources.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-base">No hay plantillas o recursos registrados</p>
                  <p className="text-xs text-slate-400">Agrega nuevas guías o plantillas descargables.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Recurso / Plantilla</th>
                        <th className="px-6 py-4">Formato</th>
                        <th className="px-6 py-4">Tamaño</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredResources.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 bg-pink-50 text-pink-600 rounded-lg flex-shrink-0 mt-0.5">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                              {item.format}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-600 text-xs">
                            {item.fileSize}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.downloadUrl && item.downloadUrl !== "#" && (
                                <a
                                  href={item.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                  title="Descargar o Ver"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setResourceToEdit(item);
                                  setIsResourceModalOpen(true);
                                }}
                                className="p-2 text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                                title="Editar recurso"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResource(item.id, item.title)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar recurso"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal Productos */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        onSaved={loadData}
      />

      {/* Modal Recursos */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        resourceToEdit={resourceToEdit}
        onSaved={loadResourcesData}
      />

      {/* Modal Etiqueta de Envío */}
      <ShippingLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
      />
    </div>
  );
}
