import { prisma } from "@/lib/prisma";

/** [PUBLIC] Seeded customer testimonials for the About page. */
export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ createdAt: "asc" }],
    take: 4,
  });
  return Response.json({ testimonials });
}
