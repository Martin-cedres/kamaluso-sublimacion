import { NextResponse } from "next/server";
import {
  getLatestServerOrders,
  persistServerOrders,
  upsertServerOrder,
  deleteServerOrder,
} from "@/lib/server-orders";
import { syncCustomerFromOrder } from "@/lib/server-customers";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await getLatestServerOrders();
  return NextResponse.json(orders, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      const { blobUrl, orders } = await persistServerOrders(body);
      return NextResponse.json({ success: true, url: blobUrl, orders });
    }

    if (body && body.id) {
      const skipCustomerSync = Boolean(body.skipCustomerSync);
      const customerId =
        typeof body.customerId === "string" ? body.customerId : undefined;
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

      return NextResponse.json({ success: true, url: blobUrl, orders, order });
    }

    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
