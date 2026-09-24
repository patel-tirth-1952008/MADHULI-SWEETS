"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category, Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { BrandSpinner, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const PAGE_SIZE = 18;

const FILTERS: Array<{ slug: string; label: string }> = [
  { slug: "all", label: "All" },
  { slug: "sweets", label: "Sweets" },
  { slug: "namkeen", label: "Namkeen" },
  { slug: "farsan", label: "Farsan" },
  { slug: "seasonal", label: "Seasonal" },
];

export default function MenuClient() {
  const t = useT();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [offset, setOffset] = useState(0);

  // Sync category from URL (e.g. /menu?category=sweets from home cards)
  useEffect(() => {
    const c = searchParams.get("category");
    if (c && FILTERS.some((f) => f.slug === c)) setCategory(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(
    async (nextOffset: number) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      params.set("sort", sort);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(nextOffset));
      try {
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts((prev) => (nextOffset === 0 ? data.products : [...prev, ...data.products]));
        setTotal(data.total);
      } catch {
        /* keep previous list */
      } finally {
        setLoading(false);
      }
    },
    [category, search, sort]
  );

  useEffect(() => {
    setOffset(0);
    load(0);
  }, [load]);

  const filterLabel = (slug: string) => {
    const cats = FILTERS.find((f) => f.slug === slug);
    return cats?.label ?? slug;
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">{t("menu.title")}</h1>
        <p className="mt-2 text-ink2">{t("menu.sub")}</p>
      </header>

      {/* Search */}
      <div className="relative mt-7 max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("menu.search")}
          aria-label="Search the menu"
          className="w-full rounded-full border border-linemed bg-white py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-mute"
        />
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        {FILTERS.map((f) => (
          <button
            key={f.slug}
            onClick={() => setCategory(f.slug)}
            className={cn(
              "shrink-0 rounded-full border px-4.5 py-2 text-sm font-bold transition",
              category === f.slug
                ? "border-gold bg-gold text-cocoa shadow-warm"
                : "border-linemed bg-white text-ink2 hover:border-gold hover:bg-warm"
            )}
          >
            {f.slug === "all" ? "All" : f.label}
          </button>
        ))}
        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <SlidersHorizontal size={15} className="text-mute" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
            className="rounded-full border border-linemed bg-white px-4 py-2 text-sm font-semibold text-ink2"
          >
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      {/* Mobile sort */}
      <div className="mt-3 flex items-center gap-2 lg:hidden">
        <SlidersHorizontal size={15} className="text-mute" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
          className="flex-1 rounded-full border border-linemed bg-white px-4 py-2.5 text-sm font-semibold text-ink2"
        >
          <option value="popular">Popular</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Grid */}
      {loading && products.length === 0 ? (
        <BrandSpinner label="લોડ થાય છે…" />
      ) : products.length === 0 ? (
        <div className="mt-10">
          <EmptyState emoji="🍽️" title={t("menu.empty")} sub={t("menu.emptySub")} />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-mute">
              {t("menu.showing")} {products.length} {t("menu.of")} {total} ·{" "}
              {category === "all" ? "All" : filterLabel(category)}
            </p>
            {offset + products.length < total && (
              <button
                onClick={() => {
                  const next = offset + PAGE_SIZE;
                  setOffset(next);
                  load(next);
                }}
                disabled={loading}
                className="btn-press rounded-full bg-gold px-8 py-3 text-sm font-bold text-cocoa disabled:opacity-60"
              >
                {t("menu.loadMore")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
