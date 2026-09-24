"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/** One-click stock toggle. The storefront updates immediately. */
export default function StockToggle({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: (p: Product) => void;
}) {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(
          data.product.isAvailable
            ? `✅ ${product.name} is back in stock!`
            : `⚠️ ${product.name} is now Out of Stock`
        );
        onSaved(data.product);
      } else {
        toast.error(data.error ?? "Could not update stock");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={() => void toggle()}
      disabled={busy}
      title={product.isAvailable ? "Click to mark Out of Stock" : "Click to mark Available"}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-extrabold transition",
        product.isAvailable
          ? "bg-ok/15 text-[#15803d] hover:bg-ok/25"
          : "bg-bad/10 text-bad hover:bg-bad/20",
        busy && "opacity-60"
      )}
    >
      {product.isAvailable ? "🟢 Active" : "🔴 Out of Stock"}
    </button>
  );
}
