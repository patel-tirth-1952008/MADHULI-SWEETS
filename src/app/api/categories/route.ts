import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";
import { isAdmin, badRequest, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";
import { slugify, uniqueSlug } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return Response.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }
  const d = parsed.data;
  const slug = await uniqueSlug(
    slugify(d.name),
    (s) => prisma.category.findUnique({ where: { slug: s }, select: { id: true } }).then((c) => !!c)
  );
  const category = await prisma.category.create({
    data: { ...d, nameGu: d.nameGu || null, slug },
  });
  logActivity("category_created", `Category "${d.name}" added`);
  return Response.json({ category }, { status: 201 });
}
