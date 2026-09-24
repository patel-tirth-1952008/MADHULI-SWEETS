"use client";

import { motion } from "framer-motion";
import { useT } from "@/i18n";

const BADGES = [
  { emoji: "🥜", key: "trust.oil" },
  { emoji: "🏠", key: "trust.fresh" },
  { emoji: "🚚", key: "trust.delivery" },
  { emoji: "⭐", key: "trust.swiggy" },
  { emoji: "👩", key: "trust.woman" },
];

export default function TrustBadges() {
  const t = useT();
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-1 lg:mx-0 lg:justify-center lg:px-0">
        {BADGES.map((b, i) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            whileHover={{ rotate: -2, y: -4 }}
            className="flex shrink-0 snap-start items-center gap-3 rounded-xl bg-warm px-5 py-4 shadow-warm ring-1 ring-line"
          >
            <span className="text-2xl" aria-hidden>
              {b.emoji}
            </span>
            <span className="whitespace-nowrap text-sm font-bold text-ink">{t(b.key)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
