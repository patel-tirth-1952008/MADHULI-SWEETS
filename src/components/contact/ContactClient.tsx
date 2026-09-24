"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Phone, Send } from "lucide-react";
import { shopChatLink } from "@/lib/whatsapp";
import { useT } from "@/i18n";

const inputCls =
  "w-full rounded-xl border border-linemed bg-white px-4 py-3 text-sm text-ink placeholder:text-mute";

export default function ContactClient() {
  const t = useT();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Please enter your name");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error("Enter a valid 10-digit mobile number");
    if (form.message.trim().length < 5) return toast.error("Message is a little short");
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not send — please call us instead");
        return;
      }
      if (data.delivered) {
        toast.success("Message sent! We'll get back to you soon 🙏");
      } else {
        toast(data.note ?? "Noted — for a faster reply, call or WhatsApp us.", {
          icon: "📞",
          duration: 5000,
        });
      }
      setForm({ name: "", phone: "", message: "" });
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-5 py-10 lg:py-14">
      {/* Map */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-linemed shadow-card lg:px-0">
        <iframe
          title="Madhuli Namkeen & Sweets on the map"
          src="https://www.google.com/maps?q=23.0744,72.6788&z=16&output=embed"
          className="h-[300px] w-full sm:h-[400px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        {/* Info */}
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">
            {t("nav.contact")}{" "}
            <span className="font-gu text-2xl text-ink2" lang="gu">
              — સંપર્ક
            </span>
          </h1>
          <p className="mt-3 max-w-md text-ink2">
            For a quick order, WhatsApp is fastest. For anything else, the phone is always on
            during shop hours.
          </p>
          <div className="mt-7 space-y-5 text-[15px] text-ink2">
            <p className="flex gap-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-golddark" />
              Shop No. 17-18, Ishwar Icon, near Jivan Twins Bungalow, opposite Ishwar
              Bungalows, Nikol Gam, Ahmedabad, Gujarat 382350
            </p>
            <div className="flex gap-3">
              <Phone size={20} className="mt-0.5 shrink-0 text-golddark" />
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold text-deepgold">
                <a href="tel:+919924122746" className="hover:underline">
                  +91 99241 22746
                </a>
                <a href="tel:+919723910062" className="hover:underline">
                  +91 97239 10062
                </a>
                <a href="tel:+917284839843" className="hover:underline">
                  +91 72848 39843
                </a>
              </div>
            </div>
          </div>
          <a
            href={shopChatLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-extrabold text-white shadow-card transition hover:brightness-105"
          >
            💬 Chat on WhatsApp
          </a>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="h-fit rounded-2xl border border-line bg-white p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold text-ink">Send us a message</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Name</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Phone</label>
              <input
                className={inputCls}
                value={form.phone}
                inputMode="numeric"
                maxLength={10}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                placeholder="10-digit mobile"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Message</label>
              <textarea
                className={inputCls + " min-h-28 resize-none"}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value.slice(0, 600) }))}
                placeholder="Bulk order, gift box, question…"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-press flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-extrabold text-cocoa disabled:opacity-70"
            >
              {busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-cocoa/30 border-t-cocoa" />
              ) : (
                <Send size={15} />
              )}
              {busy ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
