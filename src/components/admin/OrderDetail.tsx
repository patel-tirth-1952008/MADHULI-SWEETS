"use client";

import { useState } from "react";
import { X, Printer, Phone, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { format } from "date-fns";
import type { Order, OrderStatus } from "@/types";
import { SLOT_LABEL, STATUS_LABEL, STATUS_STYLE } from "@/types";
import { cn, formatPrice, unitLabel } from "@/lib/utils";
import { customerWaLink } from "@/lib/whatsapp";

const NEXT_STATUS: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  pending: { to: "confirmed", label: "Confirm Order" },
  confirmed: { to: "preparing", label: "Mark Preparing" },
  preparing: { to: "out_for_delivery", label: "Out for Delivery" },
  out_for_delivery: { to: "delivered", label: "Mark Delivered" },
};

const HISTORY_ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function OrderDetail({
  order,
  onClose,
  onUpdated,
}: {
  order: Order;
  onClose: () => void;
  onUpdated: (o: Order) => void;
}) {
  const [busy, setBusy] = useState(false);
  const next = NEXT_STATUS[order.status];

  const setStatus = async (status: OrderStatus) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(`${order.orderId} → ${STATUS_LABEL[status]}`);
        onUpdated(data.order ?? { ...order, status });
      } else {
        toast.error("Could not update status");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-ink/30 p-0 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="print-area mx-auto w-full max-w-2xl bg-white shadow-elevated sm:rounded-3xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white px-6 py-4">
            <div>
              <p className="font-display text-2xl font-extrabold text-ink">#{order.orderId}</p>
              <p className="text-xs text-mute">{format(new Date(order.createdAt), "d MMM yyyy, h:mm a")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-3.5 py-1.5 text-xs font-extrabold", STATUS_STYLE[order.status])}>
                {STATUS_LABEL[order.status]}
              </span>
              <button
                onClick={() => window.print()}
                className="no-print grid h-9 w-9 place-items-center rounded-full border border-line text-ink2 transition hover:border-gold hover:bg-warm"
                aria-label="Print order"
                title="Print order"
              >
                <Printer size={15} />
              </button>
              <button
                onClick={onClose}
                className="no-print grid h-9 w-9 place-items-center rounded-full border border-line text-ink2 transition hover:bg-line"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            {/* Items */}
            <section>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-mute">Items</h3>
              <table className="mt-2 w-full text-sm">
                <tbody className="divide-y divide-line">
                  {order.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-ink">{i.name}</td>
                      <td className="py-2 text-right text-ink2">
                        {i.quantity} {unitLabel(i.unit)}
                      </td>
                      <td className="py-2 text-right font-bold">{formatPrice(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink2">Subtotal</dt>
                  <dd>{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink2">Delivery</dt>
                  <dd>{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</dd>
                </div>
                <div className="flex justify-between text-base font-extrabold">
                  <dt>Total</dt>
                  <dd className="text-golddark">{formatPrice(order.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink2">Payment</dt>
                  <dd className="font-semibold">
                    {order.paymentMethod === "upi" ? "UPI (9924122746@upi)" : "Cash on Delivery"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Customer */}
            <section className="rounded-2xl bg-cream p-4 text-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-mute">Customer</h3>
              <p className="mt-2 font-bold text-ink">
                {order.customerName} · +91 {order.customerPhone}
              </p>
              <p className="mt-1 text-ink2">
                {order.orderType === "pickup"
                  ? "🏪 Store pickup — Shop No. 17-18, Ishwar Icon, Nikol"
                  : `📍 ${order.customerAddress}${order.landmark ? ", near " + order.landmark : ""}, ${order.pincode}`}
              </p>
              <p className="mt-1 text-ink2">
                ⏰ {order.orderType === "pickup" ? "Store Pickup" : (SLOT_LABEL[order.deliverySlot] ?? order.deliverySlot)}
              </p>
              {order.notes && <p className="mt-2 italic text-ink2">“{order.notes}”</p>}
            </section>

            {/* Advance / actions */}
            <section className="no-print space-y-3">
              {next ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void setStatus(next.to)}
                    disabled={busy}
                    className="btn-press flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-cocoa disabled:opacity-60"
                  >
                    {next.label} <ChevronRight size={15} />
                  </button>
                  {order.status !== "delivered" && (
                    <button
                      onClick={() => void setStatus("cancelled")}
                      disabled={busy}
                      className="rounded-full border-2 border-bad/40 px-6 py-3 text-sm font-extrabold text-bad transition hover:bg-bad/10 disabled:opacity-60"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ) : (
                <p className="rounded-xl bg-line px-4 py-3 text-sm font-semibold text-ink2">
                  {order.status === "delivered"
                    ? "✅ This order is complete."
                    : "❌ This order was cancelled."}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center gap-2 rounded-full border-2 border-linemed bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:border-gold"
                >
                  <Phone size={14} className="text-golddark" /> Call Customer
                </a>
                <a
                  href={customerWaLink(
                    order.customerPhone,
                    `Hi ${order.customerName}! Update about your order ${order.orderId} from Madhuli Namkeen & Sweets: `
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
                >
                  💬 WhatsApp Customer
                </a>
              </div>
            </section>

            {/* Status history */}
            <section>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-mute">
                Status History
              </h3>
              <ul className="mt-3 space-y-2">
                {HISTORY_ORDER.map((s) => {
                  const entry = order.statusHistory
                    .filter((h) => h.status === s)
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];
                  if (!entry) return null;
                  return (
                    <li key={s} className="flex items-center justify-between text-sm">
                      <span className={cn("font-bold", s === order.status ? "text-ink" : "text-ink2")}>
                        {STATUS_LABEL[s]} {s === order.status && "· now"}
                      </span>
                      <span className="text-xs text-mute">
                        {format(new Date(entry.time), "d MMM, h:mm a")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
