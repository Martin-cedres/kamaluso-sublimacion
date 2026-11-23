import { NextResponse } from "next/server";
import {
  cleanCustomerPhoneDigits,
  deleteServerCustomer,
  getLatestServerCustomers,
  upsertServerCustomer,
  UpsertCustomerPayload,
} from "@/lib/server-customers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    const customers = await getLatestServerCustomers();

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
      const targetDigits = cleanCustomerPhoneDigits(phone);
      if (targetDigits.length >= 8) {
        const found = customers.find((c) => {
          const cDigits = cleanCustomerPhoneDigits(c.phone);
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener clientes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpsertCustomerPayload;
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const name = (body.name || "").trim();

    if (!name && !email && !phone && !body.id) {
      return NextResponse.json({ error: "Datos de cliente insuficientes" }, { status: 400 });
    }

    const { customer, customers, blobUrl } = await upsertServerCustomer(body);

    return NextResponse.json({
      success: true,
      customer,
      url: blobUrl,
      totalCustomers: customers.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar cliente";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as UpsertCustomerPayload;
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const name = (body.name || "").trim();

    if (!body.id && !name && !email && !phone) {
      return NextResponse.json(
        { error: "Se requiere ID o datos mínimos del cliente" },
        { status: 400 }
      );
    }

    const { customer, customers, blobUrl } = await upsertServerCustomer({
      ...body,
      explicitEdit: true,
    });

    return NextResponse.json({
      success: true,
      customer,
      url: blobUrl,
      totalCustomers: customers.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar cliente";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID de cliente requerido" }, { status: 400 });
    }

    const { customers } = await deleteServerCustomer(id);
    return NextResponse.json({ success: true, customers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar cliente";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
