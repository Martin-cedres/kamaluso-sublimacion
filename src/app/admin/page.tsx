"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product, Order, OrderStatus } from "@/types";
import { getAllProducts, deleteProduct, saveProduct, CATEGORIES } from "@/lib/products";
import { ResourceItem, getAllResources, deleteResource } from "@/lib/resources";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/lib/orders";
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
  ShoppingBag,
  Eye,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  DollarSign,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  
  // Tab Activa: "products" | "resources" | "orders"
  const [activeTab, setActiveTab] = useState<"products" | "resources" | "orders">("products");

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

  // State Pedidos / Ventas
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("todos");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

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

  const loadOrdersData = async () => {
    setIsLoadingOrders(true);
    const data = await getAllOrders();
    setOrders(data);
    setIsLoadingOrders(false);
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
    loadOrdersData();
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

  // Acciones Pedidos
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrdersData();
    if (selectedOrderModal && selectedOrderModal.id === orderId) {
      setSelectedOrderModal((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`¿Estás seguro de eliminar el pedido ${orderId}?`)) {
      await deleteOrder(orderId);
      loadOrdersData();
      if (selectedOrderModal?.id === orderId) {
        setSelectedOrderModal(null);
      }
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

  // Filtrado de pedidos
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === "todos" || o.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase();
    const matchesQuery =
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.toLowerCase().includes(q) ||
      (o.customer.email && o.customer.email.toLowerCase().includes(q)) ||
      o.customer.city.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.finalTotal, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "pendiente").length;

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

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-slate-100 text-slate-900 border-t-2 border-pink-500"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Pedidos / Ventas ({orders.length})
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

        {/* TAB 3: PEDIDOS / VENTAS */}
        {activeTab === "orders" && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pedidos</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{orders.length}</h3>
                </div>
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto Total Pedidos</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">
                    ${totalOrdersAmount.toLocaleString("es-UY")}{" "}
                    <span className="text-xs text-slate-500 font-normal">UYU</span>
                  </h3>
                </div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes de Pago</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingOrdersCount}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Toolbar & Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, teléfono, email, ID o ciudad..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="py-2 px-3 border border-slate-300 rounded-xl text-sm font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">⏳ Pendiente de Pago</option>
                  <option value="pago_confirmado">💳 Pago Confirmado</option>
                  <option value="en_preparacion">📦 En Preparación</option>
                  <option value="despachado">🚚 Despachado</option>
                  <option value="cancelado">❌ Cancelado</option>
                </select>
              </div>
            </div>

            {/* Tabla de Pedidos */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {isLoadingOrders ? (
                <div className="p-12 text-center text-slate-400 text-sm">Cargando historial de pedidos...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-base">No hay pedidos registrados</p>
                  <p className="text-xs text-slate-400">Los pedidos realizados en la tienda aparecerán automáticamente aquí.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500">
                        <th className="py-3.5 px-4">Pedido / Fecha</th>
                        <th className="py-3.5 px-4">Comprador</th>
                        <th className="py-3.5 px-4">Productos / Total</th>
                        <th className="py-3.5 px-4">Pago / Envío</th>
                        <th className="py-3.5 px-4 text-center">Estado</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString("es-UY", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{order.customer.name}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span>📱 {order.customer.phone}</span>
                            </p>
                            <p className="text-[10px] text-slate-400">📍 {order.customer.city}, {order.customer.department}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} ítems
                            </p>
                            <p className="font-black text-pink-600 text-sm">
                              ${order.finalTotal.toLocaleString("es-UY")} UYU
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-slate-800 font-semibold">{order.paymentMethodName}</p>
                            <p className="text-[10px] text-slate-400">🚚 {order.shippingMethodName}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-pink-500"
                            >
                              <option value="pendiente">⏳ Pendiente</option>
                              <option value="pago_confirmado">💳 Pago Confirmado</option>
                              <option value="en_preparacion">📦 En Preparación</option>
                              <option value="despachado">🚚 Despachado</option>
                              <option value="cancelado">❌ Cancelado</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedOrderModal(order)}
                                className="p-2 text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                                title="Ver detalle del pedido"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar pedido"
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

      {/* Modal Detalle de Pedido */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span>Pedido {selectedOrderModal.id}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedOrderModal.createdAt).toLocaleString("es-UY")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* Datos del Comprador */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <span>👤 Datos del Comprador</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p><strong>Nombre/Empresa:</strong> {selectedOrderModal.customer.name}</p>
                  <p>
                    <strong>WhatsApp:</strong>{" "}
                    <a
                      href={`https://wa.me/598${selectedOrderModal.customer.phone.replace(/[^0-9]/g, "").replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      {selectedOrderModal.customer.phone} 💬
                    </a>
                  </p>
                  <p><strong>Email:</strong> {selectedOrderModal.customer.email || "No especificado"}</p>
                  <p><strong>Ubicación:</strong> {selectedOrderModal.customer.city}, {selectedOrderModal.customer.department}</p>
                  <p className="col-span-2"><strong>Dirección:</strong> {selectedOrderModal.customer.address}</p>
                </div>
              </div>

              {/* Detalle Comercial */}
              <div className="grid grid-cols-2 gap-3 bg-pink-50/60 p-3.5 rounded-xl border border-pink-200/80">
                <div>
                  <p className="text-pink-900 font-bold">Medio de Pago:</p>
                  <p className="text-slate-800">{selectedOrderModal.paymentMethodName}</p>
                </div>
                <div>
                  <p className="text-pink-900 font-bold">Forma de Envío:</p>
                  <p className="text-slate-800">{selectedOrderModal.shippingMethodName}</p>
                </div>
              </div>

              {/* Tabla Productos */}
              <div className="space-y-2">
                <h4 className="font-extrabold uppercase text-slate-600 tracking-wider">Productos Solicitados</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <th className="p-2">Producto</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">Precio Unit.</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrderModal.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold">{item.product.name}</td>
                          <td className="p-2 text-center font-bold">{item.quantity}</td>
                          <td className="p-2 text-right">${item.product.price.toLocaleString("es-UY")} UYU</td>
                          <td className="p-2 text-right font-black">
                            ${(item.product.price * item.quantity).toLocaleString("es-UY")} UYU
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right pt-2">
                  <span className="text-slate-500 font-bold uppercase text-[11px] mr-2">Total del Pedido:</span>
                  <span className="text-xl font-black text-pink-600">
                    ${selectedOrderModal.finalTotal.toLocaleString("es-UY")} UYU
                  </span>
                </div>
              </div>

              {/* Selector Estado */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">Estado del Pedido:</span>
                <select
                  value={selectedOrderModal.status}
                  onChange={(e) => handleStatusChange(selectedOrderModal.id, e.target.value as OrderStatus)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-pink-500"
                >
                  <option value="pendiente">⏳ Pendiente de Pago</option>
                  <option value="pago_confirmado">💳 Pago Confirmado</option>
                  <option value="en_preparacion">📦 En Preparación</option>
                  <option value="despachado">🚚 Despachado</option>
                  <option value="cancelado">❌ Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
