import { Customer, Order } from "@/types";

export const STANDARD_SHIPPING_METHODS = [
  "Retiro en Local (San José de Mayo)",
  "DAC - Retiro en Agencia",
  "DAC - Envío a Domicilio",
  "Correo Uruguayo - Retiro en Sucursal",
  "Correo Uruguayo - Envío a Domicilio",
  "Agencia COTMI - Retiro en Agencia",
  "COTMI - Envío a Domicilio",
] as const;

function cleanDigits(val: string): string {
  return (val || "").replace(/\D/g, "");
}

function normalizeEmail(val?: string): string {
  return (val || "").trim().toLowerCase();
}

function normalizeName(val?: string): string {
  return (val || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function phonesMatch(a?: string, b?: string): boolean {
  const da = cleanDigits(a || "");
  const db = cleanDigits(b || "");
  if (da.length < 8 || db.length < 8) return false;
  return da.slice(-8) === db.slice(-8) || da.endsWith(db) || db.endsWith(da);
}

function buildDeterministicOrderCustomerId(seed: string): string {
  const clean = seed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `ORD-CUST-${clean || "anonimo"}`;
}

/**
 * Resuelve el nombre estándar de método de envío (una de las 7 opciones oficiales)
 * a partir de los datos guardados del cliente.
 */
export function resolveShippingMethodNameFromCustomer(
  customer: Partial<Customer>
): string {
  const rawMethod = (customer.shippingMethodName || "").trim();
  const exactMatch = STANDARD_SHIPPING_METHODS.find(
    (opt) => opt.toLowerCase() === rawMethod.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  const lowerMethod = rawMethod.toLowerCase();
  const lowerCompany = (customer.shippingCompany || "").trim().toLowerCase();

  if (
    customer.deliveryType === "local" ||
    lowerMethod.includes("local") ||
    lowerCompany.includes("local")
  ) {
    return "Retiro en Local (San José de Mayo)";
  }

  const isDomicilio =
    customer.deliveryType === "domicilio" || lowerMethod.includes("domicilio");

  if (lowerMethod.includes("correo") || lowerCompany.includes("correo")) {
    return isDomicilio
      ? "Correo Uruguayo - Envío a Domicilio"
      : "Correo Uruguayo - Retiro en Sucursal";
  }

  if (lowerMethod.includes("cotmi") || lowerCompany.includes("cotmi")) {
    return isDomicilio
      ? "COTMI - Envío a Domicilio"
      : "Agencia COTMI - Retiro en Agencia";
  }

  return isDomicilio ? "DAC - Envío a Domicilio" : "DAC - Retiro en Agencia";
}

/**
 * Deriva la empresa de envío y modalidad a partir del nombre estándar del método de envío.
 */
export function resolveShippingCompanyAndDelivery(
  shippingMethodName: string
): { shippingCompany: string; deliveryType: "agencia" | "domicilio" | "local" } {
  const lower = (shippingMethodName || "").toLowerCase();

  let deliveryType: "agencia" | "domicilio" | "local" = "agencia";
  if (lower.includes("local")) {
    deliveryType = "local";
  } else if (lower.includes("domicilio")) {
    deliveryType = "domicilio";
  }

  let shippingCompany = "dac";
  if (lower.includes("local")) {
    shippingCompany = "local";
  } else if (lower.includes("correo")) {
    shippingCompany = "correo";
  } else if (lower.includes("cotmi")) {
    shippingCompany = "cotmi";
  }

  return { shippingCompany, deliveryType };
}

/**
 * Fusiona los clientes registrados con compradores únicos extraídos de los pedidos,
 * evitando duplicados, completando campos vacíos desde su pedido más reciente
 * y ordenando por última actividad descendente.
 */
export function buildUnifiedCustomersList(
  customers: Customer[],
  orders: Order[]
): Customer[] {
  const result: Customer[] = customers.map((c) => ({ ...c }));

  const sortedOrders = [...orders].sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });

  const findCustomerIndex = (
    email: string,
    phone: string,
    name: string
  ): number => {
    if (email) {
      const idx = result.findIndex((c) => normalizeEmail(c.email) === email);
      if (idx >= 0) return idx;
    }

    if (cleanDigits(phone).length >= 8) {
      const idx = result.findIndex((c) => phonesMatch(c.phone, phone));
      if (idx >= 0) return idx;
    }

    if (!email && cleanDigits(phone).length < 8 && name) {
      const idx = result.findIndex(
        (c) =>
          !normalizeEmail(c.email) &&
          cleanDigits(c.phone).length < 8 &&
          normalizeName(c.name) === name
      );
      if (idx >= 0) return idx;
    }

    return -1;
  };

  for (const order of sortedOrders) {
    const oc = order.customer;
    if (!oc) continue;

    const email = normalizeEmail(oc.email);
    const phone = (oc.phone || "").trim();
    const name = (oc.name || "").trim();
    const normName = normalizeName(name);

    if (!name && !email && !phone) continue;

    const orderShipMethod = order.shippingMethodName || "";
    const resolvedShip = orderShipMethod
      ? resolveShippingCompanyAndDelivery(orderShipMethod)
      : null;
    const orderDeliveryType =
      order.deliveryType || oc.deliveryType || resolvedShip?.deliveryType;
    const orderObservations = (
      order.observations ||
      oc.observations ||
      ""
    ).trim();
    const orderTotal = Number(order.finalTotal || order.totalPrice || 0);
    const orderDate = order.createdAt || new Date().toISOString();

    const idx = findCustomerIndex(email, phone, normName);

    if (idx >= 0) {
      const existing = result[idx];
      const isSynthesized = existing.id.startsWith("ORD-CUST-");

      result[idx] = {
        ...existing,
        name: existing.name || name || "Cliente",
        phone: existing.phone || phone,
        email: existing.email || email,
        department: existing.department || oc.department || "Montevideo",
        city: existing.city || oc.city || "",
        address: existing.address || oc.address || "",
        observations: existing.observations || orderObservations || undefined,
        shippingMethodName:
          existing.shippingMethodName || orderShipMethod || undefined,
        paymentMethodId:
          existing.paymentMethodId || order.paymentMethodId || undefined,
        deliveryType: existing.deliveryType || orderDeliveryType,
        shippingCompany:
          existing.shippingCompany || resolvedShip?.shippingCompany,
        totalOrders: isSynthesized
          ? existing.totalOrders + 1
          : existing.totalOrders || 1,
        totalSpent: isSynthesized
          ? existing.totalSpent + orderTotal
          : existing.totalSpent || orderTotal,
        lastOrderAt: existing.lastOrderAt || orderDate,
      };
    } else {
      const seed = email || cleanDigits(phone) || normName || order.id;
      result.push({
        id: buildDeterministicOrderCustomerId(seed),
        name: name || "Cliente",
        phone,
        email,
        department: oc.department || "Montevideo",
        city: oc.city || "",
        address: oc.address || "",
        deliveryType: orderDeliveryType || "domicilio",
        shippingCompany: resolvedShip?.shippingCompany || "dac",
        observations: orderObservations || undefined,
        shippingMethodName: orderShipMethod || undefined,
        paymentMethodId: order.paymentMethodId || undefined,
        totalOrders: 1,
        totalSpent: orderTotal,
        lastOrderAt: orderDate,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }
  }

  return result.sort((a, b) => {
    const ta = new Date(a.lastOrderAt || a.updatedAt || a.createdAt || 0).getTime();
    const tb = new Date(b.lastOrderAt || b.updatedAt || b.createdAt || 0).getTime();
    return tb - ta;
  });
}

export interface CustomerTopProduct {
  productId: string;
  name: string;
  totalQuantity: number;
  totalSpent: number;
  orderCount: number;
}

/**
 * Obtiene todos los pedidos asociados a un cliente (por customerId, email, teléfono
 * o nombre cuando no hay email/teléfono), ordenados del más reciente al más antiguo.
 */
export function getOrdersForCustomer(customer: Customer, orders: Order[]): Order[] {
  const targetId = !customer.id.startsWith("ORD-CUST-") ? customer.id : "";
  const targetEmail = normalizeEmail(customer.email);
  const targetPhone = (customer.phone || "").trim();
  const targetPhoneDigits = cleanDigits(targetPhone);
  const targetName = normalizeName(customer.name);

  return orders
    .filter((order) => {
      if (targetId && order.customerId && order.customerId === targetId) {
        return true;
      }
      const oc = order.customer;
      if (!oc) return false;

      const oEmail = normalizeEmail(oc.email);
      if (targetEmail && oEmail && targetEmail === oEmail) {
        return true;
      }

      if (targetPhoneDigits.length >= 8 && phonesMatch(targetPhone, oc.phone)) {
        return true;
      }

      if (
        !targetEmail &&
        targetPhoneDigits.length < 8 &&
        !oEmail &&
        cleanDigits(oc.phone || "").length < 8 &&
        targetName &&
        normalizeName(oc.name) === targetName
      ) {
        return true;
      }

      return false;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
}

/**
 * Agrupa los productos más comprados por un cliente a partir de su historial de pedidos.
 */
export function getTopProductsForCustomer(
  customerOrders: Order[]
): CustomerTopProduct[] {
  const map = new Map<string, CustomerTopProduct>();

  for (const order of customerOrders) {
    if (!Array.isArray(order.items)) continue;
    const seenInOrder = new Set<string>();

    for (const item of order.items) {
      if (!item?.product) continue;
      const key = item.product.id || normalizeName(item.product.name) || "item";
      const qty = Number(item.quantity) || 0;
      const subtotal = (Number(item.product.price) || 0) * qty;
      const existing = map.get(key);

      if (existing) {
        existing.totalQuantity += qty;
        existing.totalSpent += subtotal;
        if (!seenInOrder.has(key)) {
          existing.orderCount += 1;
          seenInOrder.add(key);
        }
      } else {
        map.set(key, {
          productId: item.product.id || key,
          name: item.product.name || "Producto",
          totalQuantity: qty,
          totalSpent: subtotal,
          orderCount: 1,
        });
        seenInOrder.add(key);
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  );
}

/**
 * Consulta un cliente registrado en la base de datos por su email.
 */
export async function lookupCustomerByEmail(email: string): Promise<Customer | null> {
  if (!email || !email.trim()) return null;
  try {
    const res = await fetch(`/api/customers?email=${encodeURIComponent(email.trim())}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.found && data.customer) {
      return data.customer as Customer;
    }
  } catch (err) {
    console.warn("Aviso al consultar cliente por email:", err);
  }
  return null;
}

/**
 * Consulta un cliente registrado en la base de datos por su teléfono.
 */
export async function lookupCustomerByPhone(phone: string): Promise<Customer | null> {
  if (!phone || !phone.trim()) return null;
  try {
    const res = await fetch(`/api/customers?phone=${encodeURIComponent(phone.trim())}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.found && data.customer) {
      return data.customer as Customer;
    }
  } catch (err) {
    console.warn("Aviso al consultar cliente por teléfono:", err);
  }
  return null;
}

/**
 * Guarda o actualiza un cliente en la base de datos del servidor y Vercel Blob.
 */
export async function registerOrUpdateCustomer(
  customerData: Partial<Customer> & {
    incrementOrder?: boolean;
    orderAmount?: number;
    explicitEdit?: boolean;
  }
): Promise<Customer | null> {
  try {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.customer as Customer) || null;
  } catch (err) {
    console.warn("Aviso al registrar o actualizar cliente:", err);
    return null;
  }
}

/**
 * Actualiza un cliente existente por ID mediante PUT /api/customers.
 */
export async function updateCustomerById(
  customer: Partial<Customer> & { id: string }
): Promise<Customer | null> {
  try {
    const res = await fetch("/api/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.customer as Customer) || null;
  } catch (err) {
    console.warn("Aviso al actualizar cliente por ID:", err);
    return null;
  }
}

/**
 * Obtiene el listado completo de clientes registrados (para administración).
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch("/api/customers", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as Customer[];
  } catch (err) {
    console.warn("Aviso al obtener clientes registrados:", err);
  }
  return [];
}

/**
 * Elimina un cliente registrado por ID.
 */
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/customers?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("Aviso al eliminar cliente:", err);
    return false;
  }
}
