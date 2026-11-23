import { NextResponse } from "next/server";
import {
  getAdminSessionFromRequest,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth-server";
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
    const adminSession = getAdminSessionFromRequest(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    const isEmailLookup = Boolean(email && email.trim());
    const isPhoneLookup = Boolean(phone && phone.trim());

    if (!isEmailLookup && !isPhoneLookup && !adminSession) {
      return unauthorizedAdminResponse();
    }

    const customers = await getLatestServerCustomers();

    if (isEmailLookup && email) {
      const normalizedEmail = email.trim().toLowerCase();
      const found = customers.find(
        (c) => c.email && c.email.trim().toLowerCase() === normalizedEmail
      );
      if (found) {
        return NextResponse.json({
          found: true,
          customer: adminSession ? found : { ...found, internalNotes: undefined },
        });
      }
      return NextResponse.json({ found: false, customer: null });
    }

    if (isPhoneLookup && phone) {
      const targetDigits = cleanCustomerPhoneDigits(phone);
      if (targetDigits.length >= 8) {
        const found = customers.find((c) => {
          const cDigits = cleanCustomerPhoneDigits(c.phone);
          return cDigits.endsWith(targetDigits) || targetDigits.endsWith(cDigits);
        });
        if (found) {
          return NextResponse.json({
            found: true,
            customer: adminSession ? found : { ...found, internalNotes: undefined },
          });
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
    const adminSession = getAdminSessionFromRequest(request);
    const rawBody = (await request.json()) as UpsertCustomerPayload;

    let payload: UpsertCustomerPayload = rawBody;
    if (!adminSession) {
      const {
        id: _ignoredId,
        explicitEdit: _ignoredEdit,
        internalNotes: _ignoredNotes,
        ...publicFields
      } = rawBody;
      void _ignoredId;
      void _ignoredEdit;
      void _ignoredNotes;
      payload = publicFields;
    }

    const email = (payload.email || "").trim().toLowerCase();
    const phone = (payload.phone || "").trim();
    const name = (payload.name || "").trim();

    if (!name && !email && !phone && !payload.id) {
      return NextResponse.json({ error: "Datos de cliente insuficientes" }, { status: 400 });
    }

    const { customer, customers, blobUrl } = await upsertServerCustomer(payload);

    if (!adminSession) {
      return NextResponse.json({
        success: true,
        customer: { id: customer.id, name: customer.name },
      });
    }

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
  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }

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
  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }

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
