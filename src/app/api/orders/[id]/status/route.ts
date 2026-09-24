import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { statusSchema } from "@/lib/validation";
import { isAdmin, badRequest, notFound, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";
import { STATUS_LABEL } from "@/types";

/** [ADMIN] Advance/set order status — appends to statusHistory. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid status");
  const next = parsed.data.status;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return notFound();

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: next,
      statusHistory: { push: { status: next, time: new Date() } },
    },
  });
  logActivity("order_status", `${existing.orderId} → ${STATUS_LABEL[next]}`);
  return Response.json({ order });
}
