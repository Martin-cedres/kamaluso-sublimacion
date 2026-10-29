import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  getLatestServerOrders,
  persistServerOrders,
  upsertServerOrder,
  deleteServerOrder,
} from "@/lib/server-orders";

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
      const { order, orders, blobUrl } = await upsertServerOrder(body);

      // Sincronizar automáticamente cliente registrado en data/customers.json (entorno local)
      try {
        if (order.customer) {
          const custFile = path.join(process.cwd(), "data", "customers.json");
          let list: any[] = [];
          if (fs.existsSync(custFile)) {
            list = JSON.parse(fs.readFileSync(custFile, "utf-8"));
          }
          const cEmail = (order.customer.email || "").trim().toLowerCase();
          const cPhone = (order.customer.phone || "").trim();
          const cName = (order.customer.name || "").trim();
          if (cName || cEmail || cPhone) {
            const cIdx = list.findIndex((item) => {
              if (cEmail && item.email && item.email.toLowerCase() === cEmail) return true;
              if (cPhone && item.phone && item.phone === cPhone) return true;
              return false;
            });
            const nowStr = new Date().toISOString();
            const spent = Number(order.finalTotal || order.totalPrice || 0);
            if (cIdx >= 0) {
              list[cIdx] = {
                ...list[cIdx],
                name: cName || list[cIdx].name,
                phone: cPhone || list[cIdx].phone,
                email: cEmail || list[cIdx].email,
                department: order.customer.department || list[cIdx].department,
                city: order.customer.city || list[cIdx].city,
                address: order.customer.address || list[cIdx].address,
                totalOrders: (list[cIdx].totalOrders || 0) + 1,
                totalSpent: (list[cIdx].totalSpent || 0) + spent,
                lastOrderAt: order.createdAt || nowStr,
                updatedAt: nowStr,
              };
            } else {
              list.unshift({
                id: `CUST-${Date.now().toString(36).toUpperCase()}`,
                name: cName || "Cliente",
                phone: cPhone,
                email: cEmail,
                department: order.customer.department || "Montevideo",
                city: order.customer.city || "",
                address: order.customer.address || "",
                deliveryType:
                  order.deliveryType ||
                  order.customer.deliveryType ||
                  ((order.shippingMethodName || "").toLowerCase().includes("local")
                    ? "local"
                    : (order.shippingMethodName || "").toLowerCase().includes("agencia")
                    ? "agencia"
                    : "domicilio"),
                shippingCompany: "dac",
                totalOrders: 1,
                totalSpent: spent,
                lastOrderAt: order.createdAt || nowStr,
                createdAt: nowStr,
                updatedAt: nowStr,
              });
            }
            fs.writeFileSync(custFile, JSON.stringify(list, null, 2), "utf-8");
          }
        }
      } catch {
        // Ignorar en serverless
      }

      return NextResponse.json({ success: true, url: blobUrl, orders, order });
    }

    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const orders = await deleteServerOrder(id);
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
