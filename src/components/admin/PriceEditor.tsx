"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

/**
 * The #1 admin feature: click the price, type a new one, press Enter.
 * Escape or ✗ reverts. ✓ or Enter fires PATCH instantly.
 */
export default function PriceEditor({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: (p: Product) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(product.price));
  const [saving, setSaving] = useState(false);

  const start = () => {
    setVal(String(product.price));
    setEditing(true);
  };

  const commit = async () => {
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a valid price (a number above 0)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${product.id}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: n }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(`✅ ${product.name} price updated to ${formatPrice(n)}`);
        onSaved(data.product ?? { ...product, price: n });
        setEditing(false);
      } else {
        toast.error(data.error ?? "Could not update price");
      }
    } finally {
      setSaving(false);
    }
  };

  const revert = () => {
    setVal(String(product.price));
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={start}
        title="Click to edit price"
        className="group rounded-lg px-2 py-1 text-right font-extrabold text-ink transition hover:bg-ysoft"
      >
        {formatPrice(product.price)}
        <span className="ml-1 text-xs font-semibold text-mute opacity-0 transition group-hover:opacity-100">
          ✎
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value.replace(/[^\d.]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") void commit();
          if (e.key === "Escape") revert();
        }}
        inputMode="decimal"
        disabled={saving}
        className="w-24 rounded-lg border-2 border-gold bg-white px-2 py-1 text-right font-extrabold text-ink"
        aria-label={`New price for ${product.name}`}
      />
      <button
        onClick={() => void commit()}
        disabled={saving}
        aria-label="Save price"
        className="grid h-8 w-8 place-items-center rounded-full bg-ok text-white transition hover:brightness-105"
      >
        <Check size={15} />
      </button>
      <button
        onClick={revert}
        disabled={saving}
        aria-label="Cancel"
        className="grid h-8 w-8 place-items-center rounded-full border border-linemed text-ink2 transition hover:bg-line"
      >
        <X size={15} />
      </button>
    </div>
  );
}
