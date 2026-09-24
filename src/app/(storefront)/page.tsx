import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/home/HomeClient";

export const metadata: Metadata = {
  title: "Madhuli Namkeen & Sweets — Pure Peanut Oil Mithai in Nikol, Ahmedabad",
  description:
    "Jalebi, kaju katli, dhokla, sev and more — handmade in 100% pure peanut oil, fresh every morning. Order online from Nikol, Ahmedabad.",
};

// Prices, stock and the announcement change from the admin panel, so always render fresh.
export const dynamic = "force-dynamic";

const iso = (d: Date) => d.toISOString();

export default async function HomePage() {
  const [categoriesRaw, bestsellersRaw, settings] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { isBestseller: true },
      orderBy: [{ order: "asc" }],
      take: 6,
      include: { category: true },
    }),
    prisma.settings.findFirst(),
  ]);

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    nameGu: c.nameGu,
    slug: c.slug,
    icon: c.icon,
    order: c.order,
    isActive: c.isActive,
    _count: c._count,
  }));

  const bestsellers = bestsellersRaw.map((p) => ({
    id: p.id,
    name: p.name,
    nameGu: p.nameGu,
    slug: p.slug,
    description: p.description,
    descriptionGu: p.descriptionGu,
    price: p.price,
    unit: p.unit,
    categoryId: p.categoryId,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          nameGu: p.category.nameGu,
          slug: p.category.slug,
          icon: p.category.icon,
          order: p.category.order,
          isActive: p.category.isActive,
        }
      : undefined,
    image: p.image,
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    tags: p.tags,
    order: p.order,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  }));

  const settingsJson = settings
    ? {
        ...settings,
        updatedAt: iso(settings.updatedAt),
      }
    : null;

  return (
    <HomeClient
      categories={categories}
      bestsellers={bestsellers}
      settings={settingsJson}
    />
  );
}
