import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceSchema } from "@/lib/validation";
import { isAdmin, badRequest, notFound, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";
import { formatPrice } from "@/lib/utils";

/** Quick inline price update — PATCH /api/products/[id]/price { price: 350 } */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = priceSchema.safeParse(body);
  if (!parsed.success) return badRequest("Enter a valid price");

  const product = await prisma.product.updateMany({
    where: { id },
    data: { price: parsed.data.price },
  });
  if (product.count === 0) return notFound();
  const fresh = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!fresh) return notFound();
  logActivity("price_update", `${fresh.name} price updated to ${formatPrice(parsed.data.price)}`);
  return Response.json({ product: fresh });
}
