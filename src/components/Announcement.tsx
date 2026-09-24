"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Settings } from "@/types";
import { useT } from "@/i18n";

/** Shop announcement + "we're closed today" banner (from Settings). */
export default function Announcement() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hidden, setHidden] = useState(false);
  const t = useT();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSettings(d ?? null))
      .catch(() => {});
  }, []);

  const showAnnounce = settings?.announcementActive && settings?.announcement;
  const showClosed = !settings?.isOpen;

  return (
    <AnimatePresence>
      {(showAnnounce || showClosed) && !hidden && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={
            showClosed
              ? "overflow-hidden bg-warn/15 text-[#92400e]"
              : "overflow-hidden bg-ysoft text-cocoa"
          }
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 text-center text-sm font-semibold">
            {showClosed ? (
              <span className="font-gu" lang="gu">
                {t("banner.closed")}
              </span>
            ) : (
              <span className="font-gu" lang="gu">
                {settings.announcement}
              </span>
            )}
            <button
              onClick={() => setHidden(true)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 transition hover:bg-white/60"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
