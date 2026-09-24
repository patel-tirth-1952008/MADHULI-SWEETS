"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Category, Product } from "@/types";
import { BrandSpinner } from "@/components/ui";
import PriceEditor from "@/components/admin/PriceEditor";
import StockToggle from "@/components/admin/StockToggle";
import ProductForm from "@/components/admin/ProductForm";
import { cn, formatPrice, productEmoji, unitLabel } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "sweets", label: "Sweets" },
  { id: "namkeen", label: "Namkeen" },
  { id: "farsan", label: "Farsan" },
  { id: "seasonal", label: "Seasonal" },
  { id: "out", label: "Out of Stock" },
];

function Thumb({ product, size = "h-11 w-11" }: { product: Product; size?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-warm to-ysoft",
        size
      )}
    >
      {product.image ? (
        <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-xl">
          {productEmoji(product.name, product.category?.icon ?? "🍬")}
        </div>
      )}
    </div>
  );
}

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<null | { mode: "add" } | { mode: "edit"; product: Product }>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        fetch("/api/products?limit=200&sort=name").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setProducts(p.products ?? []);
      setCategories(c.categories ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upsert = (p: Product, isNew: boolean) =>
    setProducts((prev) => (isNew ? [p, ...prev] : prev.map((x) => (x.id === p.id ? p : x))));

  const filtered = useMemo(() => {
    let list = products;
    if (filter === "out") list = list.filter((p) => !p.isAvailable);
    else if (filter !== "all") list = list.filter((p) => p.category?.slug === filter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameGu ?? "").toLowerCase().includes(q)
      );
    return list;
  }, [products, filter, search]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  const markSelectedOut = async () => {
    setBulkBusy(true);
    try {
      const ids = [...selected];
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/products/${id}/stock`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: false }),
          })
        )
      );
      setProducts((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, isAvailable: false } : p)));
      toast.success(`⚠️ ${ids.length} items marked Out of Stock`);
      setSelected(new Set());
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/products/${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`🗑️ ${deleting.name} removed from menu`);
        setProducts((prev) => prev.filter((p) => p.id !== deleting.id));
      } else {
        toast.error("Could not delete item");
      }
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  };

  if (loading) return <BrandSpinner label="Menu load થાય છે…" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Menu Items</h1>
          <p className="mt-1 text-sm text-ink2">
            Tap a price to change it. Tap the stock badge to hide an item. Simple.
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 rounded-full bg-ok px-6 py-3 text-sm font-extrabold text-white shadow-card transition hover:brightness-105"
        >
          <Plus size={17} /> Add New Item
        </button>
      </div>

      {/* Filters + search */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition",
                filter === f.id
                  ? "border-gold bg-gold text-cocoa"
                  : "border-linemed bg-white text-ink2 hover:border-gold"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 md:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-full border border-linemed bg-white py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-30 mt-4 flex items-center gap-3 rounded-2xl border border-gold bg-ysoft px-4 py-3 shadow-card">
          <p className="text-sm font-extrabold text-deepgold">{selected.size} selected</p>
          <button
            onClick={() => void markSelectedOut()}
            disabled={bulkBusy}
            className="ml-auto rounded-full bg-warn px-5 py-2 text-xs font-extrabold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {bulkBusy ? "Marking…" : "Mark Selected Out of Stock"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs font-bold text-ink2 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-line bg-white shadow-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-cream text-left text-xs font-extrabold uppercase tracking-wide text-mute">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() =>
                    setSelected(
                      allVisibleSelected
                        ? new Set()
                        : new Set(filtered.map((p) => p.id))
                    )
                  }
                  aria-label="Select all"
                  className="h-4 w-4 accent-gold"
                />
              </th>
              <th className="px-3 py-3">Item</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => (
              <tr key={p.id} className={cn("transition hover:bg-cream", !p.isAvailable && "opacity-70")}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    aria-label={`Select ${p.name}`}
                    className="h-4 w-4 accent-gold"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb product={p} />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink">{p.name}</p>
                      {p.nameGu && (
                        <p className="truncate font-gu text-xs text-ink2" lang="gu">
                          {p.nameGu}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-warm px-3 py-1 text-xs font-bold text-deepgold">
                    {p.category?.icon} {p.category?.name}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <PriceEditor product={p} onSaved={(np) => upsert(np, false)} />
                  <p className="pr-2 text-[10px] text-mute">{unitLabel(p.unit)}</p>
                </td>
                <td className="px-3 py-3">
                  <StockToggle product={p} onSaved={(np) => upsert(np, false)} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setModal({ mode: "edit", product: p })}
                      aria-label={`Edit ${p.name}`}
                      title="Edit"
                      className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink2 transition hover:border-gold hover:bg-warm"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleting(p)}
                      aria-label={`Delete ${p.name}`}
                      title="Delete"
                      className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink2 transition hover:border-bad hover:bg-bad/10 hover:text-bad"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-mute">No items match this filter.</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="mt-5 space-y-3 md:hidden">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={cn("rounded-2xl border border-line bg-white p-4 shadow-card", !p.isAvailable && "opacity-75")}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleSelect(p.id)}
                aria-label={`Select ${p.name}`}
                className="mt-3 h-4 w-4 accent-gold"
              />
              <Thumb product={p} size="h-14 w-14" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{p.name}</p>
                <p className="font-gu text-xs text-ink2" lang="gu">
                  {p.nameGu}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-warm px-2.5 py-0.5 text-[11px] font-bold text-deepgold">
                  {p.category?.name}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <PriceEditor product={p} onSaved={(np) => upsert(np, false)} />
                <StockToggle product={p} onSaved={(np) => upsert(np, false)} />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t border-line pt-3">
              <button
                onClick={() => setModal({ mode: "edit", product: p })}
                className="flex items-center gap-1.5 rounded-full border border-linemed px-4 py-2 text-xs font-extrabold text-ink2"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={() => setDeleting(p)}
                className="flex items-center gap-1.5 rounded-full border border-bad/30 px-4 py-2 text-xs font-extrabold text-bad"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-mute">
            No items match this filter.
          </p>
        )}
      </div>

      {/* Add/Edit modal */}
      <ProductForm
        open={modal !== null}
        mode={modal?.mode ?? "add"}
        product={modal?.mode === "edit" ? modal.product : undefined}
        categories={categories}
        onClose={() => setModal(null)}
        onSaved={(p, isNew) => upsert(p, isNew)}
      />

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-elevated">
            <div className="text-4xl">🗑️</div>
            <h3 className="mt-3 font-display text-xl font-bold text-ink">
              Delete {deleting.name}?
            </h3>
            <p className="mt-2 text-sm text-ink2">
              “{deleting.name}” will be removed from the menu. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => void confirmDelete()}
                disabled={deleteBusy}
                className="flex-1 rounded-full bg-bad px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-105 disabled:opacity-60"
              >
                {deleteBusy ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 rounded-full border-2 border-linemed bg-white px-5 py-3 text-sm font-bold text-ink2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
