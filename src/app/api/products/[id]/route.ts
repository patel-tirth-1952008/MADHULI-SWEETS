import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { isAdmin, badRequest, notFound, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return notFound();
  const d = parsed.data;
  const { categoryId, ...rest } = d;
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      nameGu: d.nameGu || null,
      description: d.description || null,
      descriptionGu: d.descriptionGu || null,
      image: d.image || null,
      category: { connect: { id: categoryId } },
    },
  });
  logActivity("product_updated", `${d.name} updated`);
  return Response.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return notFound();
  await prisma.product.delete({ where: { id } });
  logActivity("product_deleted", `${existing.name} removed from menu`);
  return Response.json({ ok: true });
}
