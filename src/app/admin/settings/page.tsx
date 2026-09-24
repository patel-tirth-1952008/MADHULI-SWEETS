"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import type { Category, Settings } from "@/types";
import { BrandSpinner } from "@/components/ui";
import { cn, DAYS, DAY_LABEL, parseHours, type DayHours } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-linemed bg-white px-4 py-2.5 text-sm text-ink placeholder:text-mute";

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={on} className="flex items-center gap-3">
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-gold" : "bg-linemed")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
      </span>
      <span className="text-sm font-semibold text-ink2">{label}</span>
    </button>
  );
}

function Card({ title, children, save, dirty }: { title: string; children: React.ReactNode; save?: () => void; dirty?: boolean }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
      {save && (
        <button
          onClick={save}
          disabled={!dirty}
          className={cn(
            "mt-5 rounded-full px-6 py-2.5 text-sm font-extrabold transition",
            dirty ? "btn-press bg-gold text-cocoa" : "cursor-not-allowed bg-line text-mute"
          )}
        >
          Save
        </button>
      )}
    </section>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState<Partial<Settings>>({});
  const [phones, setPhones] = useState<string[]>([]);
  const [hours, setHours] = useState<DayHours>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState({ name: "", nameGu: "", icon: "🍬" });
  const [pass, setPass] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const [s, c] = await Promise.all([
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setSettings(s);
      setForm({
        shopName: s.shopName,
        shopNameGu: s.shopNameGu,
        address: s.address,
        instagram: s.instagram,
        contactEmail: s.contactEmail,
        deliveryRadius: s.deliveryRadius,
        minOrder: s.minOrder,
        deliveryFee: s.deliveryFee,
        freeDeliveryAbove: s.freeDeliveryAbove,
        announcement: s.announcement,
        announcementActive: s.announcementActive,
      });
      setPhones(s.phones ?? []);
      setHours(parseHours(s.operatingHours));
      setCategories(c.categories ?? []);
    } finally {
      setSettings((prev) => prev ?? ({} as Settings));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const putSettings = async (data: Record<string, unknown>, key: string) => {
    setBusy(key);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) toast.success("Settings saved ✅");
      else toast.error(d.error ?? "Could not save");
    } finally {
      setBusy(null);
    }
  };

  const shopDirty =
    JSON.stringify({
      shopName: form.shopName,
      shopNameGu: form.shopNameGu,
      address: form.address,
      instagram: form.instagram,
      contactEmail: form.contactEmail,
      phones,
    }) !==
    JSON.stringify({
      shopName: settings?.shopName,
      shopNameGu: settings?.shopNameGu,
      address: settings?.address,
      instagram: settings?.instagram,
      contactEmail: settings?.contactEmail,
      phones: settings?.phones,
    });

  const deliveryDirty =
    JSON.stringify({
      deliveryRadius: form.deliveryRadius,
      minOrder: form.minOrder,
      deliveryFee: form.deliveryFee,
      freeDeliveryAbove: form.freeDeliveryAbove,
    }) !==
    JSON.stringify({
      deliveryRadius: settings?.deliveryRadius,
      minOrder: settings?.minOrder,
      deliveryFee: settings?.deliveryFee,
      freeDeliveryAbove: settings?.freeDeliveryAbove,
    });

  const hoursDirty =
    JSON.stringify(hours) !== JSON.stringify(parseHours(settings?.operatingHours ?? ""));

  const announceDirty =
    JSON.stringify({
      announcement: form.announcement,
      announcementActive: form.announcementActive,
    }) !==
    JSON.stringify({
      announcement: settings?.announcement,
      announcementActive: settings?.announcementActive,
    });

  const saveHours = () =>
    putSettings({ operatingHours: JSON.stringify(hours) }, "hours");

  const saveShop = () =>
    putSettings(
      {
        shopName: form.shopName,
        shopNameGu: form.shopNameGu,
        address: form.address,
        instagram: form.instagram,
        contactEmail: form.contactEmail,
        phones,
      },
      "shop"
    );

  const saveDelivery = () =>
    putSettings(
      {
        deliveryRadius: Number(form.deliveryRadius),
        minOrder: Number(form.minOrder),
        deliveryFee: Number(form.deliveryFee),
        freeDeliveryAbove: Number(form.freeDeliveryAbove),
      },
      "delivery"
    );

  const saveAnnounce = () =>
    putSettings(
      {
        announcement: form.announcement || null,
        announcementActive: !!form.announcementActive,
      },
      "announce"
    );

  const toggleOpen = async () => {
    if (!settings) return;
    const next = !settings.isOpen;
    setSettings({ ...settings, isOpen: next });
    await putSettings({ isOpen: next }, "open");
    toast(next ? "🟢 Shop marked Open" : "🔴 Shop marked Temporarily Closed");
  };

  const catAction = async (id: string, data: Record<string, unknown>, msg?: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const d = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === id ? d.category : c)));
      if (msg) toast.success(msg);
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? "Could not update category");
    }
  };

  const reorder = async (idx: number, dir: -1 | 1) => {
    const other = idx + dir;
    if (other < 0 || other >= categories.length) return;
    const a = categories[idx];
    const b = categories[other];
    await Promise.all([
      catAction(a.id, { order: b.order }),
      catAction(b.id, { order: a.order }),
    ]);
    toast.success("Categories reordered");
  };

  const addCategory = async () => {
    if (!newCat.name.trim()) return toast.error("Category name required");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    });
    if (res.ok) {
      const d = await res.json();
      setCategories((prev) => [...prev, d.category].sort((x, y) => x.order - y.order));
      setNewCat({ name: "", nameGu: "", icon: "🍬" });
      toast.success(`✅ "${newCat.name}" added`);
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? "Could not add category");
    }
  };

  const deleteCategory = async (c: Category) => {
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      toast.success(`🗑️ "${c.name}" deleted`);
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? "Could not delete category");
    }
  };

  const changePassword = async () => {
    if (pass.next !== pass.confirm) return toast.error("New passwords do not match");
    setBusy("pass");
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pass),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Password changed 🔒");
        setPass({ current: "", next: "", confirm: "" });
      } else {
        toast.error(d.error ?? "Could not change password");
      }
    } finally {
      setBusy(null);
    }
  };

  if (!settings) return <BrandSpinner label="Settings load થાય છે…" />;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink2">Shop info, delivery, hours and the announcement banner.</p>

      <div className="mt-6 grid gap-6">
        {/* Shop status */}
        <section
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 p-6 shadow-card",
            settings.isOpen ? "border-ok/40 bg-ok/5" : "border-bad/40 bg-bad/5"
          )}
        >
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              {settings.isOpen ? "🟢 Open" : "🔴 Temporarily Closed"}
            </h2>
            <p className="mt-1 text-sm text-ink2">
              {settings.isOpen
                ? "The storefront is taking orders."
                : "The storefront shows a “closed today” banner."}
            </p>
          </div>
          <button
            onClick={() => void toggleOpen()}
            className={cn(
              "rounded-full px-6 py-3 text-sm font-extrabold text-white transition",
              settings.isOpen ? "bg-bad hover:brightness-105" : "bg-ok hover:brightness-105"
            )}
          >
            {settings.isOpen ? "Mark Closed" : "Mark Open"}
          </button>
        </section>

        {/* Shop info */}
        <Card title="Shop Info" save={() => void saveShop()} dirty={shopDirty || busy === "shop"}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ink">Shop Name</label>
                <input className={inputCls} value={form.shopName} onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ink">Shop Name (Gujarati)</label>
                <input className={inputCls + " font-gu"} lang="gu" value={form.shopNameGu} onChange={(e) => setForm((f) => ({ ...f, shopNameGu: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Address</label>
              <textarea className={inputCls + " min-h-16 resize-none"} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ink">Instagram handle</label>
                <input className={inputCls} value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ink">Contact email (for order + contact messages)</label>
                <input className={inputCls} type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} placeholder="orders@madhuli.in" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Phone numbers</label>
              <div className="space-y-2">
                {phones.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={inputCls}
                      value={p}
                      inputMode="numeric"
                      maxLength={10}
                      onChange={(e) =>
                        setPhones((prev) => prev.map((x, j) => (j === i ? e.target.value.replace(/\D/g, "") : x)))
                      }
                    />
                    <button
                      onClick={() => setPhones((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove phone"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-ink2 transition hover:border-bad hover:text-bad"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPhones((prev) => [...prev, ""])}
                className="mt-2 flex items-center gap-1.5 text-xs font-extrabold text-deepgold hover:underline"
              >
                <Plus size={13} /> Add phone
              </button>
            </div>
          </div>
        </Card>

        {/* Delivery */}
        <Card title="Delivery Settings" save={() => void saveDelivery()} dirty={deliveryDirty || busy === "delivery"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { k: "deliveryRadius", label: "Radius (km)" },
                { k: "minOrder", label: "Min order (₹)" },
                { k: "deliveryFee", label: "Delivery fee (₹)" },
                { k: "freeDeliveryAbove", label: "Free above (₹)" },
              ] as const
            ).map((f) => (
              <div key={f.k}>
                <label className="mb-1.5 block text-sm font-bold text-ink">{f.label}</label>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  value={(form[f.k] as number | undefined) ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.k]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Operating hours */}
        <Card title="Operating Hours" save={() => void saveHours()} dirty={hoursDirty || busy === "hours"}>
          <div className="grid gap-2 sm:grid-cols-2">
            {DAYS.map((d) => {
              const h = hours[d] ?? null;
              const parts = h ? h.split("-") : null;
              return (
                <div key={d} className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
                  <span className="w-24 text-sm font-bold text-ink">{DAY_LABEL[d]}</span>
                  <Switch
                    on={!!h}
                    onToggle={() =>
                      setHours((prev) => ({ ...prev, [d]: prev[d] ? null : "09:00-21:00" }))
                    }
                    label=""
                  />
                  {h ? (
                    <>
                      <input
                        type="time"
                        value={parts?.[0] ?? "09:00"}
                        onChange={(e) =>
                          setHours((prev) => ({ ...prev, [d]: `${e.target.value}-${parts?.[1] ?? "21:00"}` }))
                        }
                        className="rounded-lg border border-linemed bg-white px-2 py-1.5 text-sm"
                        aria-label={`${DAY_LABEL[d]} open time`}
                      />
                      <span className="text-mute">–</span>
                      <input
                        type="time"
                        value={parts?.[1] ?? "21:00"}
                        onChange={(e) =>
                          setHours((prev) => ({ ...prev, [d]: `${parts?.[0] ?? "09:00"}-${e.target.value}` }))
                        }
                        className="rounded-lg border border-linemed bg-white px-2 py-1.5 text-sm"
                        aria-label={`${DAY_LABEL[d]} close time`}
                      />
                    </>
                  ) : (
                    <span className="text-sm text-mute">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Announcement */}
        <Card title="Announcement Banner" save={() => void saveAnnounce()} dirty={announceDirty || busy === "announce"}>
          <div className="space-y-3">
            <textarea
              className={inputCls + " min-h-16 resize-none font-gu"}
              lang="gu"
              value={form.announcement ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, announcement: e.target.value.slice(0, 200) }))}
              placeholder="e.g. 🎉 દિવાળીના ઓર્ડર ખુલ્લા છે! ગિફ્ટ બોક્સ આગળ-થી બુક કરો."
            />
            <Switch
              on={!!form.announcementActive}
              onToggle={() => setForm((f) => ({ ...f, announcementActive: !f.announcementActive }))}
              label="Show on storefront"
            />
          </div>
        </Card>

        {/* Categories */}
        <Card title="Categories">
          <ul className="divide-y divide-line">
            {categories.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">
                    {c.name}{" "}
                    {c.nameGu && (
                      <span className="font-gu text-sm font-medium text-ink2" lang="gu">
                        ({c.nameGu})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-mute">{c._count?.products ?? 0} items</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void reorder(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink2 transition hover:bg-warm disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => void reorder(i, 1)}
                    disabled={i === categories.length - 1}
                    aria-label="Move down"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink2 transition hover:bg-warm disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => void catAction(c.id, { isActive: !c.isActive }, c.isActive ? `"${c.name}" hidden` : `"${c.name}" visible`)}
                    aria-label="Toggle active"
                    title={c.isActive ? "Hide from menu" : "Show in menu"}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg border transition",
                      c.isActive ? "border-line text-ink2 hover:bg-warm" : "border-warn bg-warn/10 text-warn"
                    )}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => void deleteCategory(c)}
                    aria-label={`Delete ${c.name}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink2 transition hover:border-bad hover:text-bad"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl bg-cream p-4">
            <div className="min-w-20">
              <label className="mb-1 block text-xs font-bold text-ink2">Icon</label>
              <input className={inputCls} value={newCat.icon} onChange={(e) => setNewCat((n) => ({ ...n, icon: e.target.value.slice(0, 4) }))} />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold text-ink2">Name (English)</label>
              <input className={inputCls} value={newCat.name} onChange={(e) => setNewCat((n) => ({ ...n, name: e.target.value }))} />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold text-ink2">Name (Gujarati)</label>
              <input className={inputCls + " font-gu"} lang="gu" value={newCat.nameGu} onChange={(e) => setNewCat((n) => ({ ...n, nameGu: e.target.value }))} />
            </div>
            <button onClick={() => void addCategory()} className="btn-press rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-cocoa">
              + Add
            </button>
          </div>
          <p className="mt-2 text-xs text-mute">
            Renaming inline isn&apos;t available — use the ✎ toggle to hide a category, or delete and re-add it with a new name. Deleting a category with items is blocked.
          </p>
        </Card>

        {/* Password */}
        <Card title="Change Password">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Current</label>
              <input type="password" className={inputCls} value={pass.current} onChange={(e) => setPass((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">New</label>
              <input type="password" className={inputCls} value={pass.next} onChange={(e) => setPass((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Confirm</label>
              <input type="password" className={inputCls} value={pass.confirm} onChange={(e) => setPass((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
            </div>
          </div>
          <button
            onClick={() => void changePassword()}
            disabled={busy === "pass"}
            className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-extrabold text-white transition hover:brightness-125 disabled:opacity-60"
          >
            {busy === "pass" ? "Updating…" : "Change Password"}
          </button>
        </Card>
      </div>
    </div>
  );
}
