import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { Customer, Order } from "@/types";
import { resolveShippingCompanyAndDelivery } from "@/lib/customers";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";

const BLOB_CUSTOMERS_FILENAME = "data/customers.json";
const DIRECT_BLOB_CUSTOMERS_URL =
  "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/customers.json";
const LOCAL_CUSTOMERS_PATH = path.join(process.cwd(), "data", "customers.json");

interface SupabaseCustomerRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  department: string | null;
  city: string | null;
  address: string | null;
  delivery_type: Customer["deliveryType"] | null;
  shipping_company: string | null;
  observations: string | null;
  rut_info: string | null;
  shipping_method_name: string | null;
  payment_method_id: string | null;
  internal_notes: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
  updated_at: string;
}

export function customerToSupabaseRow(c: Customer): SupabaseCustomerRow {
  return {
    id: c.id,
    name: c.name || "Cliente",
    phone: c.phone || "",
    email: c.email || "",
    department: c.department || "Montevideo",
    city: c.city || "",
    address: c.address || "",
    delivery_type: c.deliveryType || "domicilio",
    shipping_company: c.shippingCompany || "dac",
    observations: c.observations !== undefined ? c.observations : null,
    rut_info: c.rutInfo !== undefined ? c.rutInfo : null,
    shipping_method_name:
      c.shippingMethodName !== undefined ? c.shippingMethodName : null,
    payment_method_id: c.paymentMethodId !== undefined ? c.paymentMethodId : null,
    internal_notes: c.internalNotes !== undefined ? c.internalNotes : null,
    total_orders: Number(c.totalOrders || 0),
    total_spent: Number(c.totalSpent || 0),
    last_order_at: c.lastOrderAt || null,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString(),
  };
}

