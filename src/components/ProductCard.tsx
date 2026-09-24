"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useT } from "@/i18n";
import { cn, formatPrice, isFestival, isNewProduct, productEmoji, unitLabel } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const t = useT();
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const cat = product.category;
  const emoji = productEmoji(product.name, cat?.icon ?? "🍬");
  const inStock = product.isAvailable;
  const festival = isFestival(product.tags);
  const isNew = isNewProduct(product.createdAt);

  const onAdd = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        nameGu: product.nameGu ?? undefined,
        price: product.price,
        unit: product.unit,
        image: product.image ?? undefined,
      },
      qty
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-line",
        inStock && "transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated"
      )}
    >
      {/* Image / placeholder */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-warm to-ysoft">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl transition-transform duration-500 group-hover:scale-110" role="img" aria-label={product.name}>
              {emoji}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isBestseller && (
            <span className="rounded-full bg-jalebi px-2.5 py-0.5 text-[11px] font-extrabold text-cocoa shadow-card">
              {t("common.bestseller")}
            </span>
          )}
          {festival && (
            <span className="rounded-full bg-warn px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-card">
              {t("common.festival")}
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-ok px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-card">
              {t("common.new")}
            </span>
          )}
        </div>
        {!inStock && (
          <div className="absolute inset-0 grid place-items-center bg-white/55">
            <span className="stamp-text">{t("common.outOfStock")}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-ink">{product.name}</h3>
            {product.nameGu && (
              <p className="truncate font-gu text-sm text-ink2" lang="gu">
                {product.nameGu}
              </p>
            )}
          </div>
          <span
            className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", inStock ? "bg-ok" : "bg-bad")}
            title={inStock ? t("common.inStock") : t("common.outOfStock")}
          />
        </div>
        {product.description && (
          <p className="mt-1.5 line-clamp-1 text-sm text-ink2">{product.description}</p>
        )}
        <div className="mt-auto pt-3">
          <p className="text-2xl font-extrabold tracking-tight text-golddark">
            {formatPrice(product.price)}
            <span className="ml-1 text-xs font-medium text-mute">{unitLabel(product.unit)}</span>
          </p>
          {inStock ? (
            <div className="mt-3 flex items-center gap-2.5">
              <div className="flex shrink-0 items-center rounded-full border border-linemed bg-cream">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink2 transition hover:bg-ysoft"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-bold text-ink">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink2 transition hover:bg-ysoft"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={onAdd}
                className={cn(
                  "flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors",
                  added ? "bg-ok text-white" : "btn-press bg-gold text-cocoa"
                )}
              >
                {added ? `✓ ${t("common.added")}` : t("common.addToCart")}
              </button>
            </div>
          ) : (
            <div className="mt-3 rounded-full bg-line py-2.5 text-center text-sm font-semibold text-mute">
              {t("common.outOfStock")}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
