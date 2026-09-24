"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Home, Store } from "lucide-react";
import type { Settings } from "@/types";
import { useCartStore, selectSubtotal } from "@/store/cartStore";
import { BrandSpinner } from "@/components/ui";
import { cn, formatPrice, unitLabel } from "@/lib/utils";
import { useT } from "@/i18n";

type Step = 1 | 2 | 3;

const inputCls =
  "w-full rounded-xl border border-linemed bg-white px-4 py-3 text-sm text-ink placeholder:text-mute";

export default function CheckoutClient() {
  const t = useT();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const clear = useCartStore((s) => s.clear);
  const addOrder = useCartStore((s) => s.addOrder);

  const [step, setStep] = useState<Step>(1);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    area: "Nikol",
    pincode: "382350",
    orderType: "delivery" as "delivery" | "pickup",
    payment: "cod" as "cod" | "upi",
    slot: "asap" as "asap" | "morning" | "afternoon" | "evening",
    notes: "",
  });

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSettings(d ?? null))
      .catch(() => {});
  }, []);

  const fee = !settings ? 0 : subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
  const total = subtotal + fee;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (form.orderType === "delivery") {
      if (!form.address.trim()) e.address = "Address is required";
      if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a 6-digit pincode";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerPhone: form.phone,
          orderType: form.orderType,
          customerAddress: form.orderType === "delivery" ? form.address : "",
          landmark: form.orderType === "delivery" ? form.landmark : "",
          pincode: form.orderType === "delivery" ? form.pincode : "",
          paymentMethod: form.payment,
          deliverySlot: form.slot,
          notes: form.notes,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const first: string | undefined = Array.isArray(data.details)
          ? (data.details[0] as string)
          : data.error;
        toast.error(first ?? "Could not place order — please try again");
        return;
      }
      addOrder(data.orderId as string);
      clear();
      router.push(`/order/${data.orderId}?new=1`);
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setPlacing(false);
    }
  };

  const steps: Array<{ n: Step; label: string }> = [
    { n: 1, label: t("checkout.details") },
    { n: 2, label: t("checkout.summary") },
    { n: 3, label: t("checkout.confirm") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">{t("checkout.title")}</h1>

      {/* Progress */}
      <div className="mt-7 flex items-center">
        {steps.map((s, i) => (
          <div key={s.n} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold transition",
                  step > s.n
                    ? "bg-ok text-white"
                    : step === s.n
                      ? "bg-gold text-cocoa shadow-warm"
                      : "bg-line text-mute"
                )}
              >
                {step > s.n ? <Check size={16} /> : s.n}
              </span>
              <span
                className={cn(
                  "mt-1.5 text-[11px] font-bold",
                  step >= s.n ? "text-ink" : "text-mute"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-2 h-1 flex-1 rounded-full", step > s.n ? "bg-ok" : "bg-line")} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        {/* ── STEP 1: details ── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Delivery type */}
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { v: "delivery", label: t("checkout.home"), icon: Home },
                  { v: "pickup", label: t("checkout.pickup"), icon: Store },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => set("orderType", o.v)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-bold transition",
                    form.orderType === o.v
                      ? "border-gold bg-warm text-cocoa"
                      : "border-linemed bg-white text-ink2 hover:border-gold"
                  )}
                >
                  <o.icon size={17} /> {o.label}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">{t("checkout.name")}</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Rameshbhai Patel"
              />
              {errors.name && <p className="mt-1 text-xs font-semibold text-bad">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">{t("checkout.phone")}</label>
              <div className="flex">
                <span className="grid place-items-center rounded-l-xl border border-r-0 border-linemed bg-cream px-4 text-sm font-bold text-ink2">
                  +91
                </span>
                <input
                  className={cn(inputCls, "rounded-l-none")}
                  value={form.phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="99241 22746"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs font-semibold text-bad">{errors.phone}</p>}
            </div>

            {form.orderType === "delivery" ? (
              <div className="space-y-4 rounded-2xl border border-line bg-cream p-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">{t("checkout.address")}</label>
                  <input
                    className={inputCls}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Street, house no., society"
                  />
                  {errors.address && <p className="mt-1 text-xs font-semibold text-bad">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-ink">{t("checkout.area")}</label>
                    <input className={inputCls} value={form.area} onChange={(e) => set("area", e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-ink">{t("checkout.pincode")}</label>
                    <input
                      className={inputCls}
                      value={form.pincode}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                    />
                    {errors.pincode && <p className="mt-1 text-xs font-semibold text-bad">{errors.pincode}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">{t("checkout.landmark")}</label>
                  <input
                    className={inputCls}
                    value={form.landmark}
                    onChange={(e) => set("landmark", e.target.value)}
                    placeholder="Near Jivan Twins Bungalow"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-cream p-4 text-sm text-ink2">
                <p className="font-bold text-ink">🏪 {settings?.shopName ?? "Madhuli Namkeen & Sweets"}</p>
                <p className="mt-1">{settings?.address ?? "Shop No. 17-18, Ishwar Icon, Nikol, Ahmedabad 382350"}</p>
                <p className="mt-1 text-xs text-mute">Ready in ~20 minutes. We&apos;ll call when it is.</p>
              </div>
            )}

            <button
              onClick={() => validateStep1() && setStep(2)}
              className="btn-press w-full rounded-full bg-gold px-6 py-3.5 text-base font-bold text-cocoa"
            >
              {t("checkout.next")} →
            </button>
          </div>
        )}

        {/* ── STEP 2: payment & slot ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-bold text-ink">{t("checkout.payment")}</h3>
              <div className="space-y-2.5">
                {(
                  [
                    { v: "cod", label: "💵 " + t("checkout.cod"), hint: "Pay when your order arrives" },
                    { v: "upi", label: "📱 UPI", hint: t("checkout.upiHint") },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => set("payment", o.v)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition",
                      form.payment === o.v ? "border-gold bg-warm" : "border-linemed bg-white hover:border-gold"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                        form.payment === o.v ? "border-gold" : "border-linemed"
                      )}
                    >
                      {form.payment === o.v && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{o.label}</span>
                      <span className="mt-0.5 block text-xs text-ink2">{o.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {form.orderType === "delivery" && (
              <div>
                <h3 className="mb-3 text-sm font-bold text-ink">{t("checkout.slot")}</h3>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(
                    [
                      { v: "asap", label: t("checkout.slotAsap") },
                      { v: "morning", label: t("checkout.slotMorning") },
                      { v: "afternoon", label: t("checkout.slotAfternoon") },
                      { v: "evening", label: t("checkout.slotEvening") },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.v}
                      onClick={() => set("slot", s.v)}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition",
                        form.slot === s.v ? "border-gold bg-warm text-cocoa" : "border-linemed bg-white text-ink2"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">{t("checkout.notes")}</label>
              <textarea
                className={cn(inputCls, "min-h-24 resize-none")}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value.slice(0, 400))}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border-2 border-linemed bg-white px-6 py-3.5 text-sm font-bold text-ink2"
              >
                ← {t("checkout.back")}
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-press flex-1 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-cocoa"
              >
                {t("checkout.next")} →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: confirm ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h3 className="text-sm font-bold text-ink">Order summary</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.productId} className="flex justify-between gap-3">
                    <span className="text-ink2">
                      {i.name} <span className="text-mute">× {i.quantity} {unitLabel(i.unit)}</span>
                    </span>
                    <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink2">{t("cart.subtotal")}</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink2">{t("cart.delivery")}</dt>
                  <dd className={cn(fee === 0 && "font-bold text-[#15803d]")}>
                    {fee === 0 ? t("cart.free") : formatPrice(fee)}
                  </dd>
                </div>
                <div className="flex justify-between pt-1 text-base font-extrabold">
                  <dt>{t("cart.total")}</dt>
                  <dd className="text-golddark">{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-cream p-5 text-sm text-ink2">
              <p className="font-bold text-ink">
                {form.name} · +91 {form.phone}
              </p>
              <p className="mt-1">
                {form.orderType === "pickup"
                  ? "🏪 Store pickup — " + (settings?.shopName ?? "Madhuli Namkeen & Sweets")
                  : `📍 ${form.address}, ${form.area}${form.landmark ? " (near " + form.landmark + ")" : ""} — ${form.pincode}`}
              </p>
              <p className="mt-1">
                {form.payment === "cod" ? "💵 Cash on Delivery" : "📱 UPI — 9924122746@upi"}
                {form.orderType === "delivery" && ` · ${form.slot.toUpperCase()} slot`}
              </p>
              {form.notes && <p className="mt-2 italic">“{form.notes}”</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-full border-2 border-linemed bg-white px-6 py-3.5 text-sm font-bold text-ink2"
              >
                ← {t("checkout.back")}
              </button>
              <button
                onClick={placeOrder}
                disabled={placing}
                className="btn-press flex-[1.6] rounded-full bg-gold px-6 py-3.5 text-base font-extrabold text-cocoa disabled:opacity-70"
              >
                {placing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cocoa/30 border-t-cocoa" />
                    {t("checkout.placing")}
                  </span>
                ) : (
                  `✓ ${t("checkout.place")}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {placing && step !== 3 && <BrandSpinner label={t("checkout.placing")} />}
      <p className="mt-6 text-center text-xs text-mute">
        By ordering you agree to our friendly neighbourhood terms: <Link href="/contact" className="underline">questions? call us.</Link>
      </p>
    </div>
  );
}
