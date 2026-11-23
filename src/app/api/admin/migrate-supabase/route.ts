import { NextResponse } from "next/server";
import {
  getAdminSessionFromRequest,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth-server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { getBlobOnlyOrders, orderToSupabaseRow } from "@/lib/server-orders";
import {
  customerToSupabaseRow,
  getBlobOnlyCustomers,
} from "@/lib/server-customers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const [blobOrders, blobCustomers] = await Promise.all([
      getBlobOnlyOrders(),
      getBlobOnlyCustomers(),
    ]);

    let tablesReady = false;
    let supabaseOrdersCount = 0;
    let supabaseCustomersCount = 0;

    if (isServerSupabaseConfigured) {
      const client = getServerSupabase();
      if (client) {
        const [ordersRes, customersRes] = await Promise.all([
          client.from("orders").select("id", { count: "exact", head: true }),
          client.from("customers").select("id", { count: "exact", head: true }),
        ]);

        if (!ordersRes.error && !customersRes.error) {
          tablesReady = true;
          supabaseOrdersCount = ordersRes.count ?? 0;
          supabaseCustomersCount = customersRes.count ?? 0;
        }
      }
    }

    const activeEngine: "supabase" | "blob" =
      isServerSupabaseConfigured &&
      tablesReady &&
      (supabaseOrdersCount > 0 ||
        supabaseCustomersCount > 0 ||
        (blobOrders.length === 0 && blobCustomers.length === 0))
        ? "supabase"
        : "blob";

    return NextResponse.json(
      {
        supabaseConfigured: isServerSupabaseConfigured,
        tablesReady,
        activeEngine,
        blobOrdersCount: blobOrders.length,
        blobCustomersCount: blobCustomers.length,
        supabaseOrdersCount,
        supabaseCustomersCount,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error consultando estado de base de datos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }

  if (!isServerSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Falta configurar NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.",
      },
      { status: 400 }
    );
  }

  const client = getServerSupabase();
  if (!client) {
    return NextResponse.json(
      { error: "No se pudo inicializar el cliente de servidor Supabase." },
      { status: 500 }
    );
  }

  try {
    const [blobCustomers, blobOrders] = await Promise.all([
      getBlobOnlyCustomers(),
      getBlobOnlyOrders(),
    ]);

    if (blobCustomers.length > 0) {
      const { error: custErr } = await client
        .from("customers")
        .upsert(blobCustomers.map(customerToSupabaseRow), {
          onConflict: "id",
          ignoreDuplicates: true,
        });

      if (custErr) {
        return NextResponse.json(
          {
            error: `Error migrando clientes (verificá supabase/schema.sql): ${custErr.message}`,
          },
          { status: 500 }
        );
      }
    }

    if (blobOrders.length > 0) {
      const { error: ordErr } = await client
        .from("orders")
        .upsert(blobOrders.map(orderToSupabaseRow), {
          onConflict: "id",
          ignoreDuplicates: true,
        });

      if (ordErr) {
        return NextResponse.json(
          {
            error: `Error migrando pedidos (verificá supabase/schema.sql): ${ordErr.message}`,
          },
          { status: 500 }
        );
      }
    }

    // Invalidar cachés en memoria para leer de inmediato desde Supabase
    if (globalThis.__kamaluso_orders_cache__) {
      globalThis.__kamaluso_orders_cache__.lastFetched = 0;
    }
    if (globalThis.__kamaluso_customers_cache__) {
      globalThis.__kamaluso_customers_cache__.lastFetched = 0;
    }

    return NextResponse.json({
      success: true,
      migratedOrders: blobOrders.length,
      migratedCustomers: blobCustomers.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error inesperado migrando a Supabase";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
