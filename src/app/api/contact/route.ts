import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import { badRequest, readJson } from "@/lib/require-admin";
import { sendContactMessage } from "@/lib/emails";
import { logActivity } from "@/lib/activity";

/** [PUBLIC] Contact form → Resend email to the shop's contact email. */
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (body == null) return badRequest("Invalid JSON");
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }
  const d = parsed.data;
  const settings = await prisma.settings.findFirst();
  const to = settings?.contactEmail || process.env.SHOP_EMAIL || "";

  const delivered = await sendContactMessage(to, d);
  logActivity("contact_message", `Message from ${d.name} (${d.phone})`);

  if (!delivered) {
    return Response.json({
      ok: true,
      delivered: false,
      note: "We've noted your message — for a faster reply, call or WhatsApp us directly.",
    });
  }
  return Response.json({ ok: true, delivered: true });
}
