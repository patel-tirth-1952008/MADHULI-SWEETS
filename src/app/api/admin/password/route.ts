import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validation";
import { adminId, badRequest, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";

/** [ADMIN] Change the admin password. */
export async function POST(req: NextRequest) {
  const id = await adminId();
  if (!id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) return badRequest("Account not found");
  const valid = await bcrypt.compare(parsed.data.current, admin.password);
  if (!valid) return badRequest("Current password is incorrect");

  const hash = await bcrypt.hash(parsed.data.next, 10);
  await prisma.admin.update({ where: { id }, data: { password: hash } });
  logActivity("password_changed", "Admin password changed");
  return Response.json({ ok: true });
}
