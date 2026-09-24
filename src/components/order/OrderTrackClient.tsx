"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Phone } from "lucide-react";
import toast from "react-hot-toast";
import type { Order } from "@/types";
import { SLOT_LABEL, STATUS_LABEL } from "@/types";
import OrderTimeline from "@/components/OrderTimeline";
import { BrandSpinner, EmptyState } from "@/components/ui";
import { customerWaLink, SHOP_WHATSAPP } from "@/lib/whatsapp";
import { cn, formatPrice, unitLabel } from "@/lib/utils";
import { useT } from "@/i18n";

export default function OrderTrackClient() {
  const t = useT();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const isNew = search.get("new") === "1";
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (res.ok) setOrder((await res.json()) as Order);
    } catch {
      /* retry on next poll */
    }
  }, [params.id]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        <EmptyState
          emoji="🔍"
          title="Order not found"
          sub="Check the order ID on your WhatsApp confirmation and try again."
        >
          <Link
            href="/menu"
            className="btn-press inline-block rounded-full bg-gold px-6 py-3 text-sm font-bold text-cocoa"
          >
            Browse menu
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (!order) {
    return <BrandSpinner label="ઓર્ડર લોડ થાય છે…" />;
  }

  const waMsg = [
    `Hi! This is my order ${order.orderId} (${order.customerName}).`,
    "Can you please confirm it? 🙏",
  ].join("\n");

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
      {isNew && (
        <div className="mb-6 rounded-2xl border-2 border-ok/40 bg-ok/10 p-5">
          <p className="font-gu text-lg font-bold text-[#15803d]" lang="gu">
            {t("track.success")}
          </p>
          <a
            href={customerWaLink(order.customerPhone, "Hi Madhuli Namkeen! I just placed order " + order.orderId + " — please confirm. 🙏")}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-extrabold text-white shadow-card transition hover:brightness-105"
          >
            💬 {t("track.whatsappCta")}
          </a>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-mute">Order ID</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              #{order.orderId}
            </h1>
            <p className="mt-1 text-sm text-ink2">
              {format(new Date(order.createdAt), "d MMM yyyy, h:mm a")}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-extrabold",
              order.status === "delivered"
                ? "bg-ok/15 text-[#15803d]"
                : order.status === "cancelled"
                  ? "bg-bad/10 text-bad"
                  : "bg-ysoft text-deepgold"
            )}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="mt-2 text-xs text-mute">⟳ {t("track.autoUpdate")}</p>
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
        <OrderTimeline order={order} />
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="text-sm font-bold text-ink">{t("track.items")}</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3 py-2.5">
              <span className="text-ink2">
                {i.name} <span className="text-mute">× {i.quantity} {unitLabel(i.unit)}</span>
              </span>
              <span className="font-semibold">{formatPrice(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink2">{t("cart.subtotal")}</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink2">{t("cart.delivery")}</dt>
            <dd>{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between pt-1 text-base font-extrabold">
            <dt>{t("cart.total")}</dt>
            <dd className="text-golddark">{formatPrice(order.total)}</dd>
          </div>
          <div className="flex justify-between pt-1">
            <dt className="text-ink2">{t("track.payment")}</dt>
            <dd className="font-semibold">
              {order.paymentMethod === "upi" ? "UPI (9924122746@upi)" : "Cash on Delivery"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Customer details */}
      <div className="mt-6 rounded-2xl bg-cream p-6 text-sm text-ink2">
        <h2 className="text-sm font-bold text-ink">{t("track.customer")}</h2>
        <p className="mt-2 font-semibold text-ink">{order.customerName} · +91 {order.customerPhone}</p>
        <p className="mt-1">
          {order.orderType === "pickup"
            ? "🏪 Store pickup — Ishwar Icon, Nikol"
            : `📍 ${order.customerAddress}${order.landmark ? ", near " + order.landmark : ""}, ${order.pincode}`}
        </p>
        <p className="mt-1">
          ⏰ {order.orderType === "pickup" ? "Store Pickup" : SLOT_LABEL[order.deliverySlot] ?? order.deliverySlot}
        </p>
        {order.notes && <p className="mt-2 italic">“{order.notes}”</p>}
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <a
          href={`tel:${order.customerPhone}`}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-linemed bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:border-gold"
        >
          <Phone size={16} className="text-golddark" /> {t("common.callStore")}
        </a>
        <a
          href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(
            `Hi! About my order ${order.orderId} (${order.customerName}). `
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-105"
        >
          💬 {t("common.whatsapp")}
        </a>
      </div>

      {!isNew && (
        <div className="mt-4 text-center text-xs text-mute">
          Need help?{" "}
          <Link href="/contact" className="underline">
            Contact us
          </Link>
        </div>
      )}
    </div>
  );
}
