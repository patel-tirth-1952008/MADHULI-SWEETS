import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stockSchema } from "@/lib/validation";
import { isAdmin, badRequest, notFound, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";

/** One-click stock toggle — PATCH /api/products/[id]/stock { isAvailable: false } */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = stockSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload");

  const product = await prisma.product.updateMany({
    where: { id },
    data: { isAvailable: parsed.data.isAvailable },
  });
  if (product.count === 0) return notFound();
  const fresh = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!fresh) return notFound();
  logActivity(
    "stock_toggle",
    fresh.isAvailable ? `${fresh.name} is back in stock` : `${fresh.name} marked out of stock`
  );
  return Response.json({ product: fresh });
}
