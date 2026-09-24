"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { ImagePlus, Link2, Trash2, X } from "lucide-react";
import type { Category, Product } from "@/types";
import { UNITS } from "@/lib/validation";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-linemed bg-white px-4 py-3 text-sm text-ink placeholder:text-mute";

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="flex items-center gap-3"
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          on ? "bg-gold" : "bg-linemed"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            on ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
      <span className="text-sm font-semibold text-ink2">{label}</span>
    </button>
  );
}

export default function ProductForm({
  open,
  mode,
  product,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "add" | "edit";
  product?: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: (p: Product, isNew: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    nameGu: "",
    categoryId: "",
    price: "",
    unit: "per kg",
    description: "",
    descriptionGu: "",
    image: "",
    isAvailable: true,
    isFeatured: false,
    isBestseller: false,
    tags: [] as string[],
  });
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: product?.name ?? "",
      nameGu: product?.nameGu ?? "",
      categoryId: product?.categoryId ?? categories[0]?.id ?? "",
      price: product ? String(product.price) : "",
      unit: product?.unit ?? "per kg",
      description: product?.description ?? "",
      descriptionGu: product?.descriptionGu ?? "",
      image: product?.image ?? "",
      isAvailable: product?.isAvailable ?? true,
      isFeatured: product?.isFeatured ?? false,
      isBestseller: product?.isBestseller ?? false,
      tags: product?.tags ?? [],
    });
  }, [open, product, categories]);

  const set = (k: string, v: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG/PNG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        set("image", data.url);
        toast.success("Photo uploaded ✨");
      } else {
        toast.error(data.error ?? "Upload failed — try pasting an image link instead");
      }
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim()) return toast.error("Item name is required");
    if (!Number.isFinite(price) || price <= 0) return toast.error("Enter a valid price");
    if (!form.categoryId) return toast.error("Pick a category");
    setBusy(true);
    try {
      const res = await fetch(mode === "add" ? "/api/products" : `/api/products/${product?.id}`, {
        method: mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          nameGu: form.nameGu.trim(),
          categoryId: form.categoryId,
          price,
          unit: form.unit,
          description: form.description.trim(),
          descriptionGu: form.descriptionGu.trim(),
          image: form.image.trim() || null,
          isAvailable: form.isAvailable,
          isFeatured: form.isFeatured,
          isBestseller: form.isBestseller,
          tags: form.tags,
          order: product?.order ?? 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const first = Array.isArray(data.details) ? data.details[0] : data.error;
        toast.error(first ?? "Could not save item");
        return;
      }
      toast.success(mode === "add" ? `✅ ${form.name} added to menu!` : `✅ ${form.name} saved`);
      onSaved(data.product, mode === "add");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-elevated sm:inset-0 sm:m-auto sm:max-h-[88vh] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-ink">
                {mode === "add" ? "Add New Item" : `Edit — ${product?.name}`}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink2 transition hover:bg-line"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">
                    Item Name (English) <span className="text-bad">*</span>
                  </label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Kaju Katli"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">
                    Item Name (Gujarati)
                  </label>
                  <input
                    className={inputCls + " font-gu"}
                    value={form.nameGu}
                    onChange={(e) => set("nameGu", e.target.value)}
                    placeholder="કાજુ કતલી"
                    lang="gu"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">
                    Category <span className="text-bad">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={form.categoryId}
                    onChange={(e) => set("categoryId", e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">
                    Price (₹) <span className="text-bad">*</span>
                  </label>
                  <input
                    className={inputCls}
                    value={form.price}
                    inputMode="decimal"
                    onChange={(e) => set("price", e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="350"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">
                    Unit <span className="text-bad">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={form.unit}
                    onChange={(e) => set("unit", e.target.value)}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">Description</label>
                  <textarea
                    className={inputCls + " min-h-20 resize-none"}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value.slice(0, 300))}
                    placeholder="Short one-liner customers see"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-ink">
                    Description (Gujarati)
                  </label>
                  <textarea
                    className={inputCls + " min-h-20 resize-none font-gu"}
                    value={form.descriptionGu}
                    onChange={(e) => set("descriptionGu", e.target.value.slice(0, 300))}
                    placeholder="ગુજરાતીમાં ટૂંકું વર્ણન"
                    lang="gu"
                  />
                </div>
              </div>

              {/* ========== IMAGE SECTION (UPDATED) ========== */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-ink">Photo</label>

                {/* 1. PASTE IMAGE URL — easiest for owner */}
                <div>
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-ink2">
                    <Link2 size={14} className="text-deepgold" />
                    Paste image link (easiest)
                  </div>
                  <input
                    className={inputCls}
                    value={form.image}
                    onChange={(e) => set("image", e.target.value.trim())}
                    placeholder="https://... (Google → right-click photo → Copy image address)"
                  />
                  <p className="mt-1.5 text-xs text-mute">
                    Google pe photo khojo → photo pe right click → <strong>“Copy image address”</strong> → yahan paste karo
                  </p>
                </div>

                {/* Live preview when URL is present */}
                {form.image && (
                  <div className="flex items-start gap-3 rounded-2xl border border-line bg-cream p-3">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white shadow-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.3";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-bold text-ink">Photo preview</p>
                      <p className="mt-0.5 truncate text-xs text-mute">{form.image}</p>
                      <button
                        type="button"
                        onClick={() => set("image", "")}
                        className="mt-2 flex items-center gap-1.5 text-xs font-bold text-bad hover:underline"
                      >
                        <Trash2 size={12} /> Remove photo
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Optional: Drag & drop / browse (secondary) */}
                <div className="relative">
                  <div className="mb-1.5 text-xs font-semibold text-ink2">
                    Or upload from phone / computer
                  </div>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition",
                      drag ? "border-gold bg-warm" : "border-linemed bg-cream"
                    )}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleFile(f);
                        e.target.value = "";
                      }}
                    />
                    <ImagePlus size={22} className="text-mute" />
                    <p className="text-sm text-ink2">
                      Drag &amp; drop, or <span className="font-bold text-deepgold">browse</span>
                    </p>
                    <p className="text-xs text-mute">JPG / PNG · up to 5MB</p>
                  </div>
                  {uploading && (
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/40 border-t-gold" />
                      Uploading…
                    </p>
                  )}
                </div>
              </div>
              {/* ========== END IMAGE SECTION ========== */}

              <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-2xl bg-cream p-4">
                <Switch
                  on={form.isAvailable}
                  onToggle={() => set("isAvailable", !form.isAvailable)}
                  label="Available (in stock)"
                />
                <Switch
                  on={form.isFeatured}
                  onToggle={() => set("isFeatured", !form.isFeatured)}
                  label="Featured"
                />
                <Switch
                  on={form.isBestseller}
                  onToggle={() => set("isBestseller", !form.isBestseller)}
                  label="Bestseller"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={busy}
                  className={cn(
                    "flex-1 rounded-full px-6 py-3.5 text-base font-extrabold text-white transition",
                    mode === "add" ? "bg-ok hover:brightness-105" : "bg-golddark hover:brightness-110"
                  )}
                >
                  {busy ? "Saving…" : mode === "add" ? "✓ Add Item" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border-2 border-linemed bg-white px-6 py-3.5 text-sm font-bold text-ink2 transition hover:bg-cream"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}