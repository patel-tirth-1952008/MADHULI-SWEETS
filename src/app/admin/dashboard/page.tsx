"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import {
  Package,
  IndianRupee,
  CircleCheck,
  CircleX,
  Check,
  X,
  Bell,
  ArrowRight,
} from "lucide-react";
import type { Activity, Order, Product } from "@/types";
import { STATUS_LABEL, STATUS_STYLE } from "@/types";
import { BrandSpinner } from "@/components/ui";
import { cn, formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [pending, setPending] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Order[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [today, pend, prods, rec, act] = await Promise.all([
        fetch("/api/orders?date=today&limit=200").then((r) => (r.ok ? r.json() : { orders: [] })),
        fetch("/api/orders?status=pending&limit=50").then((r) => (r.ok ? r.json() : { orders: [] })),
        fetch("/api/products?limit=200").then((r) => (r.ok ? r.json() : { products: [] })),
        fetch("/api/orders?limit=10").then((r) => (r.ok ? r.json() : { orders: [] })),
        fetch("/api/admin/activity").then((r) => (r.ok ? r.json() : { activities: [] })),
      ]);
      setTodayOrders(today.orders ?? []);
      setPending(pend.orders ?? []);
      setProducts(prods.products ?? []);
      setRecent(rec.orders ?? []);
      setActivity(act.activities ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const setStatus = async (order: Order, status: string) => {
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const label: Record<string, string> = {
        confirmed: "confirmed ✅",
        cancelled: "cancelled 🚫",
        preparing: "now preparing 🔥",
        out_for_delivery: "out for delivery 🛵",
        delivered: "delivered ✅",
        pending: "back to pending",
      };
      toast.success(`${order.orderId} → ${label[status] ?? status}`);
      load();
    } else {
      toast.error("Could not update order");
    }
  };

  const revenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const activeItems = products.filter((p) => p.isAvailable).length;
  const outOfStock = products.filter((p) => !p.isAvailable).length;

  if (loading) return <BrandSpinner label="Dashboard load થાય છે…" />;

  const stats = [
    { label: "Today's Orders", value: String(todayOrders.length), icon: Package, bg: "bg-warm text-deepgold" },
    { label: "Today's Revenue", value: formatPrice(revenue), icon: IndianRupee, bg: "bg-ok/10 text-[#15803d]" },
    { label: "Active Items", value: String(activeItems), icon: CircleCheck, bg: "bg-ysoft text-deepgold" },
    { label: "Out of Stock", value: String(outOfStock), icon: CircleX, bg: "bg-bad/10 text-bad" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">
        Welcome back, Madhuli! <span aria-hidden>🙏</span>
      </h1>
      <p className="mt-1 text-sm text-ink2">{format(new Date(), "EEEE, d MMMM yyyy")}</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl", s.bg)}>
              <s.icon size={20} />
            </span>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{s.value}</p>
            <p className="text-xs font-semibold text-ink2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Pending orders */}
          <section
            className={cn(
              "rounded-2xl border-2 bg-white p-5 shadow-card",
              pending.length > 0 ? "blink-border border-jalebi" : "border-line"
            )}
          >
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
              <Bell size={18} className="text-golddark" />
              Pending Orders
              {pending.length > 0 && (
                <span className="rounded-full bg-jalebi px-2.5 py-0.5 text-xs font-extrabold text-cocoa">
                  {pending.length}
                </span>
              )}
            </h2>
            {pending.length === 0 ? (
              <p className="mt-3 text-sm text-mute">No pending orders — sab theek hai! ✅</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {pending.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink">
                        {o.orderId} · {o.customerName}
                      </p>
                      <p className="text-xs text-ink2">
                        {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")} ·{" "}
                        {format(new Date(o.createdAt), "h:mm a")}
                      </p>
                    </div>
                    <span className="font-extrabold text-golddark">{formatPrice(o.total)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStatus(o, "confirmed")}
                        className="flex items-center gap-1 rounded-full bg-ok px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-105"
                      >
                        <Check size={13} /> Confirm
                      </button>
                      <button
                        onClick={() => setStatus(o, "cancelled")}
                        className="flex items-center gap-1 rounded-full bg-bad px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-105"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent orders */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">Recent Orders</h2>
              <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-deepgold hover:underline">
                All orders <ArrowRight size={14} />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-mute">No orders yet.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-mute">
                      <th className="pb-2 pr-3">Order</th>
                      <th className="pb-2 pr-3">Customer</th>
                      <th className="pb-2 pr-3">Items</th>
                      <th className="pb-2 pr-3 text-right">Total</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {recent.map((o) => (
                      <tr key={o.id}>
                        <td className="py-2.5 pr-3 font-bold text-ink">{o.orderId}</td>
                        <td className="py-2.5 pr-3 text-ink2">
                          {o.customerName}
                          <span className="block text-xs text-mute">+91 {o.customerPhone}</span>
                        </td>
                        <td className="max-w-[180px] truncate py-2.5 pr-3 text-ink2">
                          {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-bold text-golddark">
                          {formatPrice(o.total)}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold", STATUS_STYLE[o.status])}>
                            {STATUS_LABEL[o.status]}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-xs text-mute">
                          {format(new Date(o.createdAt), "d MMM, h:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Activity feed */}
        <section className="h-fit rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-xl font-bold text-ink">Activity</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-mute">No activity yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-ink">{a.message}</p>
                    <p className="mt-0.5 text-xs text-mute">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
