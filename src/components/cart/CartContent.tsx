"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Settings } from "@/types";
import { useCartStore, selectSubtotal, selectCount } from "@/store/cartStore";
import { EmptyState, PrimaryButton } from "@/components/ui";
import { cn, formatPrice, productEmoji, unitLabel } from "@/lib/utils";
import { useT } from "@/i18n";

export default function CartContent({ inDrawer = false }: { inDrawer?: boolean }) {
  const t = useT();
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const subtotal = useCartStore(selectSubtotal);
  const count = useCartStore(selectCount);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSettings(d ?? null))
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className={cn(!inDrawer && "mt-6")}>
        <EmptyState emoji="🍽️" title={t("cart.emptyTitle")} sub={t("cart.emptySub")}>
          <PrimaryButton href="/menu">{t("cart.browse")} →</PrimaryButton>
        </EmptyState>
      </div>
    );
  }

  const freeAbove = settings?.freeDeliveryAbove ?? 500;
  const fee = subtotal >= freeAbove ? 0 : (settings?.deliveryFee ?? 30);
  const total = subtotal + fee;
  const toFree = Math.max(0, freeAbove - subtotal);

  return (
    <div className={cn("flex flex-col space-y-4", !inDrawer && "pt-2")}>
      {!inDrawer && (
        <h1 className="font-display text-3xl font-bold text-ink">
          {t("cart.title")}{" "}
          <span className="text-lg font-medium text-ink2">
            ({count} {t("cart.items")})
          </span>
        </h1>
      )}

      {inDrawer && (
        <p className="text-sm font-medium text-ink2">
          {count} {t("cart.items")}
        </p>
      )}

      {settings && !settings.isOpen && (
        <p className="rounded-xl bg-warn/10 px-4 py-3 text-sm font-semibold text-[#92400e]">
          {t("cart.closed")}
        </p>
      )}

      {/* Item List */}
      <ul
        className={cn(
          "divide-y divide-line",
          !inDrawer && "rounded-2xl border border-line bg-white shadow-card"
        )}
      >
        {items.map((item) => (
          <li key={item.productId} className="flex gap-3 py-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-warm to-ysoft">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-3xl">
                  {productEmoji(item.name, "🍬")}
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{item.name}</p>
                  {item.nameGu && (
                    <p className="truncate font-gu text-xs text-ink2" lang="gu">
                      {item.nameGu}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-mute">
                    {formatPrice(item.price)} {unitLabel(item.unit)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.productId)}
                  aria-label={`Remove ${item.name}`}
                  className="rounded-full p-1.5 text-mute transition hover:bg-bad/10 hover:text-bad"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-full border border-linemed bg-cream">
                  <button
                    type="button"
                    onClick={() => setQty(item.productId, item.quantity - 1)}
                    aria-label="Decrease"
                    className="grid h-7 w-7 place-items-center rounded-full text-ink2 hover:bg-ysoft"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.productId, item.quantity + 1)}
                    aria-label="Increase"
                    className="grid h-7 w-7 place-items-center rounded-full text-ink2 hover:bg-ysoft"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <p className="text-sm font-extrabold text-golddark">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Subtotal & Checkout Card */}
      <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
        {toFree > 0 ? (
          <div className="mb-3">
            <p className="text-xs font-semibold text-deepgold">
              + {formatPrice(toFree)} {t("cart.freeHint")}
            </p>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gold transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeAbove) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mb-3 text-xs font-bold text-[#15803d]">
            🎉 {t("cart.free")} — your delivery is free
          </p>
        )}
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink2">{t("cart.subtotal")}</dt>
            <dd className="font-semibold">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink2">{t("cart.delivery")}</dt>
            <dd className={cn("font-semibold", fee === 0 && "text-[#15803d]")}>
              {fee === 0 ? t("cart.free") : formatPrice(fee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base">
            <dt className="font-bold">{t("cart.total")}</dt>
            <dd className="font-extrabold text-golddark">{formatPrice(total)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="btn-press mt-4 flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-base font-bold text-cocoa"
        >
          {t("cart.proceed")} →
        </Link>
      </div>
    </div>
  );
}