"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/** Branded loader — a spinning jalebi inside a warm ring. Never a generic spinner. */
export function BrandSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <div className="relative h-12 w-12">
        <div
          className="absolute inset-0 animate-spin rounded-full border-4 border-ysoft border-t-gold"
          style={{ animationDuration: "0.9s" }}
        />
        <div className="absolute inset-0 grid place-items-center text-xl">🍥</div>
      </div>
      {label && <p className="font-gu text-sm text-ink2">{label}</p>}
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  sub,
  children,
}: {
  emoji: string;
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-linemed bg-cream px-6 py-16 text-center">
      <div className="mb-4 text-6xl">{emoji}</div>
      <h3 className="font-gu text-xl font-semibold text-ink" lang={/[\u0A80-\u0AFF]/.test(title) ? "gu" : undefined}>
        {title}
      </h3>
      {sub && <p className="mt-1.5 max-w-sm text-sm text-ink2">{sub}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

/** Golden particle burst — Canvas 2D, ~30 warm particles fading over 1s. */
export function BurstParticles({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!active || fired.current) return;
    fired.current = true;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const colors = ["#FACC15", "#EAB308", "#F59E0B", "#FDE68A"];
    const parts = Array.from({ length: 30 }, () => {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.5,
        r: 2 + Math.random() * 3,
        c: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      };
    });
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const el = (now - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of parts) {
        p.life = 1 - el;
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive && el < 1.2) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0" />;
}

/** Easter egg: replay the opening door (footer 🚪). */
export function DoorReplayButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      title="Replay the door 🚪"
      aria-label="Replay the opening door animation"
      onClick={() => {
        window.localStorage.removeItem("madhuli_door_shown");
        window.location.href = "/";
      }}
      className={
        "grid h-9 w-9 place-items-center rounded-full border border-linemed bg-white text-lg transition hover:scale-110 hover:border-gold " +
        className
      }
    >
      🚪
    </button>
  );
}

export function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`btn-press inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-cocoa ${className}`}
    >
      {children}
    </Link>
  );
}