export function supabaseRowToCustomer(row: SupabaseCustomerRow): Customer {
  return {
    id: row.id,
    name: row.name || "Cliente",
    phone: row.phone || "",
    email: row.email || "",
    department: row.department || "Montevideo",
    city: row.city || "",
    address: row.address || "",
    deliveryType: row.delivery_type || "domicilio",
    shippingCompany: row.shipping_company || "dac",
    observations: row.observations ?? undefined,
    rutInfo: row.rut_info ?? undefined,
    shippingMethodName: row.shipping_method_name ?? undefined,
    paymentMethodId: row.payment_method_id ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    totalOrders: Number(row.total_orders || 0),
    totalSpent: Number(row.total_spent || 0),
    lastOrderAt: row.last_order_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

declare global {
  var __kamaluso_customers_cache__:
    | {
        customers: Customer[];
        blobUrl: string | null;
        lastFetched: number;
      }
    | undefined;
}

function getCache() {
  if (!globalThis.__kamaluso_customers_cache__) {
    globalThis.__kamaluso_customers_cache__ = {
      customers: [],
      blobUrl: DIRECT_BLOB_CUSTOMERS_URL,
      lastFetched: 0,
    };
  }
  return globalThis.__kamaluso_customers_cache__;
}

export function cleanCustomerPhoneDigits(val: string): string {
  return (val || "").replace(/\D/g, "");
}

function readLocalCustomersFile(): Customer[] {
  try {
    if (fs.existsSync(LOCAL_CUSTOMERS_PATH)) {
      const content = fs.readFileSync(LOCAL_CUSTOMERS_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed as Customer[];
    }
  } catch (err) {
    console.warn("[Server Customers] Error leyendo archivo local data/customers.json:", err);
  }
  return [];
}

function writeLocalCustomersFile(customers: Customer[]): void {
  try {
    const dir = path.dirname(LOCAL_CUSTOMERS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CUSTOMERS_PATH, JSON.stringify(customers, null, 2), "utf-8");
  } catch {
    // Modo serverless solo lectura
  }
}

async function persistCustomers(customers: Customer[]): Promise<string> {
  const cache = getCache();
  cache.customers = customers;
  cache.lastFetched = Date.now();

  writeLocalCustomersFile(customers);

  let blobUrl = cache.blobUrl || "";
  try {
    const blob = await put(BLOB_CUSTOMERS_FILENAME, JSON.stringify(customers, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/json",
    });
    blobUrl = blob.url;
    cache.blobUrl = blobUrl;
  } catch (blobErr: unknown) {
    console.warn("[Server Customers] Aviso al guardar en Vercel Blob:", blobErr);
  }

  return blobUrl;
}

export async function getBlobOnlyCustomers(): Promise<Customer[]> {
  const cache = getCache();
  const now = Date.now();

  let blobCustomers: Customer[] | null = null;
  const targetUrl = (cache.blobUrl || DIRECT_BLOB_CUSTOMERS_URL) + `?t=${now}`;
  try {
    const res = await fetch(targetUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        blobCustomers = data as Customer[];
      }
    }
  } catch (e: unknown) {
    console.warn("[Server Customers] Aviso al leer de Vercel Blob:", e);
  }

  if (blobCustomers !== null && blobCustomers.length > 0) {
    return blobCustomers;
  }
  if (cache.customers && cache.customers.length > 0) {
    return cache.customers;
  }
  return readLocalCustomersFile();
}

export async function getLatestServerCustomers(): Promise<Customer[]> {
  const cache = getCache();
  const now = Date.now();

  if (cache.customers && cache.customers.length > 0 && now - cache.lastFetched < 10000) {
    return cache.customers;
  }

  if (isServerSupabaseConfigured) {
    try {
      const client = getServerSupabase();
      if (client) {
        const { data, error } = await client
          .from("customers")
          .select("*")
          .order("updated_at", { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = (data as SupabaseCustomerRow[]).map(supabaseRowToCustomer);
          cache.customers = mapped;
          cache.lastFetched = now;
          writeLocalCustomersFile(mapped);
          return mapped;
        }
      }
    } catch (supaErr: unknown) {
      console.warn("[Server Customers] Fallback a Blob tras aviso en Supabase:", supaErr);
    }
  }

  const finalCustomers = await getBlobOnlyCustomers();

  cache.customers = finalCustomers;
  cache.lastFetched = now;
  writeLocalCustomersFile(finalCustomers);

  return finalCustomers;
}

export type UpsertCustomerPayload = Partial<Customer> & {
  incrementOrder?: boolean;
  orderAmount?: number;
  explicitEdit?: boolean;
};

export async function upsertServerCustomer(
  body: UpsertCustomerPayload
): Promise<{ customer: Customer; customers: Customer[]; blobUrl: string }> {
  const customers = [...(await getLatestServerCustomers())];

  const normalizedEmail = (body.email ?? "").trim().toLowerCase();
  const trimmedPhone = (body.phone ?? "").trim();
  const trimmedName = (body.name ?? "").trim();
  const cleanPhoneInput = cleanCustomerPhoneDigits(trimmedPhone);

  let idx = -1;
  let foundById = false;

  if (body.id && !body.id.startsWith("ORD-CUST-")) {
    idx = customers.findIndex((c) => c.id === body.id);
    if (idx >= 0) foundById = true;
  }

  if (idx < 0 && normalizedEmail) {
    idx = customers.findIndex(
      (c) => c.email && c.email.trim().toLowerCase() === normalizedEmail
    );
  }

  if (idx < 0 && cleanPhoneInput.length >= 8) {
    idx = customers.findIndex((c) => {
      if (!c.phone) return false;
      const cDigits = cleanCustomerPhoneDigits(c.phone);
      return (
        cDigits === cleanPhoneInput ||
        (cDigits.length >= 8 && cDigits.slice(-8) === cleanPhoneInput.slice(-8))
      );
    });
  }

  const now = new Date().toISOString();
  const derivedShip = body.shippingMethodName
    ? resolveShippingCompanyAndDelivery(body.shippingMethodName)
    : null;

  let updatedCustomer: Customer;

  if (idx >= 0) {
    const existing = customers[idx];
    const allowClear = body.explicitEdit === true || foundById;

    const resolveOptional = (
      incoming: string | undefined,
      current: string | undefined,
      fallback = ""
    ): string => {
      if (allowClear) {
        return incoming !== undefined ? incoming.trim() : current ?? fallback;
      }
      return incoming && incoming.trim() ? incoming.trim() : current ?? fallback;
    };

    const nextEmail = allowClear
      ? body.email !== undefined
        ? normalizedEmail
        : existing.email || ""
      : normalizedEmail || existing.email || "";

    const nextObservations = resolveOptional(body.observations, existing.observations, "");
    const nextRutInfo = resolveOptional(body.rutInfo, existing.rutInfo, "");
    const nextShippingMethodName = resolveOptional(
      body.shippingMethodName,
      existing.shippingMethodName,
      ""
    );
    const nextPaymentMethodId = resolveOptional(
      body.paymentMethodId,
      existing.paymentMethodId,
      ""
    );
    const nextInternalNotes =
      body.internalNotes !== undefined
        ? allowClear
          ? body.internalNotes.trim()
          : body.internalNotes.trim() || existing.internalNotes || ""
        : existing.internalNotes || "";

    updatedCustomer = {
      ...existing,
      name: trimmedName || existing.name,
      phone: resolveOptional(body.phone, existing.phone, ""),
      email: nextEmail,
      department:
        body.department !== undefined && body.department.trim()
          ? body.department.trim()
          : existing.department || "Montevideo",
      city: resolveOptional(body.city, existing.city, ""),
      address: resolveOptional(body.address, existing.address, ""),
      deliveryType:
        body.deliveryType ||
        derivedShip?.deliveryType ||
        existing.deliveryType ||
        "domicilio",
      shippingCompany:
        body.shippingCompany ||
        derivedShip?.shippingCompany ||
        existing.shippingCompany ||
        "dac",
      observations: nextObservations || undefined,
      rutInfo: nextRutInfo || undefined,
      shippingMethodName: nextShippingMethodName || undefined,
      paymentMethodId: nextPaymentMethodId || undefined,
      internalNotes: nextInternalNotes || undefined,
      totalOrders: (existing.totalOrders || 0) + (body.incrementOrder ? 1 : 0),
      totalSpent: (existing.totalSpent || 0) + (Number(body.orderAmount) || 0),
      lastOrderAt: body.incrementOrder ? now : existing.lastOrderAt || now,
      updatedAt: now,
    };

    if (allowClear) {
      if (body.observations !== undefined && !body.observations.trim()) {
        updatedCustomer.observations = "";
      }
      if (body.rutInfo !== undefined && !body.rutInfo.trim()) {
        updatedCustomer.rutInfo = "";
      }
      if (body.shippingMethodName !== undefined && !body.shippingMethodName.trim()) {
        updatedCustomer.shippingMethodName = "";
      }
      if (body.paymentMethodId !== undefined && !body.paymentMethodId.trim()) {
        updatedCustomer.paymentMethodId = "";
      }
      if (body.internalNotes !== undefined && !body.internalNotes.trim()) {
        updatedCustomer.internalNotes = "";
      }
    }

    customers[idx] = updatedCustomer;
  } else {
    const newId =
      body.id && !body.id.startsWith("ORD-CUST-")
        ? body.id
        : `CUST-${Date.now().toString(36).toUpperCase()}`;

    updatedCustomer = {
      id: newId,
      name: trimmedName || "Cliente",
      phone: trimmedPhone,
      email: normalizedEmail,
      department: (body.department || "").trim() || "Montevideo",
      city: (body.city || "").trim(),
      address: (body.address || "").trim(),
      deliveryType: body.deliveryType || derivedShip?.deliveryType || "domicilio",
      shippingCompany: body.shippingCompany || derivedShip?.shippingCompany || "dac",
      observations: (body.observations || "").trim() || undefined,
      rutInfo: (body.rutInfo || "").trim() || undefined,
      shippingMethodName: (body.shippingMethodName || "").trim() || undefined,
      paymentMethodId: (body.paymentMethodId || "").trim() || undefined,
      internalNotes: (body.internalNotes || "").trim() || undefined,
      totalOrders: body.incrementOrder ? 1 : Number(body.totalOrders) || 0,
      totalSpent: Number(body.orderAmount) || Number(body.totalSpent) || 0,
      lastOrderAt: body.incrementOrder ? now : body.lastOrderAt,
      createdAt: now,
      updatedAt: now,
    };
    customers.unshift(updatedCustomer);
  }

  if (isServerSupabaseConfigured) {
    try {
      const client = getServerSupabase();
      if (client) {
        const { error } = await client
          .from("customers")
          .upsert(customerToSupabaseRow(updatedCustomer), { onConflict: "id" });
        if (!error) {
          const cache = getCache();
          cache.customers = customers;
          cache.lastFetched = Date.now();
          writeLocalCustomersFile(customers);
          return {
            customer: updatedCustomer,
            customers,
            blobUrl: cache.blobUrl || "",
          };
        }
      }
    } catch (supaErr: unknown) {
      console.warn("[Server Customers] Fallback a Blob en upsertServerCustomer:", supaErr);
    }
  }

  const blobUrl = await persistCustomers(customers);
  return { customer: updatedCustomer, customers, blobUrl };
}

export async function deleteServerCustomer(
  id: string
): Promise<{ customers: Customer[]; blobUrl: string }> {
  const customers = await getLatestServerCustomers();
  const filtered = customers.filter((c) => c.id !== id);

  if (isServerSupabaseConfigured) {
    try {
      const client = getServerSupabase();
      if (client) {
        const { error } = await client.from("customers").delete().eq("id", id);
        if (!error) {
          const cache = getCache();
          cache.customers = filtered;
          cache.lastFetched = Date.now();
          writeLocalCustomersFile(filtered);
          return { customers: filtered, blobUrl: cache.blobUrl || "" };
        }
      }
    } catch (supaErr: unknown) {
      console.warn("[Server Customers] Fallback a Blob en deleteServerCustomer:", supaErr);
    }
  }

  const blobUrl = await persistCustomers(filtered);
  return { customers: filtered, blobUrl };
}

export async function syncCustomerFromOrder(
  order: Order,
  isNew: boolean,
  options?: { customerId?: string; skipProfileUpdate?: boolean }
): Promise<void> {
  if (!order.customer) return;

  const name = (order.customer.name || "").trim();
  const phone = (order.customer.phone || "").trim();
  const email = (order.customer.email || "").trim().toLowerCase();
  const resolvedCustomerId =
    options?.customerId && !options.customerId.startsWith("ORD-CUST-")
      ? options.customerId
      : order.customerId && !order.customerId.startsWith("ORD-CUST-")
      ? order.customerId
      : undefined;

  if (options?.skipProfileUpdate) {
    if (!isNew) return;
    const customers = [...(await getLatestServerCustomers())];
    const cleanPhoneInput = cleanCustomerPhoneDigits(phone);

    let idx = -1;
    if (resolvedCustomerId) {
      idx = customers.findIndex((c) => c.id === resolvedCustomerId);
    }
    if (idx < 0 && email) {
      idx = customers.findIndex(
        (c) => c.email && c.email.trim().toLowerCase() === email
      );
    }
    if (idx < 0 && cleanPhoneInput.length >= 8) {
      idx = customers.findIndex((c) => {
        if (!c.phone) return false;
        const cDigits = cleanCustomerPhoneDigits(c.phone);
        return (
          cDigits === cleanPhoneInput ||
          (cDigits.length >= 8 && cDigits.slice(-8) === cleanPhoneInput.slice(-8))
        );
      });
    }

    if (idx < 0) return;

    const existing = customers[idx];
    const now = new Date().toISOString();
    const spent = Number(order.finalTotal || order.totalPrice || 0);
    const updatedCounters: Customer = {
      ...existing,
      totalOrders: (existing.totalOrders || 0) + 1,
      totalSpent: (existing.totalSpent || 0) + spent,
      lastOrderAt: order.createdAt || now,
      updatedAt: now,
    };
    customers[idx] = updatedCounters;

    if (isServerSupabaseConfigured) {
      try {
        const client = getServerSupabase();
        if (client) {
          const { error } = await client
            .from("customers")
            .update({
              total_orders: updatedCounters.totalOrders,
              total_spent: updatedCounters.totalSpent,
              last_order_at: updatedCounters.lastOrderAt,
              updated_at: updatedCounters.updatedAt,
            })
            .eq("id", existing.id);
          if (!error) {
            const cache = getCache();
            cache.customers = customers;
            cache.lastFetched = Date.now();
            writeLocalCustomersFile(customers);
            return;
          }
        }
      } catch (supaErr: unknown) {
        console.warn("[Server Customers] Fallback a Blob en incremento de pedido:", supaErr);
      }
    }

    await persistCustomers(customers);
    return;
  }

  if (!name && !email && !phone && !resolvedCustomerId) return;

  const shippingMethodName = (order.shippingMethodName || "").trim();
  const derivedShip = shippingMethodName
    ? resolveShippingCompanyAndDelivery(shippingMethodName)
    : null;

  await upsertServerCustomer({
    id: resolvedCustomerId,
    name: name || "Cliente",
    phone,
    email,
    department: order.customer.department || "Montevideo",
    city: order.customer.city || "",
    address: order.customer.address || "",
    observations: (order.observations || order.customer.observations || "").trim(),
    shippingMethodName: shippingMethodName || undefined,
    paymentMethodId: order.paymentMethodId || undefined,
    deliveryType:
      order.deliveryType ||
      order.customer.deliveryType ||
      derivedShip?.deliveryType ||
      "domicilio",
    shippingCompany: derivedShip?.shippingCompany || "dac",
    incrementOrder: isNew,
    orderAmount: isNew ? Number(order.finalTotal || order.totalPrice || 0) : 0,
  });
}
