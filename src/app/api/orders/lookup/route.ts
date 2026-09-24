import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, readJson } from "@/lib/require-admin";

/** Extract clean last 10 digits of mobile number. */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/** Lowercase, trim, collapse extra spaces. */
function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Flexible name matching logic:
 * Matches if:
 * 1. Exact string match ("tirth patel" === "tirth patel")
 * 2. One string contains the other ("tirth" in "tirth patel")
 * 3. First names match ("tirth" === "tirth")
 */
function isNameMatch(storedNameRaw: string, searchNameRaw: string): boolean {
  const stored = normalizeName(storedNameRaw);
  const search = normalizeName(searchNameRaw);

  if (!stored || !search) return false;
  if (stored === search) return true;
  if (stored.includes(search) || search.includes(stored)) return true;

  const storedFirst = stored.split(" ")[0];
  const searchFirst = search.split(" ")[0];
  if (storedFirst && searchFirst && storedFirst === searchFirst) return true;

  return false;
}

function maskAddress(addr: string | null | undefined): string | null {
  if (!addr) return null;
  const s = addr.trim();
  if (s.length <= 10) return "***";
  return s.slice(0, 5) + " *** " + s.slice(-4);
}

function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 4) return "****";
  return "******" + d.slice(-4);
}

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
    return badRequest("Enter the name used at checkout");
  }

  // Fetch candidate orders from MongoDB where phone number contains search digits
  const candidates = await prisma.order.findMany({
    where: {
      OR: [
        { customerPhone: { contains: phone } },
        { customerPhone: { contains: phoneRaw.trim() } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Filter candidate orders using normalized phone and smart flexible name matching
  const matched = candidates.filter((o) => {
    const dbPhoneDigits = normalizePhone(o.customerPhone);
    const phoneMatch = dbPhoneDigits === phone || o.customerPhone.includes(phone);
    const nameMatch = isNameMatch(o.customerName, name);
    return phoneMatch && nameMatch;
  });

  if (matched.length === 0) {
    return Response.json(
      { error: "No orders found for this phone number and name combination." },
      { status: 404 }
    );
  }

  const orders = matched.map((o) => ({
    id: o.id,
    orderId: o.orderId,
    customerName: o.customerName,
    customerPhone: maskPhone(o.customerPhone),
    customerAddress: maskAddress(o.customerAddress),
    landmark: o.landmark ? "***" : null,
    pincode: o.pincode ? o.pincode.replace(/\d(?=\d{2})/g, "*") : null,
    items: o.items,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    paymentMethod: o.paymentMethod,
    status: o.status,
    orderType: o.orderType,
    deliverySlot: o.deliverySlot,
    notes: null,
    statusHistory: o.statusHistory,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    masked: true as const,
  }));

  return Response.json({ orders, verified: true });
}