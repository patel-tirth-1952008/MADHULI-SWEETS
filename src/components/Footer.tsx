import Link from "next/link";
import { DoorReplayButton } from "./ui";
import { hoursLabel } from "@/lib/utils";

const HOURS = hoursLabel(
  JSON.stringify({
    mon: "09:00-21:00",
    tue: "09:00-21:00",
    wed: "09:00-21:00",
    thu: "09:00-21:00",
    fri: "09:00-21:00",
    sat: "09:00-21:00",
    sun: "10:00-18:00",
  })
);

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-linemed bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1.3fr] md:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-jalebi shadow-warm">
              <span className="font-gu text-xl font-bold text-cocoa" lang="gu">
                મા
              </span>
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-ink">
                Madhuli Namkeen &amp; Sweets
              </p>
              <p className="font-gu text-sm text-ink2" lang="gu">
                માધુલી નમકીન એન્ડ સ્વીટ્સ
              </p>
            </div>
          </div>
          <p className="mt-4 font-display text-lg italic text-deepgold">
            “Our Quality is Our Speciality”
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink2">
            Every morning the tawa comes out before the first chai order — that is the whole
            promise.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-linemed bg-white px-4 py-1.5 text-xs font-semibold text-ink2">
            🛵 Also available on Swiggy
          </span>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-mute">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/", label: "Home" },
              { href: "/menu", label: "Menu" },
              { href: "/my-orders", label: "My Orders" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/admin", label: "Admin" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink2 transition-colors hover:text-deepgold">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://www.instagram.com/madhulinamkeen_sweets2022"
                target="_blank"
                rel="noreferrer"
                className="text-ink2 transition-colors hover:text-deepgold"
              >
                Instagram @madhulinamkeen_sweets2022
              </a>
            </li>
          </ul>
        </div>

        {/* Visit */}
        <div className="md:pl-8">
          <h4 className="text-xs font-bold uppercase tracking-widest text-mute">Visit the Shop</h4>
          <p className="mt-4 text-sm leading-relaxed text-ink2">
            Shop No. 17-18, Ishwar Icon,
            <br />
            near Jivan Twins Bungalow, opposite Ishwar Bungalows,
            <br />
            Nikol Gam, Ahmedabad, Gujarat 382350
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-deepgold">
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
          <ul className="mt-3 space-y-1 text-sm text-ink2">
            {HOURS.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <DoorReplayButton />
            <span className="text-xs text-mute">Replay the door? Always. 🙏</span>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-mute sm:flex-row md:px-8">
          <p>© 2025 Madhuli Namkeen &amp; Sweets. All rights reserved.</p>
          <p className="font-gu" lang="gu">
            નિકોલ, અમદાવાદમાં પ્રેમથી બનેલું
          </p>
        </div>
      </div>
    </footer>
  );
}