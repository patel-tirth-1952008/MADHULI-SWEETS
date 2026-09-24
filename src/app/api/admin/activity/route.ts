import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/require-admin";

/** [ADMIN] Recent activity feed for the dashboard. */
export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const activities = await prisma.activity.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 8,
  });
  return Response.json({ activities });
}
