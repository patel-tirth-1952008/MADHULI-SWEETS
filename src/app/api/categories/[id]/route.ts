import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, badRequest, notFound, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";

const updateSchema = (body: unknown) => {
  if (typeof body !== "object" || body == null) return { ok: false as const };
  const b = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (typeof b.name === "string" && b.name.trim()) data.name = b.name.trim();
  if (typeof b.nameGu === "string") data.nameGu = b.nameGu || null;
  if (typeof b.icon === "string") data.icon = b.icon;
  if (typeof b.order === "number") data.order = b.order;
  if (typeof b.isActive === "boolean") data.isActive = b.isActive;
  return { ok: true as const, data };
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await readJson(req);
  const parsed = updateSchema(body);
  if (!parsed.ok) return badRequest("Nothing to update");
  const category = await prisma.category.updateMany({ where: { id }, data: parsed.data });
  if (category.count === 0) return notFound();
  const fresh = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!fresh) return notFound();
  logActivity("category_updated", `Category "${fresh.name}" updated`);
  return Response.json({ category: fresh });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!existing) return notFound();
  if (existing._count.products > 0) {
    return badRequest(`Move or delete the ${existing._count.products} items in this category first`);
  }
  await prisma.category.delete({ where: { id } });
  logActivity("category_deleted", `Category "${existing.name}" deleted`);
  return Response.json({ ok: true });
}
