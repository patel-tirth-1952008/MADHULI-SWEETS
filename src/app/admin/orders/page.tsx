"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Check, ChevronRight, Search, Truck, Flame, X } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { STATUS_LABEL, STATUS_STYLE } from "@/types";
import { BrandSpinner } from "@/components/ui";
import OrderDetail from "@/components/admin/OrderDetail";
import { cn, formatPrice } from "@/lib/utils";

const DATE_FILTERS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "This Week" },
  { id: "custom", label: "Custom" },
  { id: "all", label: "All" },
];

const STATUS_FILTERS: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

type QuickAction = { to: OrderStatus; label: string; icon?: React.ReactNode; className: string };

const QUICK: Record<string, QuickAction[]> = {
  pending: [
    { to: "confirmed", label: "Confirm", icon: <Check size={13} />, className: "bg-ok text-white hover:brightness-105" },
    { to: "cancelled", label: "Cancel", icon: <X size={13} />, className: "bg-bad text-white hover:brightness-105" },
  ],
  confirmed: [
    { to: "preparing", label: "Preparing", icon: <Flame size={13} />, className: "bg-gold text-cocoa hover:brightness-105" },
    { to: "cancelled", label: "Cancel", icon: <X size={13} />, className: "bg-bad text-white hover:brightness-105" },
  ],
  preparing: [
    { to: "out_for_delivery", label: "Out", icon: <Truck size={13} />, className: "bg-ink text-white hover:brightness-110" },
    { to: "cancelled", label: "Cancel", icon: <X size={13} />, className: "bg-bad text-white hover:brightness-105" },
  ],
  out_for_delivery: [
    { to: "delivered", label: "Delivered", icon: <Check size={13} />, className: "bg-ok text-white hover:brightness-105" },
  ],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (date !== "all") {
        params.set("date", date);
        if (date === "custom") {
          if (from) params.set("from", from);
          if (to) params.set("to", to);
        }
      }
      const q = search.trim();
      if (q) params.set("search", q);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, [date, status, search, from, to]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  const quick = async (order: Order, toStatus: OrderStatus) => {
    setBusyId(order.id + toStatus);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const updated: Order = data.order ?? { ...order, status: toStatus };
        setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
        setDetail((d) => (d && d.id === order.id ? updated : d));
        toast.success(`${order.orderId} → ${STATUS_LABEL[toStatus]}`);
      } else {
        toast.error("Could not update order");
      }
    } finally {
      setBusyId(null);
    }
  };

  const shown = useMemo(() => orders, [orders]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">Orders</h1>
      <p className="mt-1 text-sm text-ink2">
        One-tap buttons move orders through the kitchen. Tap any order for the full slip.
      </p>

      {/* Filters */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {DATE_FILTERS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDate(d.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition",
                  date === d.id
                    ? "border-gold bg-gold text-cocoa"
                    : "border-linemed bg-white text-ink2 hover:border-gold"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          {date === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-full border border-linemed bg-white px-3 py-2 text-xs font-semibold"
                aria-label="From date"
              />
              <span className="text-xs text-mute">→</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-full border border-linemed bg-white px-3 py-2 text-xs font-semibold"
                aria-label="To date"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
            className="rounded-full border border-linemed bg-white px-4 py-2.5 text-sm font-semibold text-ink2"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone or order ID…"
              className="w-full rounded-full border border-linemed bg-white py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="mt-8">
          <BrandSpinner label="Orders load થાય છે…" />
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-linemed bg-white p-10 text-center text-sm text-mute">
          No orders for this filter. 
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {shown.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-card transition hover:shadow-elevated sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  onClick={() => setDetail(o)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-mute transition group-hover:text-deepgold"
                  />
                  <div className="min-w-0">
                    <p className="font-extrabold text-ink">
                      {o.orderId}{" "}
                      <span className={cn("ml-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold align-middle", STATUS_STYLE[o.status])}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-sm text-ink2">
                      {o.customerName} · <a href={`tel:${o.customerPhone}`} className="font-semibold text-deepgold">+91 {o.customerPhone}</a>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-mute">
                      {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-extrabold text-golddark">{formatPrice(o.total)}</p>
                    <p className="text-[11px] font-bold text-mute">
                      {o.paymentMethod === "upi" ? "UPI" : "COD"} ·{" "}
                      {format(new Date(o.createdAt), "d MMM, h:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {QUICK[o.status]?.map((a) => (
                      <button
                        key={a.to}
                        onClick={() => void quick(o, a.to)}
                        disabled={busyId === o.id + a.to}
                        title={STATUS_LABEL[a.to]}
                        className={cn(
                          "flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-extrabold transition disabled:opacity-60",
                          a.className
                        )}
                      >
                        {a.icon}
                        <span className="hidden sm:inline">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <OrderDetail
          order={detail}
          onClose={() => setDetail(null)}
          onUpdated={(o) => {
            setDetail(o);
            setOrders((prev) => prev.map((x) => (x.id === o.id ? o : x)));
          }}
        />
      )}
    </div>
  );
}
