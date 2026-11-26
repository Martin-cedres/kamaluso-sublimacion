import { NextResponse } from "next/server";
import {
  getCustomerSessionFromRequest,
  setCustomerSessionCookie,
  unauthorizedCustomerResponse,
} from "@/lib/customer-auth-server";
import {
  buildUnifiedCustomersList,
  getOrdersForCustomer,
  getTopProductsForCustomer,
  resolveShippingCompanyAndDelivery,
} from "@/lib/customers";
import {
  getLatestServerCustomers,
  upsertServerCustomer,
} from "@/lib/server-customers";
import { getLatestServerOrders } from "@/lib/server-orders";
import { Customer } from "@/types";

export const dynamic = "force-dynamic";

function sanitizeCustomerForClient(customer: Customer): Customer {
  return {
    ...customer,
    internalNotes: undefined,
  };
}

export async function GET(request: Request) {
  const session = getCustomerSessionFromRequest(request);
  if (!session) {
    return unauthorizedCustomerResponse();
  }

  try {
    const [customers, orders] = await Promise.all([
      getLatestServerCustomers(),
      getLatestServerOrders(),
    ]);

    const unifiedCustomers = buildUnifiedCustomersList(customers, orders);
    const matched = unifiedCustomers.find(
      (c) => c.email && c.email.trim().toLowerCase() === session.email
    );

    const customerOrders = matched
      ? getOrdersForCustomer(matched, orders)
      : orders
          .filter(
            (o) =>
              o.customer?.email &&
              o.customer.email.trim().toLowerCase() === session.email
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );

    const topProducts = getTopProductsForCustomer(customerOrders);
    const safeCustomer = matched ? sanitizeCustomerForClient(matched) : null;

    const response = NextResponse.json(
      {
        email: session.email,
        customer: safeCustomer,
        orders: customerOrders,
        topProducts,
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );

    return setCustomerSessionCookie(response, {
      email: session.email,
      name: safeCustomer?.name || session.name,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error al cargar tu cuenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface UpdateMeBody {
  name?: string;
  phone?: string;
  department?: string;
  city?: string;
  address?: string;
  deliveryType?: "agencia" | "domicilio" | "local";
  shippingCompany?: string;
  shippingMethodName?: string;
  paymentMethodId?: string;
  observations?: string;
  rutInfo?: string;
}

export async function PUT(request: Request) {
  const session = getCustomerSessionFromRequest(request);
  if (!session) {
    return unauthorizedCustomerResponse();
  }

  try {
    const body = (await request.json().catch(() => null)) as UpdateMeBody | null;
    if (!body) {
      return NextResponse.json(
        { error: "Datos inválidos para actualizar perfil." },
        { status: 400 }
      );
    }

    const cleanName = (body.name || "").trim();
    const cleanPhone = (body.phone || "").trim();
    if (!cleanName) {
      return NextResponse.json(
        { error: "Ingresá tu nombre completo o razón social." },
        { status: 400 }
      );
    }

    const derived = body.shippingMethodName
      ? resolveShippingCompanyAndDelivery(body.shippingMethodName)
      : null;

    const { customer } = await upsertServerCustomer({
      email: session.email,
      name: cleanName,
      phone: cleanPhone,
      department: (body.department || "").trim() || "Montevideo",
      city: (body.city || "").trim(),
      address: (body.address || "").trim(),
      deliveryType: body.deliveryType || derived?.deliveryType || "agencia",
      shippingCompany:
        body.shippingCompany || derived?.shippingCompany || "dac",
      shippingMethodName: (body.shippingMethodName || "").trim(),
      paymentMethodId: (body.paymentMethodId || "").trim(),
      observations:
        body.observations !== undefined ? body.observations.trim() : undefined,
      rutInfo: body.rutInfo !== undefined ? body.rutInfo.trim() : undefined,
      explicitEdit: true,
      incrementOrder: false,
    });

    const safeCustomer = sanitizeCustomerForClient(customer);
    const response = NextResponse.json({
      success: true,
      customer: safeCustomer,
    });

    return setCustomerSessionCookie(response, {
      email: session.email,
      name: safeCustomer.name,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error al guardar tus datos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
