import { NextResponse } from "next/server";
import {
  getAdminSessionFromRequest,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth-server";
import {
  getLatestServerOrders,
  persistServerOrders,
  upsertServerOrder,
  deleteServerOrder,
} from "@/lib/server-orders";
import { syncCustomerFromOrder } from "@/lib/server-customers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const cacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  if (id && id.trim()) {
    const orders = await getLatestServerOrders();
    const found = orders.find((o) => o.id === id.trim());
    if (!found) {
      return NextResponse.json(
        { found: false, order: null },
        { headers: cacheHeaders }
      );
    }
    return NextResponse.json(
      {
        found: true,
        order: {
          id: found.id,
          totalPrice: found.totalPrice,
          shippingCost: found.shippingCost,
          finalTotal: found.finalTotal,
          shippingMethodName: found.shippingMethodName,
          paymentMethodId: found.paymentMethodId,
          status: found.status,
        },
      },
      { headers: cacheHeaders }
    );
  }

  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }

  const orders = await getLatestServerOrders();
  return NextResponse.json(orders, { headers: cacheHeaders });
}

export async function POST(request: Request) {
  try {
    const adminSession = getAdminSessionFromRequest(request);
    const body = await request.json();

    if (Array.isArray(body)) {
      if (!adminSession) {
        return unauthorizedAdminResponse();
      }
      const { blobUrl, orders } = await persistServerOrders(body);
      return NextResponse.json({ success: true, url: blobUrl, orders });
    }

    if (body && body.id) {
      if (!adminSession) {
        if (
          body.skipCustomerSync ||
          (body.status && body.status !== "pendiente")
        ) {
          return unauthorizedAdminResponse();
        }
        const existingOrders = await getLatestServerOrders();
        if (existingOrders.some((o) => o.id === body.id)) {
          return unauthorizedAdminResponse();
        }
      }

      const skipCustomerSync = adminSession ? Boolean(body.skipCustomerSync) : false;
      const customerId =
        adminSession && typeof body.customerId === "string"
          ? body.customerId
          : undefined;
      const cleanOrderBody = { ...body, skipCustomerSync: undefined };
      const { order, orders, blobUrl, isNew } = await upsertServerOrder(cleanOrderBody);

      try {
        await syncCustomerFromOrder(order, isNew, {
          customerId,
          skipProfileUpdate: skipCustomerSync,
        });
      } catch (syncErr: unknown) {
        console.warn("[API Orders] Aviso al sincronizar cliente desde pedido:", syncErr);
      }

      if (!adminSession) {
        return NextResponse.json({
          success: true,
          order: { id: order.id, status: order.status },
        });
      }

      return NextResponse.json({ success: true, url: blobUrl, orders, order });
    }

    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const orders = await deleteServerOrder(id);
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
