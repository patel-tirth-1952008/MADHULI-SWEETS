import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM = process.env.SHOP_FROM_EMAIL ?? "Madhuli Namkeen & Sweets <orders@madhuli.in>";

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  orderType: string;
  items: Array<{ name: string; quantity: number; unit: string; subtotal: number }>;
}

/** Sends the shop a new-order email. Returns false when email is not configured. */
export async function sendOrderEmail(to: string, order: OrderEmailData): Promise<boolean> {
  const r = getClient();
  if (!r || !to) return false;
  try {
    const lines = order.items.map((i) => `<tr>
        <td style="padding:4px 12px 4px 0;color:#57534E">${i.name}</td>
        <td style="padding:4px 12px;color:#57534E">${i.quantity} ${i.unit}</td>
        <td style="padding:4px 0;text-align:right;font-weight:600">₹${i.subtotal}</td>
      </tr>`).join("");
    await r.emails.send({
      from: FROM,
      to,
      subject: `New order ${order.orderId} — ₹${order.total}`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #E8DFC9;border-radius:12px;overflow:hidden">
        <div style="background:#FACC15;padding:18px 24px">
          <h1 style="margin:0;font-size:20px;color:#422006">🛎️ New Order ${order.orderId}</h1>
          <p style="margin:4px 0 0;color:#422006;opacity:.8;font-size:13px">Madhuli Namkeen &amp; Sweets, Nikol</p>
        </div>
        <div style="padding:20px 24px">
          <p style="margin:0 0 8px;color:#1C1917"><strong>${order.customerName}</strong> · ${order.orderType === "pickup" ? "Store pickup" : "Home delivery"} · ${order.paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #F5F0E1">${lines}</table>
          <p style="text-align:right;font-size:16px;font-weight:700;color:#A16207;margin-top:12px">Total: ₹${order.total}</p>
          <p style="font-size:12px;color:#A8A29E;margin-top:16px">
            Track: <a href="${APP_URL}/order/${order.orderId}" style="color:#A16207">${APP_URL}/order/${order.orderId}</a>
          </p>
        </div>
      </div>`,
    });
    return true;
  } catch (e) {
    console.error("sendOrderEmail failed:", e);
    return false;
  }
}

/** Sends a contact-form message. Returns false when email is not configured. */
export async function sendContactMessage(
  to: string,
  data: { name: string; phone: string; message: string }
): Promise<boolean> {
  const r = getClient();
  if (!r || !to) return false;
  try {
    await r.emails.send({
      from: FROM,
      to,
      subject: `Website message from ${data.name} (${data.phone})`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #E8DFC9;border-radius:12px;padding:24px">
        <h2 style="margin:0 0 12px;color:#1C1917">💬 New message</h2>
        <p style="margin:0 0 8px"><strong>${data.name}</strong><br/>
        <a href="tel:${data.phone}" style="color:#A16207">${data.phone}</a></p>
        <p style="margin:0;color:#57534E;white-space:pre-wrap">${data.message.replace(/</g, "&lt;")}</p>
      </div>`,
    });
    return true;
  } catch (e) {
    console.error("sendContactMessage failed:", e);
    return false;
  }
}
