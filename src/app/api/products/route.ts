import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { isAdmin, badRequest, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";
import { slugify, uniqueSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category");
  const search = sp.get("search");
  const sort = sp.get("sort") ?? "popular";
  const bestseller = sp.get("bestseller") === "true";
  const available = sp.get("available");
  const limit = Math.min(Number(sp.get("limit") ?? 24) || 24, 200);
  const offset = Math.max(Number(sp.get("offset") ?? 0) || 0, 0);

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category, isActive: true };
  if (available === "true") where.isAvailable = true;
  if (bestseller) where.isBestseller = true;
  if (search) {
    // Prisma's Mongo connector has no case-insensitive `contains`, so we
    // resolve matching ids with the Mongo driver first, then filter.
    const { getMongo } = await import("@/lib/mongo");
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const db = (await getMongo()).db();
    const docs = await db
      .collection("Product")
      .find(
        {
          $or: [
            { name: { $regex: escaped, $options: "i" } },
            { nameGu: { $regex: escaped, $options: "i" } },
            { description: { $regex: escaped, $options: "i" } },
          ],
        },
        { projection: { _id: true } }
      )
      .toArray();
    const ids = docs.map((d) => d._id.toString());
    if (ids.length === 0) {
      return Response.json({ products: [], total: 0, limit, offset });
    }
    where.id = { in: ids };
  }

  const orderBy =
    sort === "price_asc"
      ? [{ price: "asc" as const }]
      : sort === "price_desc"
        ? [{ price: "desc" as const }]
        : sort === "name"
          ? [{ name: "asc" as const }]
          : [{ isBestseller: "desc" as const }, { order: "asc" as const }, { createdAt: "desc" as const }];

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: true },
      skip: offset,
      take: limit,
    }),
  ]);

  return Response.json({ products, total, limit, offset });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }
  const d = parsed.data;
  const cat = await prisma.category.findUnique({ where: { id: d.categoryId } });
  if (!cat || !cat.isActive) return badRequest("Invalid category");

  const slug = await uniqueSlug(
    slugify(d.name),
    (s) => prisma.product.findUnique({ where: { slug: s }, select: { id: true } }).then((p) => !!p)
  );

  const { categoryId, ...rest } = d;
  const product = await prisma.product.create({
    data: {
      ...rest,
      nameGu: d.nameGu || null,
      description: d.description || null,
      descriptionGu: d.descriptionGu || null,
      image: d.image || null,
      slug,
      category: { connect: { id: categoryId } },
    },
  });
  logActivity("product_created", `${d.name} added to menu`);
  return Response.json({ product }, { status: 201 });
}
