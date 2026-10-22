import { Customer } from "@/types";

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
  customerData: Partial<Customer> & { incrementOrder?: boolean; orderAmount?: number }
): Promise<Customer | null> {
  try {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.customer || null;
  } catch (err) {
    console.warn("Aviso al registrar o actualizar cliente:", err);
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
    if (Array.isArray(data)) return data;
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
