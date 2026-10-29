import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Customer } from "@/types";

export const dynamic = "force-dynamic";

const BLOB_CUSTOMERS_FILENAME = "data/customers.json";
const DIRECT_BLOB_CUSTOMERS_URL = "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/customers.json";
const LOCAL_CUSTOMERS_PATH = path.join(process.cwd(), "data", "customers.json");

declare global {
  var __kamaluso_customers_cache__: {
    customers: Customer[];
    blobUrl: string | null;
    lastFetched: number;
  } | undefined;
}

if (!globalThis.__kamaluso_customers_cache__) {
  globalThis.__kamaluso_customers_cache__ = {
    customers: [],
    blobUrl: DIRECT_BLOB_CUSTOMERS_URL,
    lastFetched: 0,
  };
}

function cleanDigits(val: string): string {
  return (val || "").replace(/\D/g, "");
}

function readLocalCustomersFile(): Customer[] {
  try {
    if (fs.existsSync(LOCAL_CUSTOMERS_PATH)) {
      const content = fs.readFileSync(LOCAL_CUSTOMERS_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[API Customers] Error leyendo archivo local data/customers.json:", err);
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
  } catch (err) {
    // Modo serverless solo lectura
  }
}

async function getLatestCustomers(): Promise<Customer[]> {
  const cache = globalThis.__kamaluso_customers_cache__!;
  const now = Date.now();

  // Memoria rápida (< 10s)
  if (cache.customers && cache.customers.length > 0 && now - cache.lastFetched < 10000) {
    return cache.customers;
  }

  // Consultar Vercel Blob
  let blobCustomers: Customer[] | null = null;
  const targetUrl = (cache.blobUrl || DIRECT_BLOB_CUSTOMERS_URL) + `?t=${now}`;
  try {
    const res = await fetch(targetUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        blobCustomers = data;
      }
    }
  } catch (e) {
    console.warn("[API Customers] Aviso al leer de Vercel Blob:", e);
  }

  let finalCustomers: Customer[] = [];

  if (blobCustomers !== null && blobCustomers.length > 0) {
    finalCustomers = blobCustomers;
  } else if (cache.customers && cache.customers.length > 0) {
    finalCustomers = cache.customers;
  } else {
    finalCustomers = readLocalCustomersFile();
  }

  cache.customers = finalCustomers;
  cache.lastFetched = now;

  writeLocalCustomersFile(finalCustomers);
  return finalCustomers;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    const customers = await getLatestCustomers();

    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const found = customers.find(
        (c) => c.email && c.email.trim().toLowerCase() === normalizedEmail
      );
      if (found) {
        return NextResponse.json({ found: true, customer: found });
      }
      return NextResponse.json({ found: false, customer: null });
    }

    if (phone && phone.trim()) {
      const targetDigits = cleanDigits(phone);
      if (targetDigits.length >= 8) {
        const found = customers.find((c) => {
          const cDigits = cleanDigits(c.phone);
          return cDigits.endsWith(targetDigits) || targetDigits.endsWith(cDigits);
        });
        if (found) {
          return NextResponse.json({ found: true, customer: found });
        }
      }
      return NextResponse.json({ found: false, customer: null });
    }

    return NextResponse.json(customers, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cache = globalThis.__kamaluso_customers_cache__!;
    const customers = await getLatestCustomers();

    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const name = (body.name || "").trim();

    if (!name && !email && !phone) {
      return NextResponse.json({ error: "Datos de cliente insuficientes" }, { status: 400 });
    }

    // Buscar si ya existe por email o por telefono
    const cleanPhoneInput = cleanDigits(phone);
    const idx = customers.findIndex((c) => {
      if (email && c.email && c.email.toLowerCase() === email) return true;
      if (cleanPhoneInput.length >= 8 && c.phone) {
        const cPhone = cleanDigits(c.phone);
        if (cPhone === cleanPhoneInput) return true;
      }
      return false;
    });

    const now = new Date().toISOString();
    let updatedCustomer: Customer;

    if (idx >= 0) {
      const existing = customers[idx];
      updatedCustomer = {
        ...existing,
        name: name || existing.name,
        phone: phone || existing.phone,
        email: email || existing.email,
        department: body.department || existing.department || "Montevideo",
        city: body.city || existing.city || "",
        address: body.address || existing.address || "",
        deliveryType: body.deliveryType || existing.deliveryType || "domicilio",
        shippingCompany: body.shippingCompany || existing.shippingCompany || "dac",
        totalOrders: (existing.totalOrders || 0) + (body.incrementOrder ? 1 : 0),
        totalSpent: (existing.totalSpent || 0) + (Number(body.orderAmount) || 0),
        lastOrderAt: body.incrementOrder ? now : existing.lastOrderAt || now,
        updatedAt: now,
      };
      customers[idx] = updatedCustomer;
    } else {
      updatedCustomer = {
        id: body.id || `CUST-${Date.now().toString(36).toUpperCase()}`,
        name: name || "Cliente",
        phone: phone || "",
        email: email || "",
        department: body.department || "Montevideo",
        city: body.city || "",
        address: body.address || "",
        deliveryType: body.deliveryType || "domicilio",
        shippingCompany: body.shippingCompany || "dac",
        totalOrders: body.incrementOrder ? 1 : 0,
        totalSpent: Number(body.orderAmount) || 0,
        lastOrderAt: body.incrementOrder ? now : undefined,
        createdAt: now,
        updatedAt: now,
      };
      customers.unshift(updatedCustomer);
    }

    cache.customers = customers;
    cache.lastFetched = Date.now();

    writeLocalCustomersFile(customers);

    // Guardar en Vercel Blob
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
    } catch (blobErr: any) {
      console.warn("[API Customers] Aviso al guardar en Vercel Blob:", blobErr);
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      url: blobUrl,
      totalCustomers: customers.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID de cliente requerido" }, { status: 400 });

    const cache = globalThis.__kamaluso_customers_cache__!;
    const customers = await getLatestCustomers();
    const filtered = customers.filter((c) => c.id !== id);

    cache.customers = filtered;
    cache.lastFetched = Date.now();

    writeLocalCustomersFile(filtered);

    let blobUrl = cache.blobUrl || "";
    try {
      const blob = await put(BLOB_CUSTOMERS_FILENAME, JSON.stringify(filtered, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
        contentType: "application/json",
      });
      blobUrl = blob.url;
      cache.blobUrl = blobUrl;
    } catch (e) {
      console.warn("[API Customers] Aviso al actualizar Vercel Blob tras DELETE:", e);
    }

    return NextResponse.json({ success: true, customers: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
