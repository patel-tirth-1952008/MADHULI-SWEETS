import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validation";
import { isAdmin, badRequest, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";
import { generateOrderId } from "@/lib/utils";
import { sendOrderEmail } from "@/lib/emails";

// IST is a fixed UTC+5:30 (no DST), so day boundaries are simple arithmetic.
const IST_OFFSET_MS = 5.5 * 3600 * 1000;

function istToday(): { y: number; m: number; d: number } {
  const shifted = new Date(Date.now() + IST_OFFSET_MS);
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth(), d: shifted.getUTCDate() };
}

/** UTC instant when the IST calendar day (y, m0, d) begins at 00:00:00. */
function istDayStartUTC(y: number, m0: number, d: number): Date {
  return new Date(Date.UTC(y, m0, d) - IST_OFFSET_MS);
}

function parseISTDate(s: string): { y: number; m0: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return { y: Number(m[1]), m0: Number(m[2]) - 1, d: Number(m[3]) };
}

function rangeFor(date: string, from?: string, to?: string): { gte: Date; lte: Date } | null {
  const t = istToday();
  switch (date) {
    case "today":
      return { gte: istDayStartUTC(t.y, t.m, t.d), lte: istDayStartUTC(t.y, t.m, t.d + 1) };
    case "yesterday":
      return { gte: istDayStartUTC(t.y, t.m, t.d - 1), lte: istDayStartUTC(t.y, t.m, t.d) };
    case "week":
      return { gte: istDayStartUTC(t.y, t.m, t.d - 6), lte: istDayStartUTC(t.y, t.m, t.d + 1) };
    case "custom": {
      const f = from ? parseISTDate(from) : null;
      const e = to ? parseISTDate(to) : null;
      if (!f || !e) return null;
      return { gte: istDayStartUTC(f.y, f.m0, f.d), lte: istDayStartUTC(e.y, e.m0, e.d + 1) };
    }
    default:
      return null;
  }
}

/** [ADMIN] List orders with filters. */
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const date = sp.get("date");
  const search = sp.get("search");
  const limit = Math.min(Number(sp.get("limit") ?? 50) || 50, 200);

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  const range = rangeFor(date ?? "all", sp.get("from") ?? undefined, sp.get("to") ?? undefined);
  if (range) where.createdAt = { gte: range.gte, lte: range.lte };
  if (search) {
    const q = search.trim();
    where.OR = [
      { customerName: { contains: q } },
      { customerPhone: { contains: q } },
      { orderId: { contains: q.toUpperCase() } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return Response.json({ orders });
}

/** [PUBLIC] Place a new order. Prices are always recomputed server-side. */
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = orderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }
  const d = parsed.data;

  const settings = await prisma.settings.findFirst();
  if (!settings) return Response.json({ error: "Shop is being set up — please call us" }, { status: 503 });

  const uniqueIds = [...new Set(d.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: uniqueIds } } });
  if (products.length !== uniqueIds.length) {
    return badRequest("Some items no longer exist on our menu");
  }
  const map = new Map(products.map((p) => [p.id, p]));
  const outOfStock = d.items.find((i) => !map.get(i.productId)?.isAvailable);
  if (outOfStock) {
    return badRequest(`"${map.get(outOfStock.productId)?.name}" is currently out of stock`);
  }

  const items = d.items.map((i) => {
    const p = map.get(i.productId)!;
    const subtotal = Math.round(p.price * i.quantity * 100) / 100;
    return {
      productId: p.id,
      name: p.name,
      quantity: i.quantity,
      unit: p.unit,
      priceAtTime: p.price,
      subtotal,
    };
  });
  const subtotal = Math.round(items.reduce((s, i) => s + i.subtotal, 0) * 100) / 100;

  if (d.orderType === "delivery" && settings.minOrder > 0 && subtotal < settings.minOrder) {
    return badRequest(`Minimum order is ₹${settings.minOrder} for home delivery`);
  }

  const deliveryFee =
    d.orderType === "pickup" || subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const orderId = await generateOrderId();
  const now = new Date();

  const order = await prisma.order.create({
    data: {
      orderId,
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      customerAddress: d.orderType === "pickup" ? null : d.customerAddress || null,
      landmark: d.orderType === "pickup" ? null : d.landmark || null,
      pincode: d.orderType === "pickup" ? null : d.pincode || null,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: d.paymentMethod,
      status: "pending",
      orderType: d.orderType,
      deliverySlot: d.deliverySlot,
      notes: d.notes || null,
      statusHistory: [{ status: "pending", time: now }],
      createdAt: now,
      updatedAt: now,
    },
  });

  logActivity("order_placed", `New order ${orderId} — ₹${total} (${d.customerName})`);
  void sendOrderEmail(settings.contactEmail, {
    orderId,
    customerName: d.customerName,
    total,
    paymentMethod: d.paymentMethod,
    orderType: d.orderType,
    items,
  }).catch(() => {});

  return Response.json(
    {
      id: order.id,
      orderId: order.orderId,
      subtotal,
      deliveryFee,
      total,
      status: order.status,
    },
    { status: 201 }
  );
}
