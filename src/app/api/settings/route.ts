import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation";
import { isAdmin, badRequest, readJson } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity";

/** [PUBLIC] Shop settings for the storefront (announcement, hours, delivery…). */
export async function GET() {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    return Response.json({
      shopName: "Madhuli Namkeen & Sweets",
      shopNameGu: "માધુલી નમકીન એન્ડ સ્વીટ્સ",
      phones: ["9924122746", "9723910062", "7284839843"],
      address: "Nikol, Ahmedabad 382350",
      instagram: "madhulinamkeen_sweets2022",
      deliveryRadius: 5,
      minOrder: 100,
      deliveryFee: 30,
      freeDeliveryAbove: 500,
      isOpen: true,
      operatingHours: "",
      contactEmail: "",
      announcement: null,
      announcementActive: false,
    });
  }
  return Response.json(settings);
}

/** [ADMIN] Update settings (partial). */
export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }
  const settings = await prisma.settings.update({
    where: { id: (await prisma.settings.findFirst())!.id },
    data: parsed.data,
  });
  logActivity("settings_updated", "Shop settings updated");
  return Response.json({ settings });
}
