"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, MapPin, Phone, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Category, Product, Settings } from "@/types";
import ProductCard from "@/components/ProductCard";
import { BrandSpinner, PrimaryButton } from "@/components/ui";
import { hoursLabel } from "@/lib/utils";
import { useT } from "@/i18n";
import TrustBadges from "@/components/TrustBadges";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
  loading: () => <BrandSpinner label="થાળી તૈયાર થઈ રહી છે… 🍥" />,
});

function TiltCard({ cat, count }: { cat: Category; count: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const t = useT();
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <Link
      ref={ref}
      href={`/menu?category=${cat.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: "transform .18s ease, box-shadow .25s ease" }}
      className="group block rounded-2xl bg-gradient-to-br from-warm to-ysoft p-6 shadow-card ring-1 ring-linemed hover:shadow-elevated"
    >
      <div className="text-5xl transition-transform duration-300 group-hover:scale-110">{cat.icon}</div>
      <h3 className="mt-4 font-gu text-2xl font-bold text-ink" lang="gu">
        {cat.nameGu ?? cat.name}
      </h3>
      <p className="font-display text-lg font-semibold text-golddark">{cat.name}</p>
      <p className="mt-2 text-sm font-medium text-ink2">
        {count} {count === 1 ? t("cat.item") : t("cat.items")}
      </p>
    </Link>
  );
}

export default function HomeClient({
  categories: initialCategories,
  bestsellers: initialBestsellers,
  settings: initialSettings,
}: {
  categories?: Category[];
  bestsellers?: Product[];
  settings?: Settings | null;
}) {
  const t = useT();
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [bestsellers, setBestsellers] = useState<Product[]>(initialBestsellers ?? []);
  const [settings, setSettings] = useState<Settings | null>(
    initialSettings === undefined ? null : initialSettings
  );
  const [loaded, setLoaded] = useState(initialCategories !== undefined);
  const rowRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fallback fetch for client-only contexts (e.g. when the page was loaded
  // without server props). The normal path is fully server-rendered.
  useLayoutEffect(() => {
    if (initialCategories !== undefined) return;
    Promise.all([
      fetch("/api/categories").then((r) => (r.ok ? r.json() : { categories: [] })),
      fetch("/api/products?bestseller=true&limit=6").then((r) => (r.ok ? r.json() : { products: [] })),
      fetch("/api/settings").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([c, p, s]) => {
        setCategories(c.categories ?? []);
        setBestsellers(p.products ?? []);
        setSettings(s);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [initialCategories]);

  // GSAP scroll reveals
  useLayoutEffect(() => {
    if (!loaded) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, [loaded]);

  const hours = settings ? hoursLabel(settings.operatingHours) : [];
  const scrollRow = (dir: number) => rowRef.current?.scrollBy({ left: dir * 290, behavior: "smooth" });

  return (
    <div ref={rootRef}>
      {/* ─────────────── 3D HERO ─────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-warm to-ysoft">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-jalebi/10 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-5 pb-14 pt-20 lg:grid-cols-2 lg:gap-10 lg:px-8">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-deepgold shadow-card ring-1 ring-line">
              <span className="h-2 w-2 rounded-full bg-ok" />
              {t("hero.badge")} · Nikol, Ahmedabad
            </p>
            <h1 className="font-gu text-5xl font-bold leading-tight text-ink sm:text-6xl" lang="gu">
              માધુલી
            </h1>
            <p className="mt-1 font-display text-2xl font-semibold text-golddark sm:text-3xl" lang="gu">
              નમકીન એન્ડ સ્વીટ્સ
            </p>
            <p className="mt-2 text-lg font-medium tracking-wide text-ink2">
              Madhuli Namkeen &amp; Sweets
            </p>
            <p className="mt-3 font-display text-xl italic text-ink">“{t("hero.tagline")}”</p>
            <p className="mt-2 text-sm font-semibold text-deepgold">{t("hero.fresh")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="btn-press rounded-full bg-gold px-8 py-3.5 text-base font-bold text-cocoa"
              >
                🛒 {t("hero.order")} →
              </Link>
              <a
                href="#location"
                className="rounded-full border-2 border-linemed bg-white px-8 py-3.5 text-base font-semibold text-ink transition hover:border-gold hover:bg-warm"
              >
                📍 {t("hero.visit")}
              </a>
            </div>
          </div>
          <div className="h-[300px] sm:h-[420px] lg:h-[560px]">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* ─────────────── TRUST BADGES ─────────────── */}
      <section className="border-y border-line bg-white py-8">
        <TrustBadges />
      </section>

      {/* ─────────────── CATEGORIES ─────────────── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t("cat.title")}</h2>
              <p className="mt-2 max-w-xl text-ink2">{t("cat.sub")}</p>
            </div>
            <Link href="/menu" className="font-semibold text-deepgold hover:underline">
              Full menu →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4" data-reveal>
            {categories.map((c) => (
              <TiltCard key={c.id} cat={c} count={c._count?.products ?? 0} />
            ))}
            {loaded && categories.length === 0 && (
              <p className="col-span-2 text-sm text-mute lg:col-span-4">Loading categories…</p>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────── BESTSELLERS ─────────────── */}
      <section className="bg-cream py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-end justify-between gap-4" data-reveal>
            <div>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t("best.title")}</h2>
              <p className="mt-2 text-ink2">{t("best.sub")}</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                onClick={() => scrollRow(-1)}
                aria-label="Scroll left"
                className="grid h-10 w-10 place-items-center rounded-full border border-linemed bg-white text-ink2 transition hover:border-gold hover:bg-warm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollRow(1)}
                aria-label="Scroll right"
                className="grid h-10 w-10 place-items-center rounded-full border border-linemed bg-white text-ink2 transition hover:border-gold hover:bg-warm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div
            ref={rowRef}
            className="no-scrollbar -mx-5 mt-8 flex snap-x gap-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0"
          >
            {bestsellers.map((p) => (
              <div key={p.id} className="w-[250px] shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── ABOUT TEASER ─────────────── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-5 py-16 lg:grid-cols-[1fr_1.35fr] lg:gap-12 lg:px-8 lg:py-24">
          <div
            data-reveal
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-jalebi via-gold to-golddark p-10 shadow-warm"
          >
            <span className="absolute -right-6 -top-6 text-[110px] opacity-20" aria-hidden>
              🍬
            </span>
            <span className="absolute -bottom-8 -left-8 text-[130px] opacity-20" aria-hidden>
              🥜
            </span>
            <span className="mb-4 text-4xl" aria-hidden>
              ❝
            </span>
            <p className="text-center font-gu text-3xl font-bold leading-relaxed text-cocoa sm:text-4xl" lang="gu">
              પરંપરાગત સ્વાદ,
              <br />
              ઘરનો પ્રેમ
            </p>
            <p className="mt-4 font-display text-lg italic text-cocoa/80">
              “{t("aboutTeaser.quoteEn")}”
            </p>
          </div>
          <div data-reveal>
            <h2 className="font-display text-3xl font-bold leading-snug text-ink sm:text-4xl">
              {t("aboutTeaser.title")}
            </h2>
            <p className="mt-5 leading-relaxed text-ink2">
              It started with three recipes Madhuli&apos;s nani measured by hand — jalebi, besan
              ladoo and sev gathiya — in a kitchen where the scale was an old brass pan and the
              recipe was memory. No shortcuts, no palm oil, no freezer.
            </p>
            <p className="mt-4 leading-relaxed text-ink2">
              Today that same kitchen sits behind the counter at Ishwar Icon, Nikol. The tawa comes
              out before sunrise, the peanut oil is filtered every week, and every ladoo is still
              rolled the way the first one was.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 font-bold text-deepgold transition-all hover:gap-3.5"
            >
              {t("aboutTeaser.cta")} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── LOCATION ─────────────── */}
      <section id="location" className="bg-cream py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-2 lg:px-8">
          <div data-reveal className="overflow-hidden rounded-2xl border border-linemed bg-white shadow-card">
            <iframe
              title="Madhuli Namkeen & Sweets on the map"
              src="https://www.google.com/maps?q=23.0744,72.6788&z=16&output=embed"
              className="h-[360px] w-full lg:h-full lg:min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div data-reveal>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              {t("location.title")}
            </h2>
            <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-ink2">
              <p className="flex gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0 text-golddark" />
                Shop No. 17-18, Ishwar Icon, near Jivan Twins Bungalow, opposite Ishwar
                Bungalows, Nikol Gam, Nikol, Ahmedabad, Gujarat 382350
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
              <div className="flex gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-golddark" />
                <div>
                  <p className="font-semibold text-ink">{t("location.hours")}</p>
                  <ul className="mt-1 space-y-0.5">
                    {(hours.length ? hours : ["Mon – Sat: 9:00 AM – 9:00 PM", "Sunday: 10:00 AM – 6:00 PM"]).map(
                      (h) => (
                        <li key={h}>{h}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=23.0744,72.6788"
              target="_blank"
              rel="noreferrer"
              className="btn-press mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-bold text-cocoa"
            >
              <ExternalLink size={15} /> {t("location.directions")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
