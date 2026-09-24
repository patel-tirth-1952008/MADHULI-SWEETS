export const SHOP_WHATSAPP = process.env.SHOP_WHATSAPP_NUMBER ?? "919924122746";

export function waLink(message: string): string {
  return `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/** Customer-facing WhatsApp link to the shop, with a friendly pre-filled message. */
export function shopChatLink(): string {
  return waLink("Hi Madhuli Namkeen! 👋 I'd like to place an order.");
}

export interface WaOrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  customerAddress: string | null;
  landmark: string | null;
  pincode: string | null;
  deliverySlot: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  items: Array<{ name: string; quantity: number; unit: string; subtotal: number }>;
}

/** Builds the shop-notification WhatsApp message for a new order. */
export function orderWaMessage(o: WaOrderData): string {
  const lines = [
    `🛎️ New Order ${o.orderId}`,
    `👤 ${o.customerName} (${o.customerPhone})`,
    o.orderType === "pickup"
      ? "🏪 Store Pickup"
      : `📍 ${o.customerAddress}${o.landmark ? ", near " + o.landmark : ""} — ${o.pincode}`,
    "",
    ...o.items.map((i) => `• ${i.name} × ${i.quantity} ${i.unit} = ₹${i.subtotal}`),
    "",
    `Subtotal: ₹${o.subtotal}`,
    `Delivery: ${o.deliveryFee === 0 ? "FREE" : "₹" + o.deliveryFee}`,
    `Total: ₹${o.total}`,
    `Payment: ${o.paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}`,
    `Slot: ${o.deliverySlot}`,
  ];
  if (o.notes) lines.push(`Notes: ${o.notes}`);
  return lines.join("\n");
}

/** WhatsApp link for a customer's phone (expects 10-digit Indian number). */
export function customerWaLink(phone: string, message: string): string {
  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
}
