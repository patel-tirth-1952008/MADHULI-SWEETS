import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, readJson } from "@/lib/require-admin";

/** Normalize to last 10 digits (India mobile). */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Lowercase, trim, collapse spaces — used for name equality check. */
function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * POST /api/orders/lookup
 * Body: { phone: string, name: string }
 *
 * Security: both phone AND customer name must match an order.
 * Name is compared normalized (case/spacing). No SMS required.
 */
export async function POST(req: NextRequest) {
  const rawBody = await readJson(req);
  if (!rawBody || typeof rawBody !== "object") return badRequest("Invalid JSON");

  const body = rawBody as Record<string, unknown>;

  const phoneRaw = typeof body.phone === "string" ? body.phone : "";
  const nameRaw = typeof body.name === "string" ? body.name : "";

  const phone = normalizePhone(phoneRaw);
  const name = normalizeName(nameRaw);

  if (!/^\d{10}$/.test(phone)) {
    return badRequest("Enter a valid 10-digit mobile number");
  }
  if (name.length < 2) {
    return badRequest("Enter the full name used at checkout");
  }

  // Fetch by phone candidates
  const candidates = await prisma.order.findMany({
    where: {
      OR: [
        { customerPhone: phone },
        { customerPhone: `+91${phone}` },
        { customerPhone: `91${phone}` },
        { customerPhone: { contains: phone } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Strict name gate — only return orders where name matches
  const matched = candidates.filter(
    (o) => normalizeName(o.customerName) === name
  );

  if (matched.length === 0) {
    // Generic message prevents user enumeration attacks
    return Response.json(
      { error: "No orders found for this phone number and name combination." },
      { status: 404 }
    );
  }

  // Verified: return full order payloads for the legitimate owner
  const orders = matched.map((o) => ({
    id: o.id,
    orderId: o.orderId,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    landmark: o.landmark,
    pincode: o.pincode,
    items: o.items,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    paymentMethod: o.paymentMethod,
    status: o.status,
    orderType: o.orderType,
    deliverySlot: o.deliverySlot,
    notes: o.notes,
    statusHistory: o.statusHistory,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }));

  return Response.json({ orders, verified: true });
}