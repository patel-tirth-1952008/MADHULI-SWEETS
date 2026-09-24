"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BurstParticles } from "./ui";

const DOOR_KEY = "madhuli_door_shown";
const SWING_EASE = [0.22, 1, 0.36, 1] as const;

function Toran() {
  const leaves = Array.from({ length: 15 });
  return (
    <div className="door-arch" aria-hidden>
      <div className="arch-band" />
      {leaves.map((_, i) => {
        const t = i / 14;
        const drop = Math.sin(t * Math.PI) * 22;
        return (
          <span
            key={i}
            className="flex flex-col items-center"
            style={{ transform: `translateY(${drop}px)` }}
          >
            <span
              className="toran-leaf"
              style={{ transform: `rotate(${i % 2 === 0 ? -14 : 14}deg)` }}
            />
            {i % 3 === 1 && <span className="toran-flower" />}
          </span>
        );
      })}
    </div>
  );
}

function DoorText({ side }: { side: "left" | "right" }) {
  return (
    <div className="door-text">
      <div className="font-gu text-[clamp(26px,7vw,42px)] font-bold leading-snug" lang="gu">
        કેમ છે મારા વાલા
      </div>
      <div className="mt-3 font-gu text-[clamp(12px,3vw,16px)] tracking-wide opacity-90" lang="gu">
        માધુલી નમકીન એન્ડ સ્વીટ્સ
      </div>
    </div>
  );
}

export default function DoorAnimation() {
  const [phase, setPhase] = useState<"idle" | "closed" | "opening" | "done">("idle");
  const [isMobile, setIsMobile] = useState(false);
  const opened = useRef(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    setPhase(window.localStorage.getItem(DOOR_KEY) ? "done" : "closed");
  }, []);

  // Blur the storefront behind the closed door; release while it opens
  useEffect(() => {
    const body = document.body;
    if (phase === "closed") body.classList.add("door-closed");
    else body.classList.remove("door-closed");
    if (phase === "opening") body.classList.add("door-open");
    else body.classList.remove("door-open");
    return () => body.classList.remove("door-closed", "door-open");
  }, [phase]);

  const beginOpen = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    setPhase("opening");
    window.setTimeout(() => {
      window.localStorage.setItem(DOOR_KEY, "true");
      setPhase("done");
    }, 1350);
  }, []);

  // 2.5s auto-open, or open on any tap/click
  useEffect(() => {
    if (phase !== "closed") return;
    const t = window.setTimeout(beginOpen, 2500);
    window.addEventListener("click", beginOpen);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("click", beginOpen);
    };
  }, [phase, beginOpen]);

  if (phase === "idle" || phase === "done") return null;
  const opening = phase === "opening";

  return (
    <AnimatePresence>
      <motion.div
        key="door"
        className="door-overlay"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
        onClick={beginOpen}
        role="presentation"
      >
        <BurstParticles active={opening} />
        <div className="door-stage">
          <div className="door-glow" aria-hidden />
          {isMobile ? (
            /* Mobile: a single shutter rolling up */
            <div className="door-frame" style={{ height: "min(64vh, 560px)" }}>
              <Toran />
              <motion.div
                className="shutter-panel"
                initial={{ y: "0%" }}
                animate={opening ? { y: "-100%" } : { y: "0%" }}
                transition={{ duration: 1.2, ease: SWING_EASE }}
              >
                <div className="absolute left-0 right-0 top-[30%] text-center text-[#FFF6DC]" style={{ textShadow: "0 2px 10px rgba(40,18,4,.55)" }}>
                  <div className="font-gu text-3xl font-bold" lang="gu">કેમ છે મારા વાલા</div>
                  <div className="mt-2 font-gu text-sm tracking-wide opacity-90" lang="gu">
                    માધુલી નમકીન એન્ડ સ્વીટ્સ
                  </div>
                </div>
                <div className="shutter-rail" />
              </motion.div>
            </div>
          ) : (
            /* Desktop: haveli double doors swinging open */
            <div className="door-frame">
              <Toran />
              <motion.div
                className="door-half door-left"
                initial={{ rotateY: 0 }}
                animate={opening ? { rotateY: -110 } : { rotateY: 0 }}
                transition={{ duration: 1.2, ease: SWING_EASE }}
              >
                <DoorText side="left" />
                <div className="door-panel" style={{ top: "10%", height: "32%" }} />
                <div className="door-panel" style={{ top: "50%", height: "40%" }} />
                <div className="door-handle" />
              </motion.div>
              <motion.div
                className="door-half door-right"
                initial={{ rotateY: 0 }}
                animate={opening ? { rotateY: 110 } : { rotateY: 0 }}
                transition={{ duration: 1.2, ease: SWING_EASE }}
              >
                <DoorText side="right" />
                <div className="door-panel" style={{ top: "10%", height: "32%" }} />
                <div className="door-panel" style={{ top: "50%", height: "40%" }} />
                <div className="door-handle" />
              </motion.div>
              <div className="door-threshold" />
            </div>
          )}
        </div>
        {!opening && (
          <p className="door-hint">
            <span className="font-gu" lang="gu">
              દરવાજો ખોલવા ટૅપ કરો
            </span>{" "}
            · Tap anywhere to enter
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
