"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Lenis from "lenis";
import { useCartStore } from "@/store/cartStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const cartOpen = useCartStore((s) => s.cartOpen);

  // Dynamically manage Lenis lifecycle based on cart drawer state
  useEffect(() => {
    // Admin routes do not use Lenis
    if (window.location.pathname.startsWith("/admin")) return;

    // When cart drawer is open, lock body scroll and pause Lenis completely
    if (cartOpen) {
      document.body.style.overflow = "hidden";
      return;
    }

    // Restore normal body overflow and start Lenis for storefront
    document.body.style.overflow = "";
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const target = document.querySelector(anchor.getAttribute("href") ?? "");
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -72 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [cartOpen]);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: "#FFFDF7",
            color: "#1C1917",
            border: "1px solid #E8DFC9",
            borderRadius: "14px",
            fontSize: "14px",
            boxShadow: "0 8px 30px rgba(28,25,23,.12)",
          },
          iconTheme: { primary: "#EAB308", secondary: "#1C1917" },
        }}
      />
    </>
  );
}