import { NextResponse } from "next/server";
import {
  getAdminSessionFromRequest,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth-server";
import { getCustomerSessionFromRequest } from "@/lib/customer-auth-server";
import {
  cleanCustomerPhoneDigits,
  deleteServerCustomer,
  getLatestServerCustomers,
  upsertServerCustomer,
  UpsertCustomerPayload,
} from "@/lib/server-customers";
import { getLatestServerOrders } from "@/lib/server-orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const adminSession = getAdminSessionFromRequest(request);
    const customerSession = getCustomerSessionFromRequest(request);
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

      let existsInOrders = false;
      if (!found) {
        const orders = await getLatestServerOrders();
        existsInOrders = orders.some(
          (o) =>
            o.customer?.email &&
            o.customer.email.trim().toLowerCase() === normalizedEmail
        );
      }

      if (adminSession) {
        return NextResponse.json({
          found: Boolean(found || existsInOrders),
          requiresAuth: false,
          customer: found || null,
        });
      }

      if (customerSession && customerSession.email === normalizedEmail) {
        return NextResponse.json({
          found: Boolean(found || existsInOrders),
          requiresAuth: false,
          customer: found ? { ...found, internalNotes: undefined } : null,
        });
      }

      const exists = Boolean(found || existsInOrders);
      return NextResponse.json({
        found: exists,
        requiresAuth: exists,
        customer: null,
      });
    }

    if (isPhoneLookup && phone) {
      const targetDigits = cleanCustomerPhoneDigits(phone);
      if (targetDigits.length >= 8) {
        const found = customers.find((c) => {
          const cDigits = cleanCustomerPhoneDigits(c.phone);
          return cDigits.endsWith(targetDigits) || targetDigits.endsWith(cDigits);
        });

        if (found) {
          if (adminSession) {
            return NextResponse.json({
              found: true,
              requiresAuth: false,
              customer: found,
            });
          }

          if (
            customerSession &&
            found.email &&
            found.email.trim().toLowerCase() === customerSession.email
          ) {
            return NextResponse.json({
              found: true,
              requiresAuth: false,
              customer: { ...found, internalNotes: undefined },
            });
          }

          return NextResponse.json({
            found: true,
            requiresAuth: true,
            customer: null,
          });
        }
      }
      return NextResponse.json({ found: false, requiresAuth: false, customer: null });
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
