"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import type { Order, OrderStatus } from "@/types";
import { ORDER_FLOW } from "@/types";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const STEP_ICON: Record<string, string> = {
  pending: "📝",
  confirmed: "✅",
  preparing: "🔥",
  out_for_delivery: "🛵",
  delivered: "",
};

const STEP_KEY: Record<string, string> = {
  pending: "track.placed",
  confirmed: "track.confirmed",
  preparing: "track.preparing",
  out_for_delivery: "track.out",
  delivered: "track.delivered",
};

export default function OrderTimeline({ order }: { order: Order }) {
  const t = useT();
  const cancelled = order.status === "cancelled";
  const currentIdx = cancelled ? -1 : ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]);

  const timeFor = (s: OrderStatus) => {
    const entry = order.statusHistory.find((h) => h.status === s);
    return entry ? format(new Date(entry.time), "h:mm a") : null;
  };

  return (
    <ol className="relative">
      {ORDER_FLOW.map((s, i) => {
        const done = !cancelled && i < currentIdx;
        const current = !cancelled && i === currentIdx;
        return (
          <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
            {i < ORDER_FLOW.length - 1 && (
              <span
                className={cn(
                  "absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5",
                  done ? "bg-ok" : "bg-line"
                )}
                aria-hidden
              />
            )}
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
              className={cn(
                "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-base",
                done && "bg-ok text-white",
                current && "bg-gold text-cocoa shadow-warm pulse-dot",
                (!done && !current) && "border-2 border-linemed bg-white text-mute"
              )}
            >
              {done ? "✓" : STEP_ICON[s]}
            </motion.span>
            <div className="pt-1.5">
              <p
                className={cn(
                  "text-sm font-bold",
                  done || current ? "text-ink" : "text-mute"
                )}
              >
                {t(STEP_KEY[s])}
              </p>
              {timeFor(s) && <p className="mt-0.5 text-xs text-mute">{timeFor(s)}</p>}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <motion.li
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-3 rounded-xl bg-bad/10 px-4 py-3"
        >
          <span className="text-xl">❌</span>
          <div>
            <p className="text-sm font-bold text-bad">{t("track.cancelled")}</p>
            <p className="text-xs text-ink2">
              {timeFor("cancelled") &&
                format(new Date(timeFor("cancelled") as unknown as Date), "h:mm a d MMM")}{" "}
              — sorry! Call us if this was a mistake.
            </p>
          </div>
        </motion.li>
      )}
    </ol>
  );
}
