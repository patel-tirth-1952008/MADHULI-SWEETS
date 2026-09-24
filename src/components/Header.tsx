"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore, selectCount } from "@/store/cartStore";
import { useLangStore } from "@/store/langStore";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "nav.home" },
  { href: "/menu", key: "nav.menu" },
  { href: "/my-orders", key: "nav.orders", fallbackEn: "My Orders", fallbackGu: "મારા ઓર્ડર" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const count = useCartStore(selectCount);
  const bump = useCartStore((s) => s.bump);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  const onCart = () => {
    if (window.innerWidth >= 1024) setCartOpen(true);
    else router.push("/cart");
  };

  const labelFor = (n: (typeof NAV)[number]) => {
    const translated = t(n.key);
    // If i18n key is missing, use fallback so the button never disappears
    if (translated === n.key) {
      return lang === "gu" ? (n.fallbackGu ?? n.key) : (n.fallbackEn ?? n.key);
    }
    return translated;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-jalebi shadow-warm">
            <span className="font-gu text-lg font-bold text-cocoa" lang="gu">
              મા
            </span>
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-bold text-ink sm:text-lg">
              Madhuli <span className="text-golddark">Namkeen &amp; Sweets</span>
            </span>
            <span className="hidden font-gu text-[11px] text-ink2 sm:block" lang="gu">
              માધુલી નમકીન એન્ડ સ્વીટ્સ • નિકોલ, અમદાવાદ
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-warm text-deepgold" : "text-ink2 hover:bg-cream hover:text-ink"
                )}
              >
                {labelFor(n)}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div
            className="flex items-center rounded-full border border-linemed bg-cream p-0.5"
            role="group"
            aria-label="Language"
          >
            <button
              onClick={() => setLang("en")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold transition",
                lang === "en" ? "bg-gold text-cocoa" : "text-ink2"
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLang("gu")}
              className={cn(
                "rounded-full px-2.5 py-1 font-gu text-xs font-bold transition",
                lang === "gu" ? "bg-gold text-cocoa" : "text-ink2"
              )}
            >
              ગુજ
            </button>
          </div>

          {/* Cart */}
          <button
            onClick={onCart}
            aria-label={t("cart.title")}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-linemed bg-white transition hover:border-gold hover:bg-warm"
          >
            <ShoppingBag size={18} className="text-ink" />
            {count > 0 && (
              <motion.span
                key={bump}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 16 }}
                className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-extrabold text-cocoa"
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}