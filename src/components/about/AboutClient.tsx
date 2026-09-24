"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Testimonial } from "@/types";
import { useT } from "@/i18n";
import { useLangStore } from "@/store/langStore";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { emoji: "🥜", title: "Pure ingredients", text: "We source fresh gram flour, pure ghee and good kesar — and refuse anything with palm oil." },
  { emoji: "👩‍", title: "Hand-prepared", text: "Every ladoo is rolled, every khandvi ribbon twisted by hand. The machines are the wooden ones." },
  { emoji: "🔥", title: "Cooked fresh, every morning", text: "The tawa comes out before sunrise, so your jalebi reaches you springy, not soggy." },
  { emoji: "📦", title: "Packed with care", text: "Sealed the same hour it is made, delivered within your slot — no freezer, no preservatives." },
];

const GALLERY = [
  { emoji: "🍥", label: "Jalebi at dawn" },
  { emoji: "🍬", label: "Kaju katli with varq" },
  { emoji: "🍮", label: "Gulab jamun, syrup hot" },
  { emoji: "🥨", label: "Sev gathiya, first batch" },
  { emoji: "🍘", label: "Khaman, just steamed" },
  { emoji: "🎁", label: "Festival gift boxes" },
];

export default function AboutClient() {
  const t = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => (r.ok ? r.json() : { testimonials: [] }))
      .then((d) => setTestimonials(d.testimonials ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useLayoutEffect(() => {
    if (!loaded) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".process-step",
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".process-grid", start: "top 82%" },
        }
      );
      gsap.fromTo(
        "[data-reveal]",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: "section", start: "top 88%" },
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, [loaded]);

  const lang = useLang();

  return (
    <div ref={rootRef}>
      {/* Hero */}
      <section className="bg-gradient-to-b from-warm to-ysoft px-5 py-20 text-center lg:py-28">
        <p className="font-gu text-lg font-semibold text-deepgold" lang="gu">
          નિકોલ, અમદાવાદ • 2022 થી
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl font-gu text-5xl font-bold leading-tight text-ink sm:text-6xl" lang="gu">
          માધુલી નમકીન એન્ડ સ્વીટ્સ
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-display text-xl italic text-ink2">
          “Our Quality is Our Speciality”
        </p>
      </section>

      {/* Story */}
      <section className="bg-white px-5 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <div data-reveal>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              Three recipes. One promise.
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-ink2">
              <p>
                Madhuli started this shop in 2022 with three recipes her nani measured by hand —
                jalebi, besan ladoo and sev gathiya. The scale was an old brass pan; the recipe
                was memory; the oil was always, without exception, pure peanut oil.
              </p>
              <p>
                What the neighbourhood noticed first was consistency. The jalebi that was springy
                on a Monday was springy on a Friday. The kaju katli never tasted like a different
                week. That is not magic — it is simply doing the same careful thing every single
                morning, in a kitchen that smells of ghee and kesar from before sunrise.
              </p>
              <p>
                Today the shop at Ishwar Icon is run by one woman and a small team she treats like
                family. The recipes are still the same. The tawa still comes out before the first
                chai order. If a batch is not right, it does not go out — that is the whole
                quality system.
              </p>
            </div>
          </div>
          <div data-reveal className="flex flex-col justify-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-jalebi to-golddark p-8 shadow-warm">
              <p className="font-gu text-2xl font-bold leading-relaxed text-cocoa" lang="gu">
                “જે બેચ ઠીક નથી, તે બહાર નથી જતી. આ જ અમારું કવોલિટી સિસ્ટમ છે.”
              </p>
              <p className="mt-3 text-sm font-semibold text-cocoa/80">
                — “If a batch is not right, it does not leave. That is our whole quality system.”
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-cream p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-mute">The promise</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-ink">
                100% pure peanut oil. No palm oil, no vanaspati, no shortcuts, no freezer.
              </p>
              <p className="mt-2 text-sm text-ink2">
                If the label doesn&apos;t say peanut oil, we don&apos;t fry it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-cream px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl lg:px-8">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl" data-reveal>
            From our kitchen to your thali
          </h2>
          <div className="process-grid mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="process-step rounded-2xl border border-line bg-white p-6 shadow-card"
              >
                <span className="text-4xl">{s.emoji}</span>
                <p className="mt-3 text-xs font-extrabold tracking-widest text-golddark">
                  STEP {i + 1}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold text-ink" data-reveal>
            From the counter
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" data-reveal>
            {GALLERY.map((g) => (
              <div
                key={g.label}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-warm to-ysoft ring-1 ring-linemed"
              >
                <span className="text-5xl">{g.emoji}</span>
                <span className="px-2 text-center text-xs font-semibold text-ink2">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl lg:px-8">
          <h2 className="font-display text-3xl font-bold text-ink" data-reveal>
            What the neighbourhood says
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(testimonials.length
              ? testimonials
              : [
                  { id: "1", name: "Rameshbhai Patel, Nikol", text: "My whole family eats Madhuli's jalebi every Sunday. Always fresh, never oily.", textGu: "રવિવારે આખું પરિવાર માધુલીની જલેબી ખાવાનું પસંદ કરે છે.", rating: 5 },
                  { id: "2", name: "Hetal Mistry, Bopal", text: "Ordered Diwali gift boxes for my office. Everyone asked where they came from.", textGu: "ઓફિસ માટે દિવાળીના ગિફ્ટ બોક્સ ઓર્ડર કર્યા હતા.", rating: 5 },
                  { id: "3", name: "Kunverbhai Shah, Aslaliya", text: "Their khaman tastes like my nani's. You can tell it is made at home.", textGu: "તેમનું ખમણ મારી નાનીમાતા જેવું લાગે છે.", rating: 5 },
                ]
            ).map((tm) => (
              <figure
                key={tm.id}
                className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card"
              >
                <div className="text-sm text-golddark" aria-label={`${tm.rating} stars`}>
                  {"★".repeat(tm.rating)}
                </div>
                <blockquote
                  className={
                    "mt-3 flex-1 text-sm leading-relaxed text-ink2 " +
                    (lang === "gu" && tm.textGu ? "font-gu" : "")
                  }
                  lang={lang === "gu" && tm.textGu ? "gu" : undefined}
                >
                  “{lang === "gu" && tm.textGu ? tm.textGu : tm.text}”
                </blockquote>
                <figcaption className="mt-4 text-sm font-bold text-ink">{tm.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-white px-5 pb-20">
        <div
          data-reveal
          className="mx-auto flex max-w-7xl flex-col items-center gap-4 rounded-3xl bg-gradient-to-r from-jalebi via-gold to-golddark px-8 py-12 text-center shadow-warm"
        >
          <p className="font-gu text-2xl font-bold text-cocoa" lang="gu">
            આજે શું ખાશ, વાલા?
          </p>
          <a
            href="/menu"
            className="btn-press rounded-full bg-white px-8 py-3.5 text-base font-extrabold text-golddark"
          >
            {t("hero.order")} →
          </a>
        </div>
      </section>
    </div>
  );
}

function useLang() {
  return useLangStore((s) => s.lang);
}
