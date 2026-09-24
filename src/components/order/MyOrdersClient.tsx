"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import type { Order } from "@/types";
import { STATUS_LABEL, STATUS_STYLE } from "@/types";
import { BrandSpinner, EmptyState } from "@/components/ui";
import { useCartStore } from "@/store/cartStore";
import { cn, formatPrice } from "@/lib/utils";
import { useT } from "@/i18n";

const VERIFY_KEY = "madhuli_orders_verify";

type SavedVerify = {
  phone: string;
  name: string;
  verifiedAt: number;
};

function loadSavedVerify(): SavedVerify | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VERIFY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedVerify;
    if (!parsed?.phone || !parsed?.name) return null;
    if (Date.now() - parsed.verifiedAt > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(VERIFY_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveVerify(phone: string, name: string) {
  const payload: SavedVerify = {
    phone,
    name,
    verifiedAt: Date.now(),
  };
  localStorage.setItem(VERIFY_KEY, JSON.stringify(payload));
}

function clearVerify() {
  localStorage.removeItem(VERIFY_KEY);
}

function mergeOrders(a: Order[], b: Order[]): Order[] {
  const map = new Map<string, Order>();
  for (const o of [...a, ...b]) {
    map.set(o.orderId || o.id, o);
  }
  return Array.from(map.values()).sort(
    (x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)
  );
}

export default function MyOrdersClient() {
  const t = useT();
  const ids = useCartStore((s) => s.recentOrderIds);

  const [orders, setOrders] = useState<Order[]>([]);
  const [deviceOrders, setDeviceOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  // Load orders stored on this device (recentOrderIds)
  useEffect(() => {
    if (ids.length === 0) {
      setDeviceOrders([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        fetch(`/api/orders/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((list) => {
      if (!alive) return;
      setDeviceOrders(list.filter(Boolean) as Order[]);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [ids]);

  const runLookup = useCallback(async (p: string, n: string, persist: boolean) => {
    setLookupLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p, name: n }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerified(false);
        setOrders([]);
        setError(data?.error || "Could not find orders. Check phone & name.");
        return;
      }
      setOrders(data.orders as Order[]);
      setVerified(true);
      if (persist) saveVerify(p.trim(), n.trim());
    } catch {
      setError("Network error. Please try again.");
      setVerified(false);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  // Auto re-verify from localStorage
  useEffect(() => {
    const saved = loadSavedVerify();
    if (!saved) return;
    setPhone(saved.phone);
    setName(saved.name);
    void runLookup(saved.phone, saved.name, false);
  }, [runLookup]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = phone.trim();
    const n = name.trim();
    if (!/^\d{10}$/.test(p.replace(/\D/g, "").slice(-10))) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (n.length < 2) {
      setError("Enter the name you used at checkout");
      return;
    }
    void runLookup(p, n, true);
  };

  const onClearVerify = () => {
    clearVerify();
    setVerified(false);
    setOrders([]);
    setPhone("");
    setName("");
    setError(null);
  };

  const displayOrders = mergeOrders(deviceOrders, verified ? orders : []);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">
        {t("nav.orders")}{" "}
        <span className="font-gu text-2xl text-ink2" lang="gu">
          — મારા ઓર્ડર
        </span>
      </h1>
      <p className="mt-2 text-sm text-ink2">
        Orders from this device appear automatically. To see orders from another
        phone or after clearing data, verify with the{" "}
        <strong>same mobile number and name</strong> used at checkout.
      </p>

      {/* Verification Card */}
      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-line bg-[var(--bg-warm,#FFFDF7)] p-5 shadow-card"
      >
        <p className="text-sm font-bold text-ink">Find my orders</p>
        <p className="mt-1 text-xs text-mute">
          We match both fields exactly as entered during checkout. No OTP needed.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink2">
              Mobile number
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none ring-gold focus:ring-2"
              maxLength={14}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink2">
              Name on order
            </span>
            <input
              type="text"
              autoComplete="name"
              placeholder="As entered at checkout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none ring-gold focus:ring-2"
              maxLength={80}
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={lookupLoading}
            className="btn-press rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-cocoa disabled:opacity-60"
          >
            {lookupLoading ? "Checking…" : verified ? "Refresh orders" : "View my orders"}
          </button>
          {verified && (
            <button
              type="button"
              onClick={onClearVerify}
              className="text-xs font-semibold text-ink2 underline-offset-2 hover:underline"
            >
              Clear saved verification
            </button>
          )}
          {verified && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              Verified on this browser
            </span>
          )}
        </div>
      </form>

      {/* Orders List */}
      <div className="mt-8 space-y-4">
        {loading && ids.length > 0 ? (
          <BrandSpinner label="લોડ થાય છે…" />
        ) : displayOrders.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            sub={
              verified
                ? "No orders matched this phone and name."
                : "Place an order, or verify with phone + name to load past orders."
            }
          >
            <Link
              href="/menu"
              className="btn-press inline-block rounded-full bg-gold px-6 py-3 text-sm font-bold text-cocoa"
            >
              Browse menu →
            </Link>
          </EmptyState>
        ) : (
          displayOrders.map((o) => (
            <Link
              key={o.id || o.orderId}
              href={`/order/${o.orderId}`}
              className="block rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-extrabold text-ink">
                    #{o.orderId}
                  </p>
                  <p className="mt-0.5 text-xs text-mute">
                    {format(new Date(o.createdAt), "d MMM yyyy, h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-extrabold",
                      STATUS_STYLE[o.status]
                    )}
                  >
                    {STATUS_LABEL[o.status]}
                  </span>
                  <span className="text-base font-extrabold text-golddark">
                    {formatPrice(o.total)}
                  </span>
                </div>
              </div>
              <p className="mt-2 truncate text-sm text-ink2">
                {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
              {"masked" in o && (o as Order & { masked?: boolean }).masked ? (
                <p className="mt-1 text-xs text-mute">
                  Details partially hidden — verify phone + name for full info.
                </p>
              ) : o.customerAddress ? (
                <p className="mt-1 truncate text-xs text-mute">
                  {o.customerAddress}
                  {o.pincode ? ` · ${o.pincode}` : ""}
                </p>
              ) : null}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}